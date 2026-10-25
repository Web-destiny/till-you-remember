const tau=Math.PI*2;
function diamond(c,x,y,w,h,color){c.fillStyle=color;c.beginPath();c.moveTo(x,y-h);c.lineTo(x+w,y);c.lineTo(x,y+h);c.lineTo(x-w,y);c.closePath();c.fill();}
function cross(c,x,y,size,color){c.fillStyle=color;c.fillRect(x-1,y-size,2,size*2);c.fillRect(x-size*.6,y-size*.4,size*1.2,2);}
export function drawProjectile(c,p){
 c.save();c.translate(p.x,p.y);c.rotate(Math.atan2(p.vy,p.vx));
 if(p.kind==='knife'){c.fillStyle='#b3c4d2';c.beginPath();c.moveTo(10,0);c.lineTo(-3,-3);c.lineTo(-1,0);c.lineTo(-3,3);c.closePath();c.fill();c.fillStyle='#f4f3dc';c.fillRect(0,-1,7,1);c.fillStyle='#805936';c.fillRect(-8,-1,5,2);c.fillStyle='#d2b67e';c.fillRect(-4,-3,1,6);}
 else if(p.kind==='firebolt'){diamond(c,-6,0,13,3,'#cd5c32aa');diamond(c,0,0,8,5,'#ee8f3f');diamond(c,2,0,5,3,'#ffd181');c.fillStyle='#fff0be';c.fillRect(0,-1,4,2);}
 else if(p.kind==='soul'){diamond(c,-4,0,11,3,'#86ba8a66');c.fillStyle='#aee6a4';c.fillRect(-3,-3,7,6);c.fillRect(-1,3,4,2);c.fillStyle='#456e50';c.fillRect(0,-1,1,2);c.fillRect(3,-1,1,2);}
 else{c.fillStyle=p.color||(p.friendly?'#bce6ed':'#c59de1');c.fillRect(-3,-3,6,6);c.strokeStyle=p.friendly?'#cdeefa99':'#d8b4f699';c.lineWidth=2;c.beginPath();c.moveTo(-2,0);c.lineTo(-12,0);c.stroke();}
 c.restore();
}
export function drawArea(c,a){
 c.save();c.strokeStyle=a.kind==='meteor'?'#f0a16f':a.friendly?'#b9e8ce':'#ed8c9e';c.fillStyle=a.kind==='meteor'?'#ef9d4820':a.friendly?'#b9e8ce12':'#ed8c9e20';c.lineWidth=1;c.beginPath();c.ellipse(a.x,a.y,a.r,a.r*.6,0,0,tau);c.fill();c.stroke();
 if(a.kind==='meteor'){const t=Math.max(0,Math.min(1,1-a.timer/(a.maxTime||.9))),x=a.x+100*(1-t),y=a.y-175*(1-t)-14;c.save();c.translate(x,y);c.rotate(.55);diamond(c,0,-12,7,33,'#e7894277');diamond(c,0,-6,10,24,'#e8a04e');diamond(c,0,0,9,12,'#a25d37');diamond(c,1,-1,5,7,'#f5c574');c.restore();}
 c.restore();
}
export function drawActorAura(c,actor,time){
 if(actor.kind==='player'&&actor.shield>0){c.save();c.strokeStyle='#f3d796aa';c.fillStyle='#f0cf7630';c.lineWidth=1;c.beginPath();c.moveTo(actor.x,actor.y-46);c.lineTo(actor.x+18,actor.y-36);c.lineTo(actor.x+15,actor.y-13);c.lineTo(actor.x,actor.y-2);c.lineTo(actor.x-15,actor.y-13);c.lineTo(actor.x-18,actor.y-36);c.closePath();c.fill();c.stroke();cross(c,actor.x,actor.y-24,5,'#ffe8a5');c.restore();}
 if(actor.poison>0){for(let i=0;i<2;i++){const y=actor.y-46-((time*7+i*6)%12);diamond(c,actor.x-8+i*15,y,1.5,2.5,'#b8d774');}}
 if(actor.slow>0){c.strokeStyle='#b2e7f2';c.lineWidth=1;for(let i=0;i<3;i++){const x=actor.x-8+i*8;c.beginPath();c.moveTo(x,actor.y+2);c.lineTo(x+2,actor.y-6);c.lineTo(x+4,actor.y+2);c.stroke();}}
}
export function drawSkillEffect(c,f,state,sprite){
 const progress=Math.max(0,Math.min(1,1-f.life/f.maxLife));
 if(f.kind==='frost'){const r=f.r*(.15+progress*.85);c.strokeStyle='#9bd3e6';c.lineWidth=2;c.beginPath();c.ellipse(f.x,f.y,r,r*.6,0,0,tau);c.stroke();for(let i=0;i<12;i++){const a=i*tau/12,x=f.x+Math.cos(a)*r,y=f.y+Math.sin(a)*r*.6;diamond(c,x,y-4,3+(i%2),9+(i%3)*2,i%2?'#c0e8f1':'#8bc7de');}return true;}
 if(f.kind==='smoke'){const r=f.r*(.3+progress*.7);c.globalAlpha*=.24;for(let i=0;i<8;i++){const a=i*tau/8,x=f.x+Math.cos(a)*r*.58,y=f.y-14+Math.sin(a)*r*.32;c.fillStyle=i%2?'#a3aa98':'#747b72';c.beginPath();c.ellipse(x,y,22+progress*12,13+progress*6,0,0,tau);c.fill();}return true;}
 if(f.kind==='drain'){const start=f.target||{x:f.tx,y:f.ty},sx=start.x,sy=start.y-22,ex=f.x,ey=f.y-23;c.strokeStyle='#9ddc9e66';c.lineWidth=1;c.beginPath();c.moveTo(sx,sy);c.lineTo(ex,ey);c.stroke();for(let i=0;i<9;i++){const t=(progress*2+i/9)%1;diamond(c,sx+(ex-sx)*t,sy+(ey-sy)*t+Math.sin(t*12)*3,2,3,i%2?'#d3f4be':'#90cf8a');}return true;}
 if(f.kind==='judgement'){const alpha=c.globalAlpha;c.globalAlpha*=.26;c.fillStyle='#ffe2a2';c.beginPath();c.moveTo(f.x-11,f.y-195);c.lineTo(f.x+11,f.y-195);c.lineTo(f.x+f.r*.6,f.y);c.lineTo(f.x-f.r*.6,f.y);c.closePath();c.fill();c.globalAlpha=alpha;c.fillStyle='#fff0c1';c.fillRect(f.x-2,f.y-190,4,184);cross(c,f.x,f.y-35,14,'#ffe7a8');c.strokeStyle='#edce8b';c.lineWidth=2;c.beginPath();c.ellipse(f.x,f.y,f.r*progress,f.r*progress*.6,0,0,tau);c.stroke();return true;}
 if(f.kind==='holyStrike'){c.strokeStyle='#f8d17e';c.lineWidth=5;c.beginPath();c.ellipse(f.x,f.y-14,55,29,0,Math.PI,0);c.stroke();for(let i=0;i<4;i++)cross(c,f.x-28+i*19,f.y-26-Math.sin(i)*15,3,'#fff1c1');return true;}
 if(f.kind==='flameburst'){const r=f.r*(.15+progress*.85);for(let i=0;i<14;i++){const a=i*tau/14;diamond(c,f.x+Math.cos(a)*r,f.y+Math.sin(a)*r*.6,3,8-progress*5,i%2?'#ffcb79':'#e28a43');}c.strokeStyle='#f4b16a';c.lineWidth=3;c.beginPath();c.ellipse(f.x,f.y,r*.8,r*.45,0,0,tau);c.stroke();return true;}
 if(f.kind==='summon'){const r=f.r*(.4+progress*.6);c.strokeStyle='#a9d99e';c.lineWidth=1;c.beginPath();c.ellipse(f.x,f.y,r,r*.5,0,0,tau);c.stroke();for(let i=0;i<6;i++){const a=i*tau/6,x=f.x+Math.cos(a)*r,y=f.y+Math.sin(a)*r*.5;c.fillStyle='#e0dfc0';c.fillRect(x-1,y-4,2,8);c.fillRect(x-3,y-4,6,2);}return true;}
 if(f.kind==='afterimage'){c.globalAlpha*=.38;c.filter='saturate(.2)';sprite(c,f.x,f.y,f.type,f.dir||'up',state.time);c.filter='none';return true;}
 return false;
}
