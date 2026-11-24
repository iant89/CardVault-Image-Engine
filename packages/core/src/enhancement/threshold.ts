import { ImageBuffer } from '../image/ImageBuffer.js';
import { toGrayscale } from './processors.js';

export type ThresholdResult = { image: ImageBuffer; threshold: number };
/** Otsu's between-class-variance threshold. Output uses 0 for dark, 255 for light. */
export function otsuThreshold(input: ImageBuffer): ThresholdResult {
  const gray=toGrayscale(input), hist=new Uint32Array(256); for(const v of gray.data)hist[v]=hist[v]!+1;
  const total=gray.data.length; let totalSum=0; for(let i=0;i<256;i++)totalSum+=i*hist[i]!;
  let backgroundWeight=0, backgroundSum=0, bestVariance=-1, threshold=0;
  for(let i=0;i<256;i++){backgroundWeight+=hist[i]!; if(!backgroundWeight)continue; const foregroundWeight=total-backgroundWeight; if(!foregroundWeight)break; backgroundSum+=i*hist[i]!; const meanB=backgroundSum/backgroundWeight, meanF=(totalSum-backgroundSum)/foregroundWeight; const between=backgroundWeight*foregroundWeight*(meanB-meanF)**2; if(between>bestVariance){bestVariance=between;threshold=i;}}
  return {image:binaryMap(gray,v=>v>threshold),threshold};
}
/** Integral-image adaptive mean threshold, suitable for uneven illumination. */
export function adaptiveMeanThreshold(input: ImageBuffer, windowSize=15, offset=7): ImageBuffer {
  validateWindow(windowSize); if(!Number.isFinite(offset))throw new RangeError('Offset must be finite');
  const gray=toGrayscale(input), w=gray.width,h=gray.height, stride=w+1, integral=new Float64Array((w+1)*(h+1));
  for(let y=1;y<=h;y++){let row=0;for(let x=1;x<=w;x++){row+=gray.data[(y-1)*w+x-1]!;integral[y*stride+x]=integral[(y-1)*stride+x]!+row;}}
  const radius=Math.floor(windowSize/2), out=new Uint8Array(w*h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const x0=Math.max(0,x-radius),x1=Math.min(w,x+radius+1),y0=Math.max(0,y-radius),y1=Math.min(h,y+radius+1);const sum=integral[y1*stride+x1]!-integral[y0*stride+x1]!-integral[y1*stride+x0]!+integral[y0*stride+x0]!;const mean=sum/((x1-x0)*(y1-y0));out[y*w+x]=gray.data[y*w+x]!>mean-offset?255:0;}
  return new ImageBuffer(w,h,out,'GRAY');
}
export function globalThreshold(input: ImageBuffer, threshold: number): ImageBuffer { if(!Number.isFinite(threshold)||threshold<0||threshold>255)throw new RangeError('Threshold must be in the range 0..255'); const gray=toGrayscale(input); return binaryMap(gray,v=>v>threshold); }
function binaryMap(gray: ImageBuffer, test: (v:number)=>boolean): ImageBuffer { const out=new Uint8Array(gray.data.length); for(let i=0;i<out.length;i++)out[i]=test(gray.data[i]!)?255:0; return new ImageBuffer(gray.width,gray.height,out,'GRAY'); }
function validateWindow(size:number):void { if(!Number.isSafeInteger(size)||size<3||size%2===0)throw new RangeError('Window size must be an odd integer of at least 3'); }
