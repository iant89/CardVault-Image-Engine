import type { ProcessingBackend } from './ProcessingBackend.js';
import type { ImageBuffer } from '../image/ImageBuffer.js';
import type { ProcessingContext,ProcessingStage } from '../core/types.js';
export class CpuBackend implements ProcessingBackend {readonly kind='CPU' as const;readonly available=true;async processStage(stage:ProcessingStage,image:ImageBuffer,context:ProcessingContext):Promise<ImageBuffer>{return await stage.process(image,context);}}
