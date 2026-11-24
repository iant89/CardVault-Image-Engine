import { ImageBuffer } from '../image/ImageBuffer.js';
import type { CardProfile,Point,Quad } from '../geometry/types.js';
import { orderCorners } from '../geometry/perspective.js';
export interface CardCandidate { bounds:{x:number;y:number;width:number;height:number}; corners:Quad; area:number; aspectRatio:number; rectangularity:number; confidence:number; rejectionReasons:string[] }
export interface DetectionOptions { minAreaRatio?:number; profile?:CardProfile; aspectTolerance?:number }
/** Finds connected mask regions, estimates a convex four-corner contour, and ranks card-like candidates. */
export function detectCardCandidates(mask:ImageBuffer,options:DetectionOptions={}):CardCandidate[]{
 if(mask.format!=='GRAY')throw new TypeError('Card detection expects a grayscale binary mask');
 const minRatio=options.minAreaRatio??0.005,profile=options.profile,tolerance=options.aspectTolerance??profile?.tolerance??0.12;
 if(!Number.isFinite(minRatio)||minRatio<0||minRatio>=1)throw new RangeError('Minimum area ratio must be in [0, 1)');if(!Number.isFinite(tolerance)||tolerance<0||tolerance>=1)throw new RangeError('Aspect tolerance must be in [0, 1)');
 const {width:w,height:h}=mask,visited=new Uint8Array(w*h),found:CardCandidate[]=[];const threshold=Math.max(1,Math.floor(w*h*minRatio));
 for(let start=0;start<w*h;start++){if(visited[start]||mask.data[start]===0)continue;const queue=[start],boundary:Point[]=[];visited[start]=1;let head=0,count=0,minX=w,minY=h,maxX=0,maxY=0;
  while(head<queue.length){const index=queue[head++]!,x=index%w,y=Math.floor(index/w);count++;minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);let edge=false;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(dx===0&&dy===0)continue;const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=w||yy>=h){edge=true;continue;}const n=yy*w+xx;if(mask.data[n]===0)edge=true;else if(!visited[n]){visited[n]=1;queue.push(n);}}if(edge)boundary.push({x,y});}
  const bw=maxX-minX+1,bh=maxY-minY+1,boxArea=bw*bh;if(boxArea<threshold)continue;
  const hull=convexHull(boundary),corners=toQuad(hull,minX,minY,maxX,maxY);const top=distance(corners[0],corners[1]),right=distance(corners[1],corners[2]),bottom=distance(corners[2],corners[3]),left=distance(corners[3],corners[0]);const cardWidth=(top+bottom)/2,cardHeight=(left+right)/2,ratio=Math.min(cardWidth,cardHeight)/Math.max(cardWidth,cardHeight),target=profile?Math.min(profile.aspectRatio,1/profile.aspectRatio):0.714,ratioError=Math.abs(ratio-target)/target;
  const polygonArea=Math.max(1,Math.abs(signedArea(corners))),rectangularity=Math.min(1,count/polygonArea),areaRatio=boxArea/(w*h);const areaScore=Math.min(1,Math.sqrt(areaRatio/0.35)),shapeScore=Math.max(0,1-ratioError/Math.max(tolerance,0.01)),fillScore=Math.min(1,rectangularity/0.85);const confidence=Math.max(0,Math.min(1,0.25*areaScore+0.45*shapeScore+0.30*fillScore));const rejectionReasons:string[]=[];if(ratioError>tolerance)rejectionReasons.push('aspect-ratio-out-of-range');if(rectangularity<0.35)rejectionReasons.push('low-rectangularity');
  found.push({bounds:{x:minX,y:minY,width:bw,height:bh},corners,area:boxArea,aspectRatio:ratio,rectangularity,confidence,rejectionReasons});
 }
 return found.sort((a,b)=>b.confidence-a.confidence);
}
function convexHull(points:Point[]):Point[]{const unique=[...new Map(points.map(p=>[`${p.x},${p.y}`,p])).values()].sort((a,b)=>a.x-b.x||a.y-b.y);if(unique.length<=4)return unique;const cross=(o:Point,a:Point,b:Point)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);const lower:Point[]=[],upper:Point[]=[];for(const p of unique){while(lower.length>=2&&cross(lower[lower.length-2]!,lower[lower.length-1]!,p)<=0)lower.pop();lower.push(p);}for(const p of [...unique].reverse()){while(upper.length>=2&&cross(upper[upper.length-2]!,upper[upper.length-1]!,p)<=0)upper.pop();upper.push(p);}lower.pop();upper.pop();return[...lower,...upper];}
function toQuad(hull:Point[],minX:number,minY:number,maxX:number,maxY:number):Quad{if(hull.length<4)return[{x:minX,y:minY},{x:maxX,y:minY},{x:maxX,y:maxY},{x:minX,y:maxY}];const points=[...hull];while(points.length>4){let remove=0,least=Infinity;for(let i=0;i<points.length;i++){const a=points[(i+points.length-1)%points.length]!,b=points[i]!,c=points[(i+1)%points.length]!,cost=Math.abs((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x));if(cost<least){least=cost;remove=i;}}points.splice(remove,1);}try{return orderCorners(points);}catch{return[{x:minX,y:minY},{x:maxX,y:minY},{x:maxX,y:maxY},{x:minX,y:maxY}];}}
function distance(a:Point,b:Point):number{return Math.hypot(b.x-a.x,b.y-a.y);}
function signedArea(points:Quad):number{let area=0;for(let i=0;i<4;i++){const a=points[i]!,b=points[(i+1)%4]!;area+=a.x*b.y-b.x*a.y;}return area/2;}
