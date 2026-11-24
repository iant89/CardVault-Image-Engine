import { ImageBuffer } from '../image/ImageBuffer.js';
import type { ProcessingContext, ProcessingStage } from '../core/types.js';
export type MorphologyOperation='dilate'|'erode'|'open'|'close';
export interface MorphologyOptions { operation?:MorphologyOperation; radius?:number }
/** Binary morphology with a square structuring element. Non-zero pixels are foreground. */
export function morphology(input:ImageBuffer,options:MorphologyOptions={}):ImageBuffer{
 const operation=options.operation??'close',radius=options.radius??1;
 if(!Number.isSafeInteger(radius)||radius<1||radius>20)throw new RangeError('Morphology radius must be an integer from 1 to 20');
 if(input.format!=='GRAY')throw new TypeError('Morphology expects a grayscale or binary image');
 const primitive=(image:ImageBuffer,dilate:boolean)=>{const {width:w,height:h}=image,out=new Uint8Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){let value=dilate?0:255;for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=w||yy>=h){if(!dilate)value=0;continue;}const foreground=image.data[yy*w+xx]!>0;if(dilate&&foreground)value=255;if(!dilate&&!foreground)value=0;}out[y*w+x]=value;}return new ImageBuffer(w,h,out,'GRAY');};
 if(operation==='dilate')return primitive(input,true);if(operation==='erode')return primitive(input,false);if(operation==='open')return primitive(primitive(input,false),true);return primitive(primitive(input,true),false);
}
export class MorphologyStage implements ProcessingStage{readonly name='morphology';constructor(readonly options:MorphologyOptions={}){}process(image:ImageBuffer,_context:ProcessingContext):ImageBuffer{return morphology(image,this.options);}}
