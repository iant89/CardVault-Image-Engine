import type { CardProfile } from './types.js';
export const STANDARD_TRADING_CARD_PROFILE:CardProfile=Object.freeze({name:'standard-trading-card',aspectRatio:0.714,tolerance:0.12,targetWidth:744,targetHeight:1040});
export const POKEMON_CARD_PROFILE:CardProfile=Object.freeze({name:'pokemon',aspectRatio:63/88,tolerance:0.12,targetWidth:744,targetHeight:1040});
export const MAGIC_CARD_PROFILE:CardProfile=Object.freeze({name:'magic-the-gathering',aspectRatio:63/88,tolerance:0.12,targetWidth:744,targetHeight:1040});
export const YUGIOH_CARD_PROFILE:CardProfile=Object.freeze({name:'yu-gi-oh',aspectRatio:59/86,tolerance:0.12,targetWidth:714,targetHeight:1040});
export const SPORTS_CARD_PROFILE:CardProfile=Object.freeze({name:'sports',aspectRatio:2.5/3.5,tolerance:0.12,targetWidth:744,targetHeight:1040});
export function createCardProfile(profile:CardProfile):CardProfile{
 if(!profile.name.trim())throw new TypeError('Card profile name cannot be empty');
 if(!Number.isFinite(profile.aspectRatio)||profile.aspectRatio<=0||profile.aspectRatio>1)throw new RangeError('Card aspect ratio must be greater than 0 and at most 1');
 if(!Number.isFinite(profile.tolerance)||profile.tolerance<0||profile.tolerance>=1)throw new RangeError('Card profile tolerance must be in [0, 1)');
 if(!Number.isSafeInteger(profile.targetWidth)||!Number.isSafeInteger(profile.targetHeight)||profile.targetWidth<1||profile.targetHeight<1)throw new RangeError('Card target dimensions must be positive safe integers');
 return Object.freeze({...profile});
}
export function isAspectRatioCompatible(measuredRatio:number,profile:CardProfile):boolean{
 if(!Number.isFinite(measuredRatio)||measuredRatio<=0) return false;
 const expected=Math.min(profile.aspectRatio,1/profile.aspectRatio),actual=Math.min(measuredRatio,1/measuredRatio);
 return Math.abs(actual-expected)/expected<=profile.tolerance;
}
