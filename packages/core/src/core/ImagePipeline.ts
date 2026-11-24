import { ImageBuffer } from '../image/ImageBuffer.js';
import type { ProcessingContext, ProcessingResult, ProcessingStage, StageRecord } from './types.js';
import { analyzeQuality } from '../analysis/quality.js';
import { BackendSelector } from '../backends/BackendSelector.js';

export interface PipelineOptions { debug?: boolean; backend?: 'AUTO' | 'CPU' | 'WASM' | 'WEBGPU'; minWidth?: number; minHeight?: number; maxPixels?: number; maxOutputPixels?: number; maxProcessingTimeMs?: number }
export interface PipelineProgress { stage: string; stageIndex: number; stageCount: number; phase: 'start' | 'complete'; elapsedMs: number }
export interface BatchOptions { concurrency?: number; maxJobs?: number; signal?: AbortSignal; onProgress?: (imageIndex: number, progress: PipelineProgress) => void }
export class ImagePipeline {
  readonly stages: ProcessingStage[];
  constructor(stages: readonly ProcessingStage[] = [], readonly options: PipelineOptions = {}) { this.stages = [...stages]; }
  describe(): { backend: string; debug: boolean; stages: Array<{ name: string; enabled: boolean }> } {
    return { backend: this.options.backend ?? 'AUTO', debug: this.options.debug ?? false, stages: this.stages.map(stage => ({ name: stage.name, enabled: stage.enabled !== false })) };
  }
  async processBatch(inputs: readonly ImageBuffer[], options: BatchOptions = {}): Promise<ProcessingResult[]> {
    const concurrency = options.concurrency ?? 2, maxJobs = options.maxJobs ?? 100;
    if (!Number.isSafeInteger(concurrency) || concurrency < 1 || concurrency > 32) throw new RangeError('Batch concurrency must be an integer from 1 to 32');
    if (!Number.isSafeInteger(maxJobs) || maxJobs < 1) throw new RangeError('maxJobs must be a positive integer');
    if (inputs.length > maxJobs) throw new RangeError(`Batch has ${inputs.length} jobs; configured maximum is ${maxJobs}`);
    const results = new Array<ProcessingResult>(inputs.length); let next = 0;
    const worker = async () => { while (true) { const index = next++; if (index >= inputs.length) return; const input = inputs[index]!; const runOptions: { signal?: AbortSignal; onProgress?: (progress: PipelineProgress) => void } = {};
      if (options.signal) runOptions.signal = options.signal;
      if (options.onProgress) runOptions.onProgress = progress => options.onProgress!(index, progress);
      results[index] = await this.process(input, runOptions);
    } };
    await Promise.all(Array.from({ length: Math.min(concurrency, inputs.length) }, worker));
    return results;
  }
  async process(input: ImageBuffer, runOptions: { signal?: AbortSignal; onProgress?: (progress: PipelineProgress) => void } = {}): Promise<ProcessingResult> {
    const started = now(); const original = input.clone(); const records: StageRecord[] = []; let image = input.clone();
    const context: ProcessingContext = { debug: this.options.debug ?? false, metadata: {} };
    const selection = new BackendSelector().select(this.options.backend ?? 'AUTO');
    if (runOptions.signal) context.signal = runOptions.signal;
    try {
      const timeLimit = this.options.maxProcessingTimeMs ?? 30_000, minWidth = this.options.minWidth ?? 16, minHeight = this.options.minHeight ?? 16, maxPixels = this.options.maxPixels ?? 40_000_000, maxOutputPixels = this.options.maxOutputPixels ?? maxPixels;
      if (!Number.isFinite(timeLimit) || timeLimit <= 0) throw new RangeError('maxProcessingTimeMs must be positive');
      if (![minWidth, minHeight, maxPixels, maxOutputPixels].every(value => Number.isSafeInteger(value) && value > 0)) throw new RangeError('Image limits must be positive safe integers');
      if (image.width < minWidth || image.height < minHeight) return this.failure(original, 'IMAGE_TOO_SMALL', 'Image dimensions are below the configured minimum.', started);
      if (image.width * image.height > maxPixels) return this.failure(original, 'IMAGE_TOO_LARGE', 'Image exceeds the configured pixel limit.', started);
      if (context.signal?.aborted) throw new DOMException('Processing was cancelled', 'AbortError');
      const activeStages = this.stages.map((stage, index) => ({ stage, index })).filter(({ stage }) => stage.enabled !== false);
      for (let position = 0; position < activeStages.length; position++) {
        const { stage, index } = activeStages[position]!;
        if (context.signal?.aborted) throw new DOMException('Processing was cancelled', 'AbortError');
        if (now() - started >= timeLimit) throw new Error('Maximum processing time exceeded');
        const before = image; const t = now(); runOptions.onProgress?.({ stage: stage.name, stageIndex: index, stageCount: this.stages.length, phase: 'start', elapsedMs: now() - started });
        const output = await selection.backend.processStage(stage, image, context);
        if (now() - started > timeLimit) throw new Error('Maximum processing time exceeded');
        if (!(output instanceof ImageBuffer)) throw new TypeError(`Stage ${stage.name} returned an invalid image`);
        if (output.width * output.height > maxOutputPixels) return { ...this.failure(original, 'IMAGE_TOO_LARGE', `Stage ${stage.name} output exceeds the configured pixel limit.`, started), stages: records };
        image = output; const durationMs = now() - t;
        records.push({ name: stage.name, durationMs, input: before, output, metadata: { backend: 'CPU', inputWidth: before.width, inputHeight: before.height, outputWidth: output.width, outputHeight: output.height } });
        runOptions.onProgress?.({ stage: stage.name, stageIndex: index, stageCount: this.stages.length, phase: 'complete', elapsedMs: now() - started });
      }
      return { success: true, status: 'SUCCESS', original, alignedColor: image, enhancedColor: image, stages: records, quality: analyzeQuality(image), metrics: { totalTimeMs: now() - started, backend: selection.backend.kind }, warnings: selection.warning ? [selection.warning] : [], errors: [] };
    } catch (error) {
      return { ...this.failure(original, 'PROCESSING_ERROR', error instanceof Error ? error.message : String(error), started), stages: records };
    }
  }
  private failure(original: ImageBuffer, status: ProcessingResult['status'], message: string, started: number): ProcessingResult {
    return { success: false, status, original, alignedColor: original, enhancedColor: original, stages: [], quality: analyzeQuality(original), metrics: { totalTimeMs: now() - started, backend: 'CPU' }, warnings: [], errors: [message] };
  }
}
function now(): number { return typeof performance !== 'undefined' ? performance.now() : Date.now(); }
