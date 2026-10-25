// Sprite registration is shared by standing, walking, attacks and paired poses.
// Every frame has the same foot anchor and the same adult body height.
export const BODY_HEIGHT=42;
export const STRIDE_DISTANCE=48;
export const DIRECTIONS=['down','left','right','up'];
const median=a=>{const s=[...a].sort((x,y)=>x-y);return s[Math.floor(s.length/2)]||1;};
function inspect(image,cell,pair){
 const cv=document.createElement('canvas');cv.width=Math.ceil(cell.w);cv.height=Math.ceil(cell.h);const c=cv.getContext('2d',{willReadFrequently:true});c.imageSmoothingEnabled=false;c.drawImage(image,cell.x,cell.y,cell.w,cell.h,0,0,cv.width,cv.height);const data=c.getImageData(0,0,cv.width,cv.height),pixels=data.data,w=cv.width,h=cv.height;
 // Discard fragments from adjacent atlas cells, keeping the actual pose intact.
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(x<w*.025||x>w*.975||y<h*.012||y>h*.988)pixels[(y*w+x)*4+3]=0;
 c.putImageData(data,0,0);
 const lo=Math.floor(w*(pair?.19:.27)),hi=Math.ceil(w*(pair?.81:.73)),threshold=Math.max(3,Math.round(w*(pair?.07:.055)));let top=-1,bottom=-1;
 const rowCounts=new Uint16Array(h);for(let y=0;y<h;y++){let n=0;for(let x=lo;x<hi;x++)if(pixels[(y*w+x)*4+3]>64)n++;rowCounts[y]=n;if(n>=threshold&&top<0)top=y;if(n>=Math.max(2,threshold*.3))bottom=y;}
 if(top<0||bottom<=top){top=Math.floor(h*.14);bottom=Math.floor(h*.91);}
 const torso=[];for(let x=lo;x<hi;x++){let count=0;for(let y=Math.floor(top+(bottom-top)*.27);y<top+(bottom-top)*.56;y++)if(pixels[(y*w+x)*4+3]>100)count++;if(count)torso.push({x,count});}
 const total=torso.reduce((n,t)=>n+t.count,0);let sum=0,center=w/2;for(const t of torso){sum+=t.count;if(sum>=total/2){center=t.x;break;}}
 // A couple is anchored between two bodies rather than at the larger person's chest.
 if(pair){let min=w,max=0;for(let y=top;y<=bottom;y++)for(let x=lo;x<hi;x++)if(pixels[(y*w+x)*4+3]>80){min=Math.min(min,x);max=Math.max(max,x);}center=(min+max)/2;}
 return{canvas:cv,top,bottom,center,height:bottom-top};
}
export function registerFrames(image,cells,{pair=false,height=BODY_HEIGHT}={}){
 if(!image)return[];const info=cells.map(cell=>inspect(image,cell,pair)),typical=median(info.map(i=>i.height));
 return info.map(i=>{const cv=document.createElement('canvas');cv.width=pair?112:80;cv.height=80;const c=cv.getContext('2d');c.imageSmoothingEnabled=false;const rootX=cv.width/2,rootY=74,sourceHeight=Math.max(typical*.9,Math.min(typical*1.1,i.height)),scale=height/sourceHeight;c.drawImage(i.canvas,Math.round(rootX-i.center*scale),Math.round(rootY-i.bottom*scale),i.canvas.width*scale,i.canvas.height*scale);cv.anchorX=rootX;cv.anchorY=rootY;cv.bodyHeight=i.height*scale;return cv;});
}
export function cell(image,col,row,columns,rows){return{x:col*image.width/columns,y:row*image.height/rows,w:image.width/columns,h:image.height/rows};}
export function drawFrame(c,frame){if(!frame)return false;c.drawImage(frame,-frame.anchorX,-frame.anchorY);return true;}
export function walkFrame(distance,frames=6){return Math.floor((((distance||0)/STRIDE_DISTANCE)%1+1)%1*frames)%frames;}
const walkNames={paladin:'paladin',mage:'mage',rogue:'rogue',necromancer:'necromancer',liora:'amo',elder:'elder',merchant:'merchant',shade:'shade',boss:'boss',skeleton:'skeleton',undeadpaladin:'undeadpaladin'};
export function createAnimationLibrary(art,load){
 const library={idle:{},actions:{},walks:{},couples:{},pending:new Map()};
 const classes=['paladin','mage','rogue','necromancer'];
 if(art.classes)for(const[type,row]of classes.map((t,i)=>[t,i]))library.idle[type]=Object.fromEntries(DIRECTIONS.map((d,i)=>[d,registerFrames(art.classes,[cell(art.classes,i,row,4,4)])[0]]));
 if(art.actions)for(const[type,index]of classes.map((t,i)=>[t,i])){const frames=registerFrames(art.actions,Array.from({length:8},(_,i)=>cell(art.actions,i%4,index*2+Math.floor(i/4),4,8)));library.actions[type]={down:frames.slice(0,4),up:frames.slice(4)};}
 if(art.npcs)for(const[type,index]of [['liora',0],['elder',1],['merchant',2]]){const cells=[cell(art.npcs,index,0,3,2),cell(art.npcs,type==='liora'?2:index,type==='liora'?1:0,3,2)],frames=registerFrames(art.npcs,cells);library.idle[type]={down:frames[0],up:frames[1]};}
 if(art.enemyActions)for(const[type,index]of [['shade',0],['boss',1],['skeleton',2],['undeadpaladin',3]]){const frames=registerFrames(art.enemyActions,Array.from({length:8},(_,i)=>cell(art.enemyActions,i%4,index*2+Math.floor(i/4),4,8)));library.idle[type]={down:frames[0],up:frames[4]};library.actions[type]={down:frames.slice(1,4),up:frames.slice(5,8)};}
 if(art.couple)for(const[type,row]of classes.map((t,i)=>[t,i]))library.couples[type]=registerFrames(art.couple,Array.from({length:4},(_,i)=>cell(art.couple,i,row,4,4)),{pair:true});
 library.ensureWalk=type=>{
  if(!walkNames[type])return Promise.resolve(null);if(library.walks[type])return Promise.resolve(library.walks[type]);if(library.pending.has(type))return library.pending.get(type);
  const promise=load('assets/walk-'+walkNames[type]+'-v3.png').then(image=>{if(!image)return null;const frames=registerFrames(image,Array.from({length:24},(_,i)=>cell(image,i%6,Math.floor(i/6),6,4)));const directions=Object.fromEntries(DIRECTIONS.map((d,i)=>[d,frames.slice(i*6,i*6+6)]));library.walks[type]=directions;return directions;});library.pending.set(type,promise);return promise;
 };
 return library;
}
