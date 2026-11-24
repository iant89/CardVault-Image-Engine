import { ImageBuffer } from '../image/ImageBuffer.js';
import type { ProcessingContext, ProcessingStage } from '../core/types.js';
import { toGrayscale } from './processors.js';

export interface ShadowRemovalOptions { windowSize?: number; strength?: number; }
/** Corrects slowly varying illumination by dividing luminance by a local box-filter estimate. */
export function removeShadows(input: ImageBuffer, options: ShadowRemovalOptions = {}): ImageBuffer {
  const window=options.windowSize??31, strength=options.strength??0.8;
  if(!Number.isSafeInteger(window)||window<3||window%2===0)throw new RangeError('Shadow window size must be an odd integer of at least 3');
  if(!Number.isFinite(strength)||strength<0||strength>1)throw new RangeError('Shadow strength must be in the range 0..1');
  const gray=toGrayscale(input),w=input.width,h=input.height,stride=w+1,integral=new Float64Array((w+1)*(h+1));
  for(let y=1;y<=h;y++){let row=0;for(let x=1;x<=w;x++){row+=gray.data[(y-1)*w+x-1]!;integral[y*stride+x]=integral[(y-1)*stride+x]!+row;}}
  const radius=Math.floor(window/2), out=input.data.slice();
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const x0=Math.max(0,x-radius),x1=Math.min(w,x+radius+1),y0=Math.max(0,y-radius),y1=Math.min(h,y+radius+1);
    const sum=integral[y1*stride+x1]!-integral[y0*stride+x1]!-integral[y1*stride+x0]!+integral[y0*stride+x0]!;
    const local=Math.max(8,sum/((x1-x0)*(y1-y0))); const gain=(127.5/local)**strength; const scale=1+(gain-1)*strength;
    const base=(y*w+x)*input.channels; const end=input.format==='RGBA'?3:input.channels;
    for(let c=0;c<end;c++)out[base+c]=Math.max(0,Math.min(255,Math.round(input.data[base+c]!*scale)));
  }
  return new ImageBuffer(w,h,out,input.format);
}
export class ShadowRemovalStage implements ProcessingStage {
  readonly name='shadow-removal';
  constructor(readonly options:ShadowRemovalOptions={}){}
  process(image:ImageBuffer,_context:ProcessingContext):ImageBuffer{return removeShadows(image,this.options);}
}
