import {EXTRA_WEAPON_ART} from './weapon-illustrations.mjs?v=2.2.0';
const paths={
  swords:'m5 3 16 16m-1-4-5 5M3 5l2-2 3 1-4 4-1-3zm18 0-2-2-3 1 4 4 1-3zM4 15l5 5m10-15L5 19',
  home:'m3 11 9-8 9 8M5 10v10h14V10M9 20v-6h6v6',
  paw:'M9 13c-2 2-5 3-4 6 1 3 4 2 7 2s6 1 7-2c1-3-2-4-4-6-2-2-4-2-6 0zM7 9c-3 1-4-4-2-5 3-1 4 4 2 5zm5-3c-3 0-3-5 0-5s3 5 0 5zm5 3c-2-1-1-6 2-5 2 1 1 6-2 5z',
  bag:'M5 7h14l2 14H3L5 7zM8 7V5a4 4 0 0 1 8 0v2M8 12v2m8-2v2',
  mountain:'m2 20 7-13 5 8 3-5 5 10H2zm4-7 3 2 3-2M9 7V2l5 2-5 2',
  training:'M3 8v8m3-11v14m12-14v14m3-11v8M6 12h12',
  coin:'M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0zM9 9h6v6H9z',
  spark:'m12 2 2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6L12 2z',
  heart:'M20.5 5.5c-3-3-7-1-8.5 1-1.5-2-5.5-4-8.5-1C-1 10 6 17 12 21c6-4 13-11 8.5-15.5z',
  shield:'m12 2 8 3v6c0 5-4 8-8 11-4-3-8-6-8-11V5l8-3zM8 12l3 3 5-6',
  wind:'M3 8h12c6 0 5-7 1-5M3 12h16c5 0 4 7 0 5M3 16h7c4 0 4 5 1 5',
  flame:'M13 2c1 7-6 7-4 12 2 0 4-3 4-5 7 4 9 13-1 13C0 22 3 10 7 8c0 4 1 4 2 5-1-5 4-6 4-11z',
  sun:'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1',
  leaf:'M21 3C9 2 1 7 5 16c9 4 15-3 16-13zM3 21 15 9',
  arrow:'M4 12h16m-6-6 6 6-6 6',
  chevron:'m9 5 7 7-7 7',
  refresh:'M20 9a8 8 0 0 0-14-4L3 8m0-5v5h5M4 15a8 8 0 0 0 14 4l3-3m0 5v-5h-5',
  sound:'M4 9h4l5-5v16l-5-5H4V9zm12-2a7 7 0 0 1 0 10m3-13a11 11 0 0 1 0 16',
  muted:'M4 9h4l5-5v16l-5-5H4V9zm13 1 5 5m0-5-5 5',
  help:'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zM9 9c0-5 8-4 6 0-1 2-3 2-3 5m0 3v.5',
  settings:'m9 3 1-2h4l1 2 2 1 2-1 3 4-2 2v3l2 2-3 4-2-1-2 1-1 2h-4l-1-2-2-1-2 1-3-4 2-2V9L2 7l3-4 2 1 2-1zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  check:'m5 12 4 4L20 5',
  plus:'M12 5v14M5 12h14',
  close:'m6 6 12 12M6 18 18 6',
  edit:'m4 16 12-12 4 4L8 20H4v-4zm9-9 4 4',
  trophy:'M7 3h10v7c0 7-10 7-10 0V3zm0 2H3v4c0 3 2 4 5 4m9-8h4v4c0 3-2 4-5 4M12 16v5m-5 0h10',
  gift:'M3 8h18v5H3V8zm2 5v8h14v-8M12 8v13m0-13C4 8 5 0 9 3l3 5zm0 0c8 0 7-8 3-5l-3 5z',
  clock:'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zM12 6v6l4 3',
  scroll:'M6 4h13v15a3 3 0 0 1-6 0V4a3 3 0 0 0-6 0v2H3V4a3 3 0 0 1 6 0M6 6v13h10m-7-10h7m-7 4h7',
  lock:'M5 10h14v11H5V10zm3 0V6a4 4 0 0 1 8 0v4m-4 5v2',
  download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  upload:'M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5',
  play:'m7 3 14 9-14 9V3z',
  skip:'m4 5 10 7-10 7V5zm13 0v14',
  pause:'M7 4v16M17 4v16',
  flag:'M5 22V3c6-4 9 4 15 0v11c-6 4-9-4-15 0',
  book:'M12 5C8 2 3 3 2 4v16c3-2 7-2 10 0 3-2 7-2 10 0V4c-3-2-7-2-10 1zm0 0v15',
  circle:'M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z',
  star:'m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6z',
  menu:'M4 6h16M4 12h16M4 18h16'
};
export function icon(id,cls=''){return`<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[id]||paths.spark}"/></svg>`;}
export function petArt(type='penguin',opts={}){
  const stroke='#344c45',scarf=opts.enemy?'#ba8352':'#df7b5c';let art='';
  if(type==='penguin')art=`<path d="M62 129Q23 151 45 176l28-14m105-32q41 22 18 47l-28-16" fill="#4b7279"/><path d="m83 200-20 17q-5 8 23 8l24-10m43-15 23 17q5 8-24 8l-23-10" fill="#e5b252"/><path d="M57 136C51 76 74 43 117 43c49 0 69 40 66 94 25 93-140 107-126-1z" fill="#577e85"/><path d="M74 145c-3-40 14-60 27-57 10 3 18 5 29-1 28-6 43 34 36 72-7 54-85 59-92-14z" fill="#fffcdf"/><path d="m119 45-7-16 15 12 9-14 1 20" fill="#577e85"/><path d="m111 125 14-5 14 6-14 10-14-11z" fill="#e8b54e"/><ellipse cx="94" cy="126" rx="8" ry="4" fill="#edb6a3" stroke="none"/><ellipse cx="150" cy="126" rx="8" ry="4" fill="#edb6a3" stroke="none"/><path d="M86 147q37 16 69-1l-2 14q-35 17-66-1z" fill="${scarf}"/><path d="m147 156 17 32 11-13-18-25" fill="${scarf}"/><path d="M98 105q4-4 8-1m30 0q4-3 8 0" fill="none"/><ellipse cx="103" cy="115" rx="3.5" ry="5" fill="${stroke}" stroke="none"/><ellipse cx="139" cy="115" rx="3.5" ry="5" fill="${stroke}" stroke="none"/><path d="M69 150q13 5 17 17m87-19q-13 5-16 16" fill="none"/>`;
  if(type==='panda')art=`<path d="M62 72C29 59 47 24 72 35l10 16m77-4c15-32 48-18 41 6l-15 21" fill="#465b51"/><path d="m80 189-15 23q4 14 29 8l16-17m40-12 23 19q-2 15-28 11l-13-19" fill="#465b51"/><ellipse cx="123" cy="152" rx="61" ry="59" fill="#fffbe7"/><path d="M72 136q-33 3-27 28 7 13 33 6m94-35q39 8 27 30-9 10-29 0" fill="#465b51"/><path d="M57 93Q54 44 119 42q65 0 70 51 6 52-66 54-72 0-66-54z" fill="#fffbe7"/><ellipse cx="91" cy="97" rx="19" ry="24" fill="#465b51" transform="rotate(22 91 97)"/><ellipse cx="152" cy="96" rx="19" ry="24" fill="#465b51" transform="rotate(-22 152 96)"/><ellipse cx="97" cy="96" rx="4" ry="6" fill="white" stroke="none"/><ellipse cx="146" cy="96" rx="4" ry="6" fill="white" stroke="none"/><path d="m115 116 13-1-6 7z" fill="#465b51"/><path d="m114 128 8 4 8-5" fill="none"/><path d="M78 140q40 14 87-3l-4 15q-43 16-81-2z" fill="${opts.enemy?'#c89754':'#749683'}"/><path d="m149 151 23 29 7-14-20-20" fill="#749683"/><ellipse cx="78" cy="122" rx="8" ry="4" fill="#e6b1a2" stroke="none"/><ellipse cx="162" cy="121" rx="8" ry="4" fill="#e6b1a2" stroke="none"/><path d="M107 179q15 7 28 0" fill="none"/>`;
  if(type==='cat')art=`<path d="M164 174q50 17 42-21-8-13-17-1" fill="none" stroke="#d7a166" stroke-width="18"/><path d="m82 188-10 25q4 11 24 5l13-17m34-12 23 21q-2 13-23 10l-12-17" fill="#e8b473"/><path d="M74 137q-6-37 44-39 51 0 47 40 28 76-39 76-70 0-52-77z" fill="#e5b274"/><ellipse cx="120" cy="177" rx="30" ry="32" fill="#fff1cf" stroke="none"/><path d="m70 79-8-48 43 28m34-4 36-25 3 51" fill="#e5b274"/><path d="m75 57 4 23 13-16m62 0 15-10-1 23" fill="#dda496" stroke="none"/><path d="M62 98q-3-41 56-42 61-1 65 40 2 51-61 53-62-1-60-51z" fill="#e8b87c"/><path d="m108 58 6 15m12-15-2 15m14-12-4 12" fill="none" stroke="#b77c4a" stroke-width="5"/><path d="m86 93 12-2m42 0 11 2" fill="none"/><ellipse cx="96" cy="104" rx="3.8" ry="5" fill="${stroke}" stroke="none"/><ellipse cx="144" cy="104" rx="3.8" ry="5" fill="${stroke}" stroke="none"/><path d="m115 116 10-1-5 5z" fill="#b66f64"/><path d="m109 123 10 6 12-7M78 114l-18-3m20 10-16 4m99-11 19-4m-20 11 16 4" fill="none"/><path d="M78 142q46 16 85-5l-3 14q-35 18-82 0z" fill="${scarf}"/><path d="M81 144q-44 6-31 32 13 5 35-15m74-11q38 7 34 27-13 8-36-12" fill="#e8b87c"/>`;
  if(type==='rabbit')art=`<path d="M82 82C48-18 105-10 108 71m25 0c3-103 64-90 28 15" fill="#fff2e9"/><path d="M89 62c-16-55 9-54 9 1m46 2c7-63 29-49 8 3" fill="none" stroke="#e8b2b8" stroke-width="9"/><path d="m86 194-24 20q0 12 29 8l20-15m34-13 26 19q0 13-28 9l-16-14" fill="#fff2e9"/><ellipse cx="121" cy="169" rx="52" ry="45" fill="#fff2e9"/><path d="M76 155q-38 1-29 24 11 12 32-7m82-16q36 1 32 23-13 13-35-8" fill="#fff2e9"/><path d="M60 113Q56 66 119 65q66-1 67 47-1 46-64 48-61-1-63-47z" fill="#fff2e9"/><ellipse cx="97" cy="111" rx="4" ry="6" fill="${stroke}" stroke="none"/><ellipse cx="145" cy="110" rx="4" ry="6" fill="${stroke}" stroke="none"/><path d="m116 123 10-1-5 5z" fill="#ca8d9f"/><path d="m112 132 9 4 9-5" fill="none"/><ellipse cx="80" cy="124" rx="10" ry="5" fill="#efbdbe" stroke="none"/><ellipse cx="163" cy="124" rx="10" ry="5" fill="#efbdbe" stroke="none"/><path d="M82 153q38 12 77-4l-3 13q-34 12-72 0z" fill="${opts.enemy?'#a191b5':'#bd8799'}"/><path d="m149 161 17 23 9-13-19-15" fill="#bd8799"/><path d="m113 182 8 7 9-10" fill="none"/>`;
  return`<svg viewBox="0 0 240 240" class="pet-art pet-${type}" role="img" aria-label="${{penguin:'团子企鹅',panda:'糯米熊猫',cat:'橘子猫侠',rabbit:'桃桃玉兔'}[type]||'宠物'}"><ellipse cx="122" cy="222" rx="66" ry="10" fill="#53614b" opacity=".13"/><g stroke="${stroke}" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
}
export function weaponArt(id){let art='';const outline='#4b5044';
  switch(id){
    case'fists':art='<path d="M25 55V37q0-10 9-6V24q1-10 11-5 6-11 15-2 12-4 12 8v11q17-4 15 12l-6 22-15 16H36L24 70z" fill="#e8bd85"/><path d="M34 32v18m11-30v27m15-28v28m12-12v17M37 68h25" fill="none"/><path d="M32 80h38v11H32z" fill="#cf8d6d"/>';break;
    case'bamboo':art='<path d="m32 79 8-15 30-42 6-4 1 8-29 43-12 13z" fill="#96b873"/><path d="m41 62 13 9m-7-19 14 7m-5-22 12 7m-4-19 10 6M38 69l-9 16 7 5 10-16" fill="#dfc392"/><path d="m31 64 24 15" stroke-width="5"/>';break;
    case'brick':art='<path d="m21 40 51-11 15 17-51 15-15-21z" fill="#d6a074"/><path d="m21 40 2 22 15 19-2-20z" fill="#bd7d57"/><path d="m36 61 51-15-2 24-47 11z" fill="#c58b64"/><path d="m36 48 9-2m13-3 13-3m-23 31 20-6" fill="none" stroke="#b07d59"/>';break;
    case'pan':art='<path d="m47 59-22 28 7 5 23-27" fill="#986d4e"/><circle cx="62" cy="41" r="25" fill="#6e7976"/><circle cx="62" cy="41" r="18" fill="#929e91"/><path d="m54 29 12-3" fill="none" stroke="#d0d6c2"/>';break;
    case'slipper':art='<path d="M35 76C10 56 34 9 57 18 84 28 80 63 59 82c-7 5-19 1-24-6z" fill="#8fb9a7"/><path d="M27 47q20-16 46 11l-9 15q-18-27-39-10z" fill="#e2ead0"/><path d="m42 64 9 9m-1-39 8 6" fill="none" stroke="#578876"/>';break;
    case'fish':art='<path d="m66 31 21-6-10 20" fill="#81a8ad"/><path d="M70 31c-35-22-57 0-51 29 12 17 49 12 59-16z" fill="#a9c8c5"/><path d="m29 33 3 26m10-26-4 10m16-7-8 10m13 1-9 10m-22 7-5 18 19-10" fill="#81a8ad"/><circle cx="27" cy="44" r="3" fill="#344b43"/><path d="m70 53 17 8-13 8" fill="#81a8ad"/>';break;
    case'fan':art='<path d="M52 82 10 40q31-46 78-10L52 82z" fill="#f1d4ad"/><path d="m10 40 42 42-21-61m21 61 2-66m-2 66 25-62m-25 62 36-52" fill="none" stroke="#947b56"/><path d="m23 38 12-10m8-3 15-2m9 3 9 3" stroke="#9eae86" stroke-width="7"/>';break;
    case'nunchaku':art='<path d="M38 48q4-38 26-22" fill="none" stroke="#6c8274"/><path d="m20 71 20-27 16 11-25 23z" fill="#eab66d"/><path d="m62 27 18 6-10 41-12 3z" fill="#eaa362"/><path d="m19 74-7 7m14-4-1 10m36-11-1 9m7-10 5 6" stroke="#8aa05b" stroke-width="4"/><path d="m28 58 12 6m-5-15 12 5m15-7 13 4m-14 10 10 3" fill="none"/>';break;
    case'hammer':art='<path d="m46 50-14 38 10 4 16-39" fill="#b08862"/><path d="m35 21 40 11-7 26-42-12z" fill="#ddba80"/><ellipse cx="32" cy="33" rx="9" ry="14" transform="rotate(17 32 33)" fill="#edd39c"/><ellipse cx="71" cy="45" rx="9" ry="14" transform="rotate(17 71 45)" fill="#c19765"/><path d="m43 31 15 4m-14 8 15 3" stroke="#c79c63"/>';break;
    case'umbrella':art='<path d="m57 47-17 35q-7 16-16 3" fill="none" stroke="#ab8263" stroke-width="5"/><path d="M16 38q43-41 71 18c-8-5-13-3-18 2-4-8-11-10-17-6-4-8-10-11-17-6-5-8-11-10-19-8z" fill="#dea8b3"/><path d="M57 25 35 46m22-21-5 27m5-27 12 33m-12-33 4-7" fill="none" stroke="#b9838e"/>';break;
    case'pepper':art='<path d="M67 31C19 16 54 60 20 81c44 9 67-36 47-50z" fill="#db8064"/><path d="m55 28 12 7 9-4m-12 1 8-12" fill="none" stroke="#7d9b58" stroke-width="6"/><path d="M57 43q5 20-8 25" fill="none" stroke="#f5b17f"/>';break;
    case'guitar':art='<path d="m64 19 14 7-18 31-11-7z" fill="#c19d65"/><path d="M49 46c-10-13-28 1-18 13C6 62 17 95 45 84c17-7 20-20 10-27l-6-11z" fill="#dcb680"/><circle cx="41" cy="64" r="7" fill="#8a7254"/><path d="m35 73 36-48m-38 54 13-3" fill="none"/><path d="m64 19 9-9 11 7-6 9z" fill="#8a7254"/>';break;
    case'spoon':art='<path d="m50 59-22 27 9 7 24-29z" fill="#d4af5f"/><ellipse cx="64" cy="37" rx="20" ry="28" transform="rotate(36 64 37)" fill="#efd48d"/><ellipse cx="66" cy="35" rx="12" ry="19" transform="rotate(36 66 35)" fill="#cfa356"/><path d="m50 50 8 7" fill="none" stroke="#fff2b7"/>';break;
    default:art=EXTRA_WEAPON_ART[id]||'<path d="M23 75q4-47 27-47t27 47" fill="#d6dec0"/><path d="M28 70h44"/>';
  }
  return`<svg viewBox="0 0 100 100" class="weapon-art" aria-hidden="true"><g stroke="${outline}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">${art}</g></svg>`;
}
