import { ImageBuffer } from '../image/ImageBuffer.js';
import type { ProcessingContext,ProcessingStage } from '../core/types.js';
import type { DetectionOptions,CardCandidate } from './cardDetector.js';
import { detectCardCandidates } from './cardDetector.js';
/** Adds ranked candidate diagnostics to pipeline context while passing the mask through unchanged. */
export class CardDetectionStage implements ProcessingStage {
 readonly name='card-detection';enabled=true;
 constructor(readonly options:DetectionOptions={}){}
 process(image:ImageBuffer,context:ProcessingContext):ImageBuffer{const candidates:CardCandidate[]=detectCardCandidates(image,this.options);context.metadata['cardCandidates']=candidates;context.metadata['selectedCardCandidate']=candidates[0]??null;return image;}
}
