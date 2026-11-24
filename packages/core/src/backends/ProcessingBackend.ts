import type { ImageBuffer } from '../image/ImageBuffer.js';
import type { ProcessingContext,ProcessingStage } from '../core/types.js';
export type BackendKind='CPU'|'WASM'|'WEBGPU';
export interface ProcessingBackend {readonly kind:BackendKind;readonly available:boolean;processStage(stage:ProcessingStage,image:ImageBuffer,context:ProcessingContext):Promise<ImageBuffer>}
