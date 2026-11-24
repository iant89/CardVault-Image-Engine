import { ImageBuffer } from '../image/ImageBuffer.js';
import type { CardProfile, Point } from '../geometry/types.js';
export interface CardCandidate { bounds:{x:number;y:number;width:number;height:number}; corners:readonly [Point,Point,Point,Point]; area:number; aspectRatio:number; rectangularity:number; confidence:number; rejectionReasons:string[] }
export interface DetectionOptions { minAreaRatio?:number; profile?:CardProfile; aspectTolerance?:number }
/** Extracts connected foreground components and ranks plausible card-shaped regions. Input should be a cleaned binary mask. */
export function detectCardCandidates(mask:ImageBuffer,options:DetectionOptions={}):CardCandidate[]{
 if(mask.format!=='GRAY')throw new TypeError('Card detection expects a grayscale binary mask');
 const minRatio=options.minAreaRatio??0.005,profile=options.profile, tolerance=options.aspectTolerance??profile?.tolerance??0.12;
 if(!Number.isFinite(minRatio)||minRatio<0||minRatio>=1)throw new RangeError('Minimum area ratio must be in [0, 1)');if(!Number.isFinite(tolerance)||tolerance<0||tolerance>=1)throw new RangeError('Aspect tolerance must be in [0, 1)');
 const {width:w,height:h}=mask,visited=new Uint8Array(w*h),found:CardCandidate[]=[];const threshold=Math.max(1,Math.floor(w*h*minRatio));
 for(let start=0;start<w*h;start++){if(visited[start]||mask.data[start]===0)continue;const queue=[start];visited[start]=1;let head=0,count=0,minX=w,minY=h,maxX=0,maxY=0;
  while(head<queue.length){const index=queue[head++]!,x=index%w,y=Math.floor(index/w);count++;minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=w||yy>=h)continue;const n=yy*w+xx;if(!visited[n]&&mask.data[n]!==0){visited[n]=1;queue.push(n);}}}
  const bw=maxX-minX+1,bh=maxY-minY+1,boxArea=bw*bh,ratio=Math.min(bw,bh)/Math.max(bw,bh),target=profile?Math.min(profile.aspectRatio,1/profile.aspectRatio):0.714,ratioError=Math.abs(ratio-target)/target,areaRatio=boxArea/(w*h),rectangularity=count/boxArea;
  if(boxArea<threshold)continue;const areaScore=Math.min(1,Math.sqrt(areaRatio/0.35)),shapeScore=Math.max(0,1-ratioError/Math.max(tolerance,0.01)),fillScore=Math.min(1,rectangularity/0.55);const confidence=Math.max(0,Math.min(1,0.25*areaScore+0.45*shapeScore+0.30*fillScore));const rejectionReasons:string[]=[];if(ratioError>tolerance)rejectionReasons.push('aspect-ratio-out-of-range');if(rectangularity<0.2)rejectionReasons.push('low-rectangularity');
  found.push({bounds:{x:minX,y:minY,width:bw,height:bh},corners:[{x:minX,y:minY},{x:maxX,y:minY},{x:maxX,y:maxY},{x:minX,y:maxY}],area:boxArea,aspectRatio:ratio,rectangularity,confidence,rejectionReasons});
 }
 return found.sort((a,b)=>b.confidence-a.confidence);
}
