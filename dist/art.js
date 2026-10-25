export const WORLD = { width:1024, height:1536 };
export const art = { map:null, sheet:null, npcs:null, sheets:{} };
export async function loadArt(){
  const load = src => new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src=src;});
  [art.map,art.sheet,art.npcs]=await Promise.all([load('assets/tiholesie.png'),load('assets/elian.png'),load('assets/characters.png')]);
  if(art.sheet){art.sheets.knight=art.sheet;for(const type of ['mage','rogue']){const cv=document.createElement('canvas');cv.width=art.sheet.width;cv.height=art.sheet.height;const c=cv.getContext('2d');c.drawImage(art.sheet,0,0);const pixels=c.getImageData(0,0,cv.width,cv.height),d=pixels.data;for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2];if(d[i+3]&&g>r*1.25&&b>r*1.15){if(type==='mage'){d[i]=Math.min(255,g*1.04);d[i+1]=g*.65;d[i+2]=Math.min(255,b*1.4);}else{d[i]=g*.72;d[i+1]=g*.84;d[i+2]=Math.min(255,b*1.05);}}}c.putImageData(pixels,0,0);art.sheets[type]=cv;}}
}
const palettes={knight:['#263d32','#58795b','#8d9b73','#e9d9ad'],mage:['#2e254b','#665286','#a795c2','#e9d9ad'],rogue:['#252e38','#48586a','#87979b','#e3c79a'],liora:['#493341','#9e6586','#d5a2bc','#f3dfbf'],elder:['#343d3b','#6c7a71','#b5c2a9','#e4d8b7'],merchant:['#453223','#8d6540','#b9995b','#edd3a8'],shade:['#221e35','#443653','#75608a','#a9a0b4'],boss:['#251e35','#51405d','#8b6393','#e1b5db']};
export function sprite(c,x,y,type='knight',dir='down',t=0,scale=1,hurt=false,walking=false){
  c.save();c.translate(Math.round(x),Math.round(y));c.scale(scale,scale);c.imageSmoothingEnabled=false;
  if(art.sheet&&['knight','mage','rogue'].includes(type)){
    const cw=art.sheet.width/4,ch=art.sheet.height/4,row={down:0,left:1,right:2,up:3}[dir]??0,frame=walking?Math.floor(t*9)%4:1;
    if(hurt)c.filter='brightness(2) saturate(.4)';
    c.drawImage(art.sheets[type]||art.sheet,frame*cw,row*ch,cw,ch,-24,-46,48,48);c.restore();return;
  }
  if(art.npcs&&['liora','elder','merchant','shade','boss'].includes(type)){
    const cw=art.npcs.width/3,ch=art.npcs.height/2;let index={liora:0,elder:1,merchant:2,shade:3,boss:4}[type];if(type==='liora'&&dir==='up')index=5;
    if(hurt)c.filter='brightness(2)';if(walking)c.translate(0,Math.round(Math.sin(t*11)));
    if(dir==='left')c.scale(-1,1);c.drawImage(art.npcs,index%3*cw,Math.floor(index/3)*ch,cw,ch,-24,-46,48,48);c.restore();return;
  }
  const p=palettes[type]||palettes.knight,rect=(a,b,w,h,color)=>{c.fillStyle=hurt?'#fff1cf':color;c.fillRect(a,b,w,h);};
  const bob=walking?Math.round(Math.sin(t*15)):0,step=walking?Math.sin(t*13)*2:0;
  c.translate(0,bob);if(dir==='left')c.scale(-1,1);
  rect(-8,-11,6,9,p[0]);rect(2,-11,6,9,p[0]);rect(-8+step,-4,6,4,'#292826');rect(2-step,-4,6,4,'#292826');
  rect(-10,-24,20,17,'#161d25');rect(-8,-25,16,17,p[1]);rect(-6,-24,5,15,p[2]);rect(2,-23,5,14,p[0]);rect(-9,-15,18,3,'#80583e');rect(-1,-15,3,3,'#d3b874');
  rect(-13,-24,5,12,p[0]);rect(9,-24,5,12,p[0]);rect(-13,-14,4,4,p[3]);rect(10,-14,4,4,p[3]);
  if(type==='mage'){rect(11,-35,2,32,'#b2916c');rect(9,-37,6,5,'#c6abe2');rect(10,-39,4,3,'#e3d5fa');}
  else if(type==='knight'||type==='boss'){rect(-12,-24,7,5,'#aeb8ae');rect(-10,-25,5,2,'#e1ddbc');rect(12,-18,2,20,'#b0c5bd');rect(10,-13,6,2,'#b49b69');}
  else if(type==='rogue'){rect(12,-16,2,10,'#d0d8c5');rect(-14,-16,2,10,'#d0d8c5');}
  rect(-7,-36,14,13,'#29262c');rect(-6,-34,12,10,p[3]);rect(-6,-29,2,4,'#c19a79');rect(-7,-37,14,6,type==='liora'?'#754354':type==='elder'?'#c0c5b3':'#634936');rect(-8,-34,4,6,type==='liora'?'#8d5262':'#5d4436');rect(5,-34,3,8,type==='elder'?'#b3b9aa':'#573d34');rect(-5,-36,5,2,type==='elder'?'#d0d5c3':'#94734a');
  if(dir!=='up'){rect(-3,-29,2,2,'#253232');rect(3,-29,2,2,'#253232');rect(-1,-25,3,1,'#bd916e');}else rect(-6,-34,12,9,type==='elder'?'#b6bdab':'#644a35');
  if(type==='liora'){rect(-9,-30,3,17,'#754354');rect(7,-30,3,17,'#754354');rect(-8,-13,16,8,p[1]);rect(-10,-6,20,4,p[2]);rect(4,-34,3,3,'#e8d091');}
  if(type==='elder'){rect(-5,-25,10,5,'#c6c9b5');rect(12,-20,2,23,'#b49a70');}
  if(type==='shade'||type==='boss'){rect(-9,-37,18,13,p[0]);rect(-6,-31,3,2,'#d3b4f5');rect(3,-31,3,2,'#d3b4f5');rect(-11,-23,22,16,p[1]);rect(-13,-9,26,5,p[0]);}
  c.restore();
}
export function portrait(canvas,type){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);const s=(art.sheet&&['knight','mage','rogue'].includes(type))||art.npcs?canvas.height/49:canvas.width/35;sprite(c,canvas.width/2,canvas.height-3,type,'down',0,s);}
export function drawWorld(c,view,state){
  const {width,height,zoom,camera}=view,time=state.time;
  c.setTransform(view.dpr,0,0,view.dpr,0,0);c.clearRect(0,0,width,height);c.fillStyle='#172b22';c.fillRect(0,0,width,height);
  c.save();c.translate(width/2,height*.48);c.scale(zoom,zoom);c.translate(-camera.x,-camera.y);
  c.imageSmoothingEnabled=false;
  if(art.map)c.drawImage(art.map,0,0,WORLD.width,WORLD.height);else{c.fillStyle='#43573a';c.fillRect(0,0,1024,1536);c.fillStyle='#9c9675';c.fillRect(440,0,140,1536);}
  // A breathing seal, floating memory shards and live light sit over the painted map.
  const pulse=.5+Math.sin(time*2)*.2;
  if(state.stage!=='ending'){
    let g=c.createRadialGradient(512,94,4,512,94,80);g.addColorStop(0,`rgba(175,102,255,${pulse*.3})`);g.addColorStop(1,'rgba(145,63,255,0)');c.fillStyle=g;c.fillRect(430,12,164,164);
    c.strokeStyle=`rgba(218,173,255,${pulse})`;c.lineWidth=1;c.beginPath();c.ellipse(512,94,21+Math.sin(time)*2,27,0,0,Math.PI*2);c.stroke();
  }
  if(state.quest>=1&&state.quest<4){
    for(const shard of state.shards){if(shard.collected)continue;const y=shard.y-14+Math.sin(time*2.5+shard.x)*3;
      const g=c.createRadialGradient(shard.x,y,1,shard.x,y,35);g.addColorStop(0,'#b0eef84d');g.addColorStop(1,'#98def700');c.fillStyle=g;c.fillRect(shard.x-35,y-35,70,70);
      c.fillStyle='#a9e3dc';c.beginPath();c.moveTo(shard.x,y-8);c.lineTo(shard.x+5,y);c.lineTo(shard.x,y+8);c.lineTo(shard.x-5,y);c.fill();c.fillStyle='#e3fff3';c.fillRect(shard.x-1,y-5,2,7);
    }
  }
  if(state.quest===2){c.strokeStyle='#c891ec88';c.lineWidth=3;c.beginPath();c.moveTo(448,297);c.lineTo(574,297);c.stroke();for(let i=0;i<9;i++){c.fillStyle=`rgba(194,147,231,${.3+Math.sin(time*3+i)*.2})`;c.fillRect(449+i*15,286+Math.sin(time*4+i)*5,1,19);}}
  for(const area of state.areas){c.save();c.strokeStyle=area.friendly?'#b9e8ce':'#ed8c9e';c.fillStyle=area.friendly?'#b9e8ce12':'#ed8c9e20';c.lineWidth=1;c.beginPath();c.ellipse(area.x,area.y,area.r,area.r*.6,0,0,Math.PI*2);c.fill();c.stroke();c.restore();}
  const objects=[...state.npcs.filter(n=>!n.hidden).map(n=>({...n,kind:'npc'})),...state.enemies.filter(e=>e.hp>0&&state.stage==='playing').map(e=>({...e,kind:'enemy'})),{...state.player,kind:'player'}].sort((a,b)=>a.y-b.y);
  for(const ob of objects){
    if(ob.x<camera.x-width/zoom/2-90||ob.x>camera.x+width/zoom/2+90||ob.y<camera.y-height/zoom/2-90||ob.y>camera.y+height/zoom/2+90)continue;
    c.fillStyle='#10231666';c.beginPath();c.ellipse(ob.x,ob.y,ob.type==='boss'?20:11,4,0,0,7);c.fill();
    if(ob.kind==='player'&&state.player.invuln>0&&Math.floor(time*16)%2===0)c.globalAlpha=.5;
    sprite(c,ob.x,ob.y,ob.type,ob.dir||'down',time,ob.type==='boss'?1.65:1,ob.flash>0,ob.moving);c.globalAlpha=1;
    if(ob.kind==='enemy'&&ob.hp<ob.maxHp){c.fillStyle='#1c1c2b';c.fillRect(ob.x-13,ob.y-(ob.type==='boss'?72:48),26,3);c.fillStyle=ob.type==='boss'?'#c997bd':'#c5a7ac';c.fillRect(ob.x-13,ob.y-(ob.type==='boss'?72:48),26*ob.hp/ob.maxHp,2);}
    if(ob.kind==='npc'&&ob.marker){c.font='bold 16px Georgia';c.textAlign='center';c.fillStyle='#ead89a';c.shadowColor='#142517';c.shadowBlur=6;c.fillText(ob.marker,ob.x,ob.y-47+Math.sin(time*2)*2);c.shadowBlur=0;}
  }
  for(const fx of state.effects){
    c.save();c.globalAlpha=Math.max(0,fx.life/fx.maxLife);
    if(fx.kind==='slash'){c.translate(fx.x,fx.y-13);c.rotate(fx.angle);c.strokeStyle=fx.color;c.lineWidth=fx.heavy?5:3;c.beginPath();c.arc(0,0,fx.r,-1,1);c.stroke();c.lineWidth=1;c.strokeStyle='#fff6d6';c.beginPath();c.arc(0,0,fx.r+3,-.8,.8);c.stroke();}
    if(fx.kind==='ring'){c.strokeStyle=fx.color;c.lineWidth=2;c.beginPath();c.ellipse(fx.x,fx.y-5,fx.r*(1-fx.life/fx.maxLife)+5,(fx.r*(1-fx.life/fx.maxLife)+5)*.65,0,0,7);c.stroke();}
    if(fx.kind==='text'){c.font=`bold ${fx.big?19:13}px Georgia`;c.textAlign='center';c.fillStyle=fx.color;c.strokeStyle='#14231e';c.lineWidth=3;c.strokeText(fx.text,fx.x,fx.y);c.fillText(fx.text,fx.x,fx.y);}
    if(fx.kind==='spark'){c.fillStyle=fx.color;c.fillRect(fx.x,fx.y,fx.size||2,fx.size||2);}
    c.restore();
  }
  for(const p of state.projectiles){c.fillStyle=p.friendly?'#c3e8dc':'#c99ce7';c.beginPath();c.arc(p.x,p.y,3,0,7);c.fill();c.strokeStyle=p.friendly?'#dcf9dd99':'#d8b4f699';c.lineWidth=2;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x-p.vx*.035,p.y-p.vy*.035);c.stroke();}
  // Wind-blown flecks and fireflies keep the static terrain alive without a heavy shader.
  for(let i=0;i<36;i++){const px=(i*163+Math.sin(time*.3+i)*35)%1024,py=(i*97-time*(i%3+2)+15360)%1536;
    c.globalAlpha=.2+Math.sin(time+i)*.15;c.fillStyle=i%3===0?'#e8dba3':'#d7e5b1';c.fillRect(px,py,2,2);
  }c.globalAlpha=1;
  if(state.stage==='prologue'){const g=c.createRadialGradient(550,1310,5,550,1310,65);g.addColorStop(0,'#bb91ff55');g.addColorStop(1,'#bb91ff00');c.fillStyle=g;c.fillRect(485,1245,130,130);}
  c.restore();
}
