import { ImagePipeline,type BatchOptions,type PipelineOptions,type PipelineProgress } from './ImagePipeline.js';
import type { ProcessingResult,ProcessingStage } from './types.js';
import type { ImageBuffer } from '../image/ImageBuffer.js';
export interface ImageEngineOptions { stages?:readonly ProcessingStage[]; pipelineOptions?:PipelineOptions; pipeline?:ImagePipeline }
/** Stable high-level public API; the default engine preserves pixels and reports quality until stages are configured. */
export class ImageEngine {
 readonly pipeline:ImagePipeline;
 constructor(options:ImageEngineOptions={}){if(options.pipeline&&options.stages)throw new TypeError('Specify either a pipeline or stages, not both');this.pipeline=options.pipeline??new ImagePipeline(options.stages??[],options.pipelineOptions);}
 process(image:ImageBuffer,options:{signal?:AbortSignal;onProgress?:(progress:PipelineProgress)=>void}={}):Promise<ProcessingResult>{return this.pipeline.process(image,options);}
 processBatch(images:readonly ImageBuffer[],options:BatchOptions={}):Promise<ProcessingResult[]>{return this.pipeline.processBatch(images,options);}
 describe():ReturnType<ImagePipeline['describe']>{return this.pipeline.describe();}
}
