import { ImageBuffer } from '../image/ImageBuffer.js';
import type { Point, Quad } from './types.js';

/** Orders four distinct points clockwise starting at top-left. */
export function orderCorners(points: readonly Point[]): Quad {
  if (points.length !== 4 || points.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y))) throw new TypeError('Exactly four finite corner points are required');
  const unique = new Set(points.map(p => `${p.x},${p.y}`));
  if (unique.size !== 4) throw new TypeError('Corner points must be distinct');
  const bySum = [...points].sort((a, b) => (a.x + a.y) - (b.x + b.y));
  const tl = bySum[0]!, br = bySum[3]!;
  const remaining = points.filter(p => p !== tl && p !== br).sort((a, b) => (a.y - a.x) - (b.y - b.x));
  return [tl, remaining[0]!, br, remaining[1]!]; // TL, TR, BR, BL
}

/** Returns a row-major 3x3 projective transform mapping source corners to output corners. */
export function computeHomography(corners: Quad, outputWidth: number, outputHeight: number): number[] {
  if (!Number.isSafeInteger(outputWidth) || !Number.isSafeInteger(outputHeight) || outputWidth < 1 || outputHeight < 1) throw new RangeError('Output dimensions must be positive integers');
  const target: Quad = [{x:0,y:0},{x:outputWidth-1,y:0},{x:outputWidth-1,y:outputHeight-1},{x:0,y:outputHeight-1}];
  const a: number[][] = [];
  for (let i=0;i<4;i++) { const {x,y}=corners[i]!, {x:u,y:v}=target[i]!; a.push([x,y,1,0,0,0,-u*x,-u*y,u],[0,0,0,x,y,1,-v*x,-v*y,v]); }
  const solved = solve(a); return [...solved.slice(0,6), solved[6]!, solved[7]!, 1];
}

/** Perspective-warps an image by inverse mapping output pixels and bilinear sampling. */
export function perspectiveWarp(image: ImageBuffer, corners: Quad, outputWidth: number, outputHeight: number): ImageBuffer {
  if (outputWidth * outputHeight > 100_000_000) throw new RangeError('Output exceeds the 100 megapixel safety limit');
  const h = computeHomography(corners, outputWidth, outputHeight); const inverse = invert3(h); const out = new Uint8Array(outputWidth * outputHeight * image.channels);
  for (let y=0;y<outputHeight;y++) for (let x=0;x<outputWidth;x++) {
    const den=inverse[6]!*x+inverse[7]!*y+inverse[8]!; const sx=(inverse[0]!*x+inverse[1]!*y+inverse[2]!)/den; const sy=(inverse[3]!*x+inverse[4]!*y+inverse[5]!)/den; const oi=(y*outputWidth+x)*image.channels;
    if (!Number.isFinite(sx) || !Number.isFinite(sy) || sx<0 || sy<0 || sx>image.width-1 || sy>image.height-1) continue;
    const x0=Math.floor(sx), y0=Math.floor(sy), x1=Math.min(x0+1,image.width-1), y1=Math.min(y0+1,image.height-1), dx=sx-x0, dy=sy-y0;
    for (let c=0;c<image.channels;c++) { const a=image.data[(y0*image.width+x0)*image.channels+c]!, b=image.data[(y0*image.width+x1)*image.channels+c]!, d=image.data[(y1*image.width+x0)*image.channels+c]!, e=image.data[(y1*image.width+x1)*image.channels+c]!; out[oi+c]=Math.round((a*(1-dx)+b*dx)*(1-dy)+(d*(1-dx)+e*dx)*dy); }
  }
  return new ImageBuffer(outputWidth,outputHeight,out,image.format);
}
function solve(rows: number[][]): number[] {
  const n=8; const m=rows.map(r=>[...r]);
  for(let c=0;c<n;c++){ let pivot=c; for(let r=c+1;r<n;r++)if(Math.abs(m[r]![c]!)>Math.abs(m[pivot]![c]!))pivot=r; if(Math.abs(m[pivot]![c]!)<1e-10)throw new Error('Corners do not define a stable projective transform'); [m[c],m[pivot]]=[m[pivot]!,m[c]!]; const d=m[c]![c]!; for(let j=c;j<=n;j++)m[c]![j]=m[c]![j]!/d; for(let r=0;r<n;r++)if(r!==c){const f=m[r]![c]!;for(let j=c;j<=n;j++)m[r]![j]=m[r]![j]!-f*m[c]![j]!;} }
  return m.map(r=>r[n]!);
}
function invert3(a: number[]): number[] {
  const [A,B,C,D,E,F,G,H,I]=a; const det=A!* (E!*I!-F!*H!)-B!*(D!*I!-F!*G!)+C!*(D!*H!-E!*G!);
  if(!Number.isFinite(det)||Math.abs(det)<1e-12)throw new Error('Homography is not invertible');
  return [(E!*I!-F!*H!)/det,(C!*H!-B!*I!)/det,(B!*F!-C!*E!)/det,(F!*G!-D!*I!)/det,(A!*I!-C!*G!)/det,(C!*D!-A!*F!)/det,(D!*H!-E!*G!)/det,(B!*G!-A!*H!)/det,(A!*E!-B!*D!)/det];
}
