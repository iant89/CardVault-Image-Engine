import { ImageBuffer } from '../image/ImageBuffer.js';
import { toGrayscale } from './processors.js';
export interface LocalThresholdOptions { windowSize?: number; k?: number; dynamicRange?: number }
/** Niblack local threshold: T = local mean + k * local standard deviation. */
export function niblackThreshold(input:ImageBuffer,options:LocalThresholdOptions={}):ImageBuffer{return localThreshold(input,options,'niblack');}
/** Sauvola local threshold: T = mean * (1 + k * (stddev / R - 1)). */
export function sauvolaThreshold(input:ImageBuffer,options:LocalThresholdOptions={}):ImageBuffer{return localThreshold(input,options,'sauvola');}
function localThreshold(input:ImageBuffer,options:LocalThresholdOptions,method:'niblack'|'sauvola'):ImageBuffer{
 const size=options.windowSize??15,k=options.k??(method==='sauvola'?0.2:-0.2),range=options.dynamicRange??128;
 if(!Number.isSafeInteger(size)||size<3||size%2===0)throw new RangeError('Window size must be an odd integer of at least 3');
 if(!Number.isFinite(k))throw new RangeError('k must be finite');if(!Number.isFinite(range)||range<=0)throw new RangeError('Dynamic range must be positive');
 const gray=toGrayscale(input),w=gray.width,h=gray.height,stride=w+1,sum=new Float64Array((w+1)*(h+1)),squares=new Float64Array((w+1)*(h+1));
 for(let y=1;y<=h;y++){let row=0,rowSq=0;for(let x=1;x<=w;x++){const value=gray.data[(y-1)*w+x-1]!;row+=value;rowSq+=value*value;const i=y*stride+x;sum[i]=sum[(y-1)*stride+x]!+row;squares[i]=squares[(y-1)*stride+x]!+rowSq;}}
 const radius=Math.floor(size/2),out=new Uint8Array(w*h);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const x0=Math.max(0,x-radius),x1=Math.min(w,x+radius+1),y0=Math.max(0,y-radius),y1=Math.min(h,y+radius+1),area=(x1-x0)*(y1-y0);const total=rect(sum,stride,x0,y0,x1,y1),totalSq=rect(squares,stride,x0,y0,x1,y1),mean=total/area,std=Math.sqrt(Math.max(0,totalSq/area-mean*mean));const threshold=method==='niblack'?mean+k*std:mean*(1+k*(std/range-1));out[y*w+x]=gray.data[y*w+x]!>threshold?255:0;}
 return new ImageBuffer(w,h,out,'GRAY');
}
function rect(table:Float64Array,stride:number,x0:number,y0:number,x1:number,y1:number):number{return table[y1*stride+x1]!-table[y0*stride+x1]!-table[y1*stride+x0]!+table[y0*stride+x0]!;}
