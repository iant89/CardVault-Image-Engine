import { ImageBuffer } from './ImageBuffer.js';
import type { ProcessingContext,ProcessingStage } from '../core/types.js';
export interface ResizeOptions { width:number;height:number }
/** Bilinear CPU resize. Output dimensions are explicit to avoid hidden aspect-ratio assumptions. */
export function resizeImage(input:ImageBuffer,width:number,height:number):ImageBuffer{
 if(!Number.isSafeInteger(width)||!Number.isSafeInteger(height)||width<1||height<1)throw new RangeError('Resize dimensions must be positive safe integers');
 if(width*height>100_000_000)throw new RangeError('Resized output exceeds the 100 megapixel safety limit');
 const output=new Uint8Array(width*height*input.channels),channels=input.channels;
 for(let y=0;y<height;y++){const sy=Math.max(0,Math.min(input.height-1,(y+.5)*input.height/height-.5)),y0=Math.floor(sy),y1=Math.min(y0+1,input.height-1),fy=sy-y0;
  for(let x=0;x<width;x++){const sx=Math.max(0,Math.min(input.width-1,(x+.5)*input.width/width-.5)),x0=Math.floor(sx),x1=Math.min(x0+1,input.width-1),fx=sx-x0,oi=(y*width+x)*channels;
   for(let c=0;c<channels;c++){const a=input.data[(y0*input.width+x0)*channels+c]!,b=input.data[(y0*input.width+x1)*channels+c]!,d=input.data[(y1*input.width+x0)*channels+c]!,e=input.data[(y1*input.width+x1)*channels+c]!;output[oi+c]=Math.round((a*(1-fx)+b*fx)*(1-fy)+(d*(1-fx)+e*fx)*fy);}
  }
 }
 return new ImageBuffer(width,height,output,input.format);
}
export class ResizeStage implements ProcessingStage{readonly name='resize';enabled=true;constructor(readonly options:ResizeOptions){}process(image:ImageBuffer,_context:ProcessingContext):ImageBuffer{return resizeImage(image,this.options.width,this.options.height);}}
