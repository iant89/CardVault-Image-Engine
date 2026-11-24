import { ImageBuffer } from '../image/ImageBuffer.js';
import type { ProcessingContext, ProcessingStage } from '../core/types.js';
import { toGrayscale } from '../enhancement/processors.js';
export interface EdgeOptions { threshold?:number; }
/** Sobel gradient magnitude with a fixed 0..255 cutoff; output pixels are binary edges. */
export function sobelEdges(input:ImageBuffer,options:EdgeOptions={}):ImageBuffer{
 const threshold=options.threshold??72;if(!Number.isFinite(threshold)||threshold<0||threshold>255)throw new RangeError('Edge threshold must be between 0 and 255');
 const gray=toGrayscale(input),w=gray.width,h=gray.height,out=new Uint8Array(w*h);
 for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=y*w+x;const a=gray.data[i-w-1]!,b=gray.data[i-w]!,c=gray.data[i-w+1]!,d=gray.data[i-1]!,f=gray.data[i+1]!,g=gray.data[i+w-1]!,j=gray.data[i+w]!,k=gray.data[i+w+1]!;const gx=-a+c-2*d+2*f-g+k,gy=-a-2*b-c+g+2*j+k;const magnitude=Math.min(255,Math.hypot(gx,gy)/4);out[i]=magnitude>=threshold?255:0;}
 return new ImageBuffer(w,h,out,'GRAY');
}
export class SobelEdgeStage implements ProcessingStage{readonly name='sobel-edge-detection';constructor(readonly options:EdgeOptions={}){}process(image:ImageBuffer,_context:ProcessingContext):ImageBuffer{return sobelEdges(image,this.options);}}
