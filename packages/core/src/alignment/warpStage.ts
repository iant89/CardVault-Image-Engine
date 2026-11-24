import { ImageBuffer } from '../image/ImageBuffer.js';
import type { ProcessingContext, ProcessingStage } from '../core/types.js';
import type { CardProfile, Quad } from '../geometry/types.js';
import { computeHomography, perspectiveWarp } from '../geometry/perspective.js';
export interface PerspectiveWarpOptions { corners:Quad; width?:number; height?:number; profile?:CardProfile }
/** Applies a supplied four-corner alignment as a pipeline stage. */
export class PerspectiveWarpStage implements ProcessingStage {
 readonly name='perspective-warp'; readonly geometry: { corners:Quad; homography:number[]; width:number; height:number };
 constructor(readonly options:PerspectiveWarpOptions){const width=options.width??options.profile?.targetWidth,height=options.height??options.profile?.targetHeight;if(!width||!height)throw new RangeError('Specify output width and height or a card profile');this.geometry={corners:options.corners,homography:computeHomography(options.corners,width,height),width,height};}
 process(image:ImageBuffer,_context:ProcessingContext):ImageBuffer{return perspectiveWarp(image,this.options.corners,this.geometry.width,this.geometry.height);}
}
