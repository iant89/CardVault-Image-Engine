import {ImageBuffer}from'../image/ImageBuffer.js';
import type{Point,Quad}from'../geometry/types.js';
export interface SyntheticCardInstance{corners:Quad;value?:number}
export interface SyntheticCardFixtureOptions{width?:number;height?:number;corners?:Quad;cards?:readonly SyntheticCardInstance[];center?:Point;cardWidth?:number;cardHeight?:number;angleDegrees?:number;background?:number;cardValue?:number;shadowStrength?:number;backgroundGradient?:number;noise?:number;seed?:number}
/** Deterministic, non-copyrighted scenes for alignment and detector regression tests. */
export function createSyntheticCardScene(options:SyntheticCardFixtureOptions={}):ImageBuffer{
 const width=options.width??160,height=options.height??160,background=options.background??28,shadow=options.shadowStrength??0,gradient=options.backgroundGradient??0,noise=options.noise??0;
 if(!Number.isFinite(noise)||noise<0||noise>100)throw new RangeError('noise must be between 0 and 100');
 const cards=options.cards??[{corners:options.corners??rotatedCorners(options.center??{x:80,y:78},options.cardWidth??63,options.cardHeight??97,options.angleDegrees??0),value:options.cardValue??224}],data=new Uint8Array(width*height*3);let random=(options.seed??17)>>>0;
 const nextRandom=()=>{random=(1664525*random+1013904223)>>>0;return random/4294967296;};
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(y*width+x)*3;let value=background+shadow*y/height+gradient*x/width;for(const card of cards)if(contains({x:x+.5,y:y+.5},card.corners)){value=(card.value??224)-shadow*(1-y/height);break;}if(noise)value+=(nextRandom()*2-1)*noise;const px=Math.max(0,Math.min(255,Math.round(value)));data[i]=data[i+1]=data[i+2]=px;}
 return new ImageBuffer(width,height,data,'RGB');
}
export function rotatedCorners(center:Point,width:number,height:number,angleDegrees:number):Quad{const angle=angleDegrees*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle),coords:[number,number][]=[[-width/2,-height/2],[width/2,-height/2],[width/2,height/2],[-width/2,height/2]];return coords.map(([x,y])=>({x:center.x+x*c-y*s,y:center.y+x*s+y*c})) as unknown as Quad;}
function contains(p:Point,polygon:Quad):boolean{let inside=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[i]!,b=polygon[j]!;if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)inside=!inside;}return inside;}
