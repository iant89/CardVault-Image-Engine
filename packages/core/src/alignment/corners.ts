import { ImageBuffer } from '../image/ImageBuffer.js';
import { toGrayscale } from '../enhancement/processors.js';
import type { Point, Quad } from '../geometry/types.js';
export interface CornerOptions { searchRadius?:number; windowRadius?:number }
/** Harris-response corner refinement around the four initial candidate corners. */
export function refineCorners(image:ImageBuffer,initial:Quad,options:CornerOptions={}):Quad{
 const search=options.searchRadius??8,window=options.windowRadius??2;
 if(!Number.isSafeInteger(search)||search<0)throw new RangeError('Search radius must be a non-negative integer');if(!Number.isSafeInteger(window)||window<1)throw new RangeError('Window radius must be a positive integer');
 const gray=toGrayscale(image),w=gray.width,h=gray.height, corners:Point[]=[];
 for(const point of initial){let best=point,bestScore=-Infinity;const cx=Math.round(point.x),cy=Math.round(point.y);
  for(let y=Math.max(1,cy-search);y<=Math.min(h-2,cy+search);y++)for(let x=Math.max(1,cx-search);x<=Math.min(w-2,cx+search);x++){
   let xx=0,yy=0,xy=0;for(let wy=Math.max(1,y-window);wy<=Math.min(h-2,y+window);wy++)for(let wx=Math.max(1,x-window);wx<=Math.min(w-2,x+window);wx++){const i=wy*w+wx,gx=gray.data[i+1]!-gray.data[i-1]!,gy=gray.data[i+w]!-gray.data[i-w]!;xx+=gx*gx;yy+=gy*gy;xy+=gx*gy;}
   const det=xx*yy-xy*xy,trace=xx+yy,score=det-0.04*trace*trace;if(score>bestScore){bestScore=score;best={x,y};}
  }
  corners.push(best);
 }
 if(new Set(corners.map(p=>`${p.x},${p.y}`)).size!==4)return initial;
 return corners as unknown as Quad;
}
