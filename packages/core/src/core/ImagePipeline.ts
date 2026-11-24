import { ImageBuffer } from '../image/ImageBuffer.js';
import type { ProcessingContext, ProcessingResult, ProcessingStage, StageRecord } from './types.js';
import { analyzeQuality } from '../analysis/quality.js';
import { BackendSelector } from '../backends/BackendSelector.js';

export interface PipelineOptions { debug?: boolean; backend?: 'AUTO' | 'CPU' | 'WASM' | 'WEBGPU'; minWidth?: number; minHeight?: number; maxPixels?: number }
export interface PipelineProgress { stage: string; stageIndex: number; stageCount: number; phase: 'start' | 'complete'; elapsedMs: number }
export class ImagePipeline {
  readonly stages: ProcessingStage[];
  constructor(stages: readonly ProcessingStage[] = [], readonly options: PipelineOptions = {}) { this.stages = [...stages]; }
  describe(): { backend: string; debug: boolean; stages: Array<{ name: string; enabled: boolean }> } {
    return { backend: this.options.backend ?? 'AUTO', debug: this.options.debug ?? false, stages: this.stages.map(stage => ({ name: stage.name, enabled: stage.enabled !== false })) };
  }
  async process(input: ImageBuffer, runOptions: { signal?: AbortSignal; onProgress?: (progress: PipelineProgress) => void } = {}): Promise<ProcessingResult> {
    const started = now(); const original = input.clone(); const records: StageRecord[] = []; let image = input.clone();
    const context: ProcessingContext = { debug: this.options.debug ?? false, metadata: {} };
    const selection = new BackendSelector().select(this.options.backend ?? 'AUTO');
    if (runOptions.signal) context.signal = runOptions.signal;
    try {
      if (image.width < (this.options.minWidth ?? 16) || image.height < (this.options.minHeight ?? 16)) return this.failure(original, 'IMAGE_TOO_SMALL', 'Image dimensions are below the configured minimum.', started);
      if (image.width * image.height > (this.options.maxPixels ?? 40_000_000)) return this.failure(original, 'IMAGE_TOO_LARGE', 'Image exceeds the configured pixel limit.', started);
      if (context.signal?.aborted) throw new DOMException('Processing was cancelled', 'AbortError');
      const activeStages = this.stages.map((stage, index) => ({ stage, index })).filter(({ stage }) => stage.enabled !== false);
      for (let position = 0; position < activeStages.length; position++) {
        const { stage, index } = activeStages[position]!;
        if (context.signal?.aborted) throw new DOMException('Processing was cancelled', 'AbortError');
        const before = image; const t = now(); runOptions.onProgress?.({ stage: stage.name, stageIndex: index, stageCount: this.stages.length, phase: 'start', elapsedMs: now() - started });
        const output = await selection.backend.processStage(stage, image, context);
        if (!(output instanceof ImageBuffer)) throw new TypeError(`Stage ${stage.name} returned an invalid image`);
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
