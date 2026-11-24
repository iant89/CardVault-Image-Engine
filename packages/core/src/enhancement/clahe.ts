import { ImageBuffer } from '../image/ImageBuffer.js';

export interface ClaheOptions { tileSize?: number; clipLimit?: number }
/** Contrast-limited adaptive histogram equalization. RGB/RGBA chroma is preserved via luminance scaling. */
export function clahe(input: ImageBuffer, options: ClaheOptions = {}): ImageBuffer {
  const tileSize=options.tileSize??32, clipLimit=options.clipLimit??2;
  if(!Number.isSafeInteger(tileSize)||tileSize<2)throw new RangeError('CLAHE tile size must be an integer of at least 2');
  if(!Number.isFinite(clipLimit)||clipLimit<=0)throw new RangeError('CLAHE clip limit must be positive');
  const w=input.width,h=input.height,cols=Math.ceil(w/tileSize),rows=Math.ceil(h/tileSize), lum=new Uint8Array(w*h), maps:Uint8Array[]=[];
  for(let p=0;p<w*h;p++){const i=p*input.channels;lum[p]=input.format==='GRAY'?input.data[i]!:Math.round(.2126*input.data[i]!+.7152*input.data[i+1]!+.0722*input.data[i+2]!);}
  for(let ty=0;ty<rows;ty++)for(let tx=0;tx<cols;tx++){
    const x0=tx*tileSize,y0=ty*tileSize,x1=Math.min(w,x0+tileSize),y1=Math.min(h,y0+tileSize),area=(x1-x0)*(y1-y0),hist=new Uint32Array(256);
    for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)hist[lum[y*w+x]!]=hist[lum[y*w+x]!]!+1;
    const limit=Math.max(1,Math.floor(clipLimit*area/256));let excess=0;for(let i=0;i<256;i++)if(hist[i]!>limit){excess+=hist[i]!-limit;hist[i]=limit;}
    const each=Math.floor(excess/256),remainder=excess%256;for(let i=0;i<256;i++)hist[i]=hist[i]!+each+(i<remainder?1:0);
    const lut=new Uint8Array(256);let cumulative=0;for(let i=0;i<256;i++){cumulative+=hist[i]!;lut[i]=Math.max(0,Math.min(255,Math.round(cumulative*255/area)));}maps.push(lut);
  }
  const out=input.data.slice();
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const gx=Math.max(0,Math.min(cols-1,(x+.5)/tileSize-.5)),gy=Math.max(0,Math.min(rows-1,(y+.5)/tileSize-.5)),x0=Math.floor(gx),y0=Math.floor(gy),x1=Math.min(cols-1,x0+1),y1=Math.min(rows-1,y0+1),fx=gx-x0,fy=gy-y0, value=lum[y*w+x]!;
    const a=maps[y0*cols+x0]![value]!,b=maps[y0*cols+x1]![value]!,c=maps[y1*cols+x0]![value]!,d=maps[y1*cols+x1]![value]!;const enhanced=(a*(1-fx)+b*fx)*(1-fy)+(c*(1-fx)+d*fx)*fy;
    const scale=lum[y*w+x]!?enhanced/lum[y*w+x]!:0,base=(y*w+x)*input.channels,end=input.format==='RGBA'?3:input.channels;
    for(let ch=0;ch<end;ch++)out[base+ch]=lum[y*w+x]!?Math.max(0,Math.min(255,Math.round(input.data[base+ch]!*scale))):Math.round(enhanced);
  }
  return new ImageBuffer(w,h,out,input.format);
}
