import { ImageBuffer } from '../image/ImageBuffer.js';
import type { ProcessingContext,ProcessingStage } from '../core/types.js';
import { sobelEdges } from './edges.js';
import { morphology } from './morphology.js';
import { detectCardCandidates,type DetectionOptions } from './cardDetector.js';
import { computeHomography,perspectiveWarp } from '../geometry/perspective.js';
import { STANDARD_TRADING_CARD } from '../geometry/types.js';
import type { CardProfile } from '../geometry/types.js';
export interface AutomaticAlignmentOptions { profile?:CardProfile; edgeThreshold?:number; morphologyRadius?:number; minAreaRatio?:number; minConfidence?:number }
/** Heuristic full-frame alignment stage; assumes the strongest card boundary is visible in the Sobel mask. */
export class AutomaticCardAlignmentStage implements ProcessingStage {
 readonly name='automatic-card-alignment';enabled=true;
 constructor(readonly options:AutomaticAlignmentOptions={}){}
 process(image:ImageBuffer,context:ProcessingContext):ImageBuffer{
  const profile=this.options.profile??STANDARD_TRADING_CARD,threshold=this.options.edgeThreshold??48,radius=this.options.morphologyRadius??1,minConfidence=this.options.minConfidence??0.25;
  if(!Number.isFinite(minConfidence)||minConfidence<0||minConfidence>1)throw new RangeError('minConfidence must be in [0,1]');
  const edges=sobelEdges(image,{threshold}),joined=morphology(edges,{operation:'close',radius});
  const detectOptions:DetectionOptions={minAreaRatio:this.options.minAreaRatio??0.015,profile};const candidates=detectCardCandidates(joined,detectOptions);
  context.metadata['cardCandidates']=candidates;
  const selected=candidates[0];context.metadata['selectedCardCandidate']=selected??null;
  if(!selected){context.metadata['alignmentStatus']='CARD_NOT_FOUND';return image;}
  if(selected.confidence<minConfidence){context.metadata['alignmentStatus']='LOW_CONFIDENCE';return image;}
  const output=perspectiveWarp(image,selected.corners,profile.targetWidth,profile.targetHeight);
  context.metadata['cardGeometry']={corners:selected.corners,homography:computeHomography(selected.corners,profile.targetWidth,profile.targetHeight),rotation:0,width:profile.targetWidth,height:profile.targetHeight,confidence:selected.confidence};
  return output;
 }
}
