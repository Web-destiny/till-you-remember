export const INTERIORS={inn:{name:'Трактир «Лисья свеча»',cell:0,npc:'Борис',type:'elder',service:'inn'},castle:{name:'Замок Серебряного брода',cell:1,npc:'Капитан Рейн',type:'boss',service:'castle'},church:{name:'Церковь Рассвета',cell:2,npc:'Сестра Ива',type:'liora',service:'church'},chapel:{name:'Часовня памяти',cell:3,npc:'Хранительница свечей',type:'merchant',service:'chapel'},stables:{name:'Королевские конюшни',cell:4,npc:'Конюх Лев',type:'elder',service:'stables'},market:{name:'Крытый рынок',cell:5,npc:'Торговка Эда',type:'merchant',service:'market'},shop:{name:'Лавка «Медный ворон»',cell:6,npc:'Купец Финн',type:'elder',service:'shop'},workshop:{name:'Мастерская ремесленников',cell:7,npc:'Мастер Бран',type:'elder',service:'workshop'},home:{name:'Дом Морриган и Амо',cell:8,npc:'Амо',type:'liora',service:'home'}};
export const DOORS=[
 {id:'inn',x:337,y:285,label:'Трактир',icon:'♜'},{id:'castle',x:770,y:182,label:'Замок',icon:'⚑'},{id:'church',x:1215,y:309,label:'Церковь',icon:'✟'},
 {id:'stables',x:205,y:576,label:'Конюшни',icon:'♞'},{id:'market',x:1110,y:517,label:'Рынок',icon:'⚖'},
 {id:'workshop',x:240,y:893,label:'Мастерская',icon:'⚒'},
 {id:'shop',x:1277,y:905,label:'Лавка',icon:'⚖'},{id:'home',x:805,y:756,label:'Дом и участок',icon:'⌂'},
 {id:'forest',x:457,y:974,label:'В Тихолесье',icon:'↓'}
];
export const NODES=[
 {id:'tree1',scene:'overworld',x:194,y:856,item:'wood',name:'Сухие ветви',icon:10},
 {id:'tree2',scene:'overworld',x:795,y:850,item:'wood',name:'Древесина',icon:10},
 {id:'moss1',scene:'overworld',x:850,y:760,item:'herb',name:'Лунный мох',icon:12},
 {id:'ore1',scene:'overworld',x:605,y:330,item:'ore',name:'Железная жила',icon:11},
 {id:'fish1',scene:'overworld',x:565,y:530,item:'fish',name:'Место для рыбалки',icon:13},
 {id:'tree3',scene:'district',x:475,y:800,item:'wood',name:'Поленница',icon:10},
 {id:'ore2',scene:'district',x:445,y:760,item:'ore',name:'Руда у кузницы',icon:11},
 {id:'herb2',scene:'district',x:1037,y:656,item:'herb',name:'Душистые травы',icon:12}
];
const P=(...points)=>points;
// These outlines follow ground, not the horizontal bounds of the image.
export const GROUNDS=[
 P([447,82],[580,82],[607,160],[581,211],[574,305],[580,383],[595,419],[589,592],[574,641],[585,746],[578,899],[588,1008],[599,1080],[603,1138],[425,1138],[438,1070],[442,990],[440,898],[440,787],[443,680],[437,617],[425,575],[428,422],[442,383],[438,310],[419,258],[430,183],[430,130]),
 P([437,1110],[591,1110],[612,1142],[712,1151],[795,1198],[794,1280],[746,1330],[804,1398],[806,1510],[323,1510],[321,1430],[234,1390],[174,1350],[159,1283],[164,1204],[239,1159],[365,1146],[427,1133]),
 P([703,1388],[835,1390],[904,1436],[946,1508],[750,1510]),
 P([162,1284],[242,1300],[327,1359],[328,1421],[237,1400],[169,1352]),
 P([180,750],[291,746],[383,787],[450,859],[447,996],[373,1015],[240,1005],[142,932],[109,852],[119,783]),
 P([568,669],[669,639],[792,650],[915,714],[949,798],[914,908],[810,939],[697,926],[580,860]),
 P([576,310],[646,300],[677,355],[592,402])
];
export const OBSTACLES=[
 {name:'Колодец и цветы',points:P([242,1209],[269,1181],[350,1185],[374,1223],[396,1262],[374,1303],[332,1322],[272,1307],[239,1280])},
 {name:'Клумба у фонаря',points:P([622,1265],[642,1234],[681,1238],[710,1272],[706,1318],[678,1339],[638,1325],[615,1298])},
 {name:'Южная клумба',points:P([285,1375],[314,1344],[358,1348],[377,1389],[361,1437],[326,1459],[294,1436])},
 {name:'Сад у лавки',points:P([634,1370],[649,1326],[699,1323],[726,1354],[717,1428],[674,1477],[629,1450])},
 {name:'Горшки у правой лестницы',points:P([688,1131],[697,1101],[725,1105],[739,1153],[724,1182],[695,1173])},
 {name:'Цветы у левой лестницы',points:P([245,1108],[268,1083],[292,1095],[303,1139],[286,1165],[254,1158])},
 {name:'Клумба у входа в лес',points:P([396,1071],[408,1047],[433,1057],[435,1110],[415,1125],[396,1107])},
 {name:'Правый цветник',points:P([589,1086],[610,1065],[638,1076],[646,1119],[623,1141],[593,1130])},
 {name:'Пень на поляне',circle:[227,900,20]}, {name:'Дерево на левой поляне',circle:[350,817,25]},
 {name:'Дерево у лесной стены',circle:[397,962,24]}, {name:'Старая сосна',circle:[704,895,24]},
 {name:'Правый пень',circle:[827,866,21]}, {name:'Поваленная скамья',points:P([120,824],[192,804],[202,824],[133,850])},
 {name:'Заросли слева',points:P([272,838],[333,837],[365,883],[343,940],[279,936],[260,888])},
 {name:'Ствол у реки',circle:[664,704,25]},
 {name:'Левый фонарь',circle:[393,1419,8]},{name:'Колодезный фонарь',circle:[167,1293,8]},
 {name:'Правый фонарь',circle:[607,1333,8]},{name:'Южный фонарь',circle:[708,1470,9]},
 {name:'Арка слева',points:P([431,214],[467,215],[465,283],[437,295])},{name:'Арка справа',points:P([551,215],[579,218],[587,290],[561,294])}
];
export function pointInPolygon(x,y,points){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const [xi,yi]=points[i],[xj,yj]=points[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;}return inside;}
function obstacleAt(x,y,ob){return ob.circle?Math.hypot(x-ob.circle[0],y-ob.circle[1])<ob.circle[2]:pointInPolygon(x,y,ob.points);}
export function bounds(scene){return scene==='district'?{width:1536,height:1024}:INTERIORS[scene]?{width:640,height:640}:{width:1024,height:1536};}
export function canWalk(scene,x,y,quest=5){
 if(scene==='district'){
   // Streets and individual approaches are joined; buildings remain solid.
   const streets=[P([721,158],[821,158],[847,231],[943,272],[1013,306],[1064,348],[1120,359],[1132,405],[1100,478],[1140,531],[1258,587],[1228,628],[1134,646],[1076,685],[1027,754],[984,779],[551,780],[477,774],[439,711],[386,669],[385,610],[396,538],[393,449],[424,374],[473,327],[568,285],[656,252],[705,207]),P([285,269],[508,270],[543,302],[473,347],[330,338],[289,317]),P([137,545],[211,541],[252,564],[300,559],[316,581],[399,588],[425,652],[307,654],[232,615],[137,606]),P([1115,289],[1211,289],[1260,307],[1265,350],[1186,367],[1062,366],[1045,340]),P([436,754],[550,758],[546,814],[512,867],[495,960],[478,1010],[426,1010],[439,936],[432,879],[336,932],[195,947],[136,917],[139,863],[247,861],[327,879],[393,840]),P([1002,746],[1048,741],[1097,791],[1102,865],[1161,910],[1284,919],[1376,903],[1397,922],[1390,954],[1234,967],[1100,958],[1039,923],[1008,848])];
   return streets.some(p=>pointInPolygon(x,y,p));
 }
 if(INTERIORS[scene]){if(!(x>93&&x<547&&y>248&&y<578))return false;
   if(['stables','market'].includes(scene)&&!(x>205&&x<440))return false;
   if(scene==='church'&&((x<195||x>453)&&y<541))return false;
   if(scene==='chapel'&&((x<215||x>440)&&y>490))return false;
   if(scene==='inn'&&((x<170&&y>409&&y<501)||(x>483&&y>260&&y<494)))return false;
   if(scene==='home'&&((x>448&&y>290&&y<429)||(x<178&&y>448&&y<547)))return false;
   return true;}
 if(!GROUNDS.some(p=>pointInPolygon(x,y,p)))return false;
 if(OBSTACLES.some(ob=>obstacleAt(x,y,ob)))return false;
 if(quest<3&&y<302)return false;
 return true;
}
export function walkableFoot(scene,x,y,quest){return [[0,0],[-5,0],[5,0],[0,-3],[0,3]].every(([dx,dy])=>canWalk(scene,x+dx,y+dy,quest));}
export function safePosition(scene,x,y,quest){if(walkableFoot(scene,x,y,quest))return{x,y};for(let r=8;r<210;r+=8)for(let a=0;a<Math.PI*2;a+=.35){const nx=x+Math.cos(a)*r,ny=y+Math.sin(a)*r;if(walkableFoot(scene,nx,ny,quest))return{x:nx,y:ny};}return scene==='overworld'?{x:512,y:1340}:scene==='district'?{x:768,y:900}:{x:320,y:530};}
function patrolNPC(npc,points,speed,time,pause=1.8){const segments=points.map((p,i)=>{const next=points[(i+1)%points.length],length=Math.hypot(next[0]-p[0],next[1]-p[1]);return{from:p,to:next,length,duration:length/speed};}),duration=segments.reduce((n,s)=>n+s.duration+pause,0),cycle=Math.floor(Math.max(0,time)/duration);let t=((time%duration)+duration)%duration,total=cycle*segments.reduce((n,s)=>n+s.length,0);for(const s of segments){if(t<=s.duration+pause){const moving=t<s.duration,progress=Math.min(1,t/s.duration),dx=s.to[0]-s.from[0],dy=s.to[1]-s.from[1],dir=Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up';return{...npc,x:s.from[0]+dx*progress,y:s.from[1]+dy*progress,dir,moving,walkDistance:total+s.length*progress};}t-=s.duration+pause;total+=s.length;}return npc;}
export function sceneNPCs(state){const scene=state.scene||'overworld',t=state.world?.elapsed||0;
 const companion=state.quest>=5&&state.companion?.scene===scene&&(state.world?.relationship?.following||scene==='home')?[state.companion]:[];
 if(scene==='overworld')return[...state.npcs.filter(n=>state.quest<5||n.id!=='liora'),...companion];
 if(scene==='home')return companion.length?companion:state.quest>=5?[{id:'amo-home',name:'Амо',x:415,y:485,type:'liora',dir:'left',marker:'♡'}]:[];
 if(INTERIORS[scene]){const r=INTERIORS[scene];return[{id:'service',x:320,y:267,type:r.type,name:r.npc,marker:'◇',dir:'down'},...companion];}
 return [
  patrolNPC({id:'mason',name:'Каменщик',type:'elder'},[[635,640],[695,640]],30,t),
  patrolNPC({id:'weaver',name:'Ткачиха',type:'merchant'},[[1050,625],[1000,630],[1000,680]],32,t+3),
  patrolNPC({id:'porter',name:'Носильщик',type:'elder'},[[570,390],[820,390]],44,t+5),
  patrolNPC({id:'child',name:'Ученик пекаря',type:'merchant'},[[865,750],[965,705]],45,t+2),
  {id:'guard',name:'Дозорный',x:800,y:300,type:'boss',dir:'down',marker:'◇'},
  {id:'visitor',name:'Путница',x:445,y:530,type:'merchant',dir:'right',marker:'◇'},...companion
 ];
}
export function sceneBackground(c,state,art){const s=state.scene||'overworld';if(s==='overworld'){if(art.map)c.drawImage(art.map,0,0,1024,1536);return;}
 if(s==='district'&&art.district){c.drawImage(art.district,0,0,1536,1024);return;}
 if(INTERIORS[s]&&art.interiors){const cell=s==='home'&&(state.world?.house.stage||0)<4?7:INTERIORS[s].cell,w=art.interiors.width/3,h=art.interiors.height/3;c.drawImage(art.interiors,cell%3*w,Math.floor(cell/3)*h,w,h,0,0,640,640);if(s==='home'&&(state.world?.house.stage||0)<4){const stage=state.world.house.stage;c.fillStyle='#3c3329';c.fillRect(94,243,453,335);for(let y=246;y<578;y+=11)for(let x=96;x<547;x+=34){c.fillStyle=((x/34+y/11)|0)%2?'#786342':'#6a5538';c.fillRect(x+1,y+1,32,9);}c.strokeStyle='#e7d39777';c.setLineDash([6,5]);c.strokeRect(185,285,245,250);c.setLineDash([]);c.fillStyle='#55432c';c.fillRect(448,296,86,115);c.fillStyle='#b5935c';for(let y=300;y<401;y+=14)c.fillRect(452,y,79,8);for(let y=467;y<538;y+=11){c.fillStyle='#b69a68';c.fillRect(108,y,63,8);}if(stage>0){c.strokeStyle='#b9b19a';c.lineWidth=8;c.strokeRect(126,251,394,313);}if(stage>1){c.fillStyle='#a27842';for(const x of[118,508])for(const y of[255,390,530]){c.fillRect(x,y-35,12,45);c.fillStyle='#d2b17c';c.fillRect(x+2,y-35,3,45);c.fillStyle='#a27842';}}if(stage>2){c.strokeStyle='#997245';c.lineWidth=9;c.beginPath();c.moveTo(117,250);c.lineTo(320,160);c.lineTo(520,250);c.stroke();}}return;}
 const b=bounds(s);c.fillStyle=INTERIORS[s]?'#755d3a':'#6d7550';c.fillRect(0,0,b.width,b.height);c.fillStyle='#aca080';c.fillRect(b.width*.35,150,b.width*.3,b.height-180);
}
export function drawEnvironment(c,state,art){const s=state.scene||'overworld',t=state.time;
 const label=(x,y,text,color='#f4dda7')=>{c.save();c.textAlign='center';c.font='10px Georgia';c.fillStyle='#241d15dc';const w=c.measureText(text).width+15;c.fillRect(x-w/2,y-12,w,18);c.strokeStyle='#b99b5d88';c.strokeRect(x-w/2,y-12,w,18);c.fillStyle=color;c.fillText(text,x,y);c.restore();};
 if(s==='overworld'&&state.stage==='playing')label(512,1494,'↓ Рыночный квартал');
 if(s==='district'){for(const door of DOORS){label(door.x,door.y,door.icon+' '+(door.id==='home'&&state.world?.house.owned?'Ваш дом':door.label));c.fillStyle='#e5cb84';c.globalAlpha=.5+Math.sin(t*2)*.2;c.beginPath();c.arc(door.x,door.y+13,4,0,7);c.fill();c.globalAlpha=1;}}
 if(INTERIORS[s]){label(320,566,'↓ Выйти');if(s==='home'&&state.world?.house.owned)label(320,207,['Участок','Фундамент','Стены','Крыша','Дом у тихой дороги'][state.world.house.stage]||'Ваш дом');}
 if(s==='home'&&state.world?.house.hearth){const g=c.createRadialGradient(575,140,2,575,140,70);g.addColorStop(0,'#ffc27055');g.addColorStop(1,'#ffc27000');c.fillStyle=g;c.fillRect(505,70,140,140);}
 if(s==='district'&&state.world?.house.garden&&state.world.house.plantedAt!==null){const grown=state.world.elapsed-state.world.house.plantedAt>=45;c.strokeStyle=grown?'#e0bf68':'#8eb96b';c.lineWidth=2;for(let y=856;y<920;y+=18)for(let x=870;x<940;x+=15){c.beginPath();c.moveTo(x,y);c.lineTo(x-1,y-(grown?11:5));c.stroke();}}
 for(const node of NODES){if(node.scene!==s)continue;const ready=(state.world?.resources?.[node.id]||0)<(state.world?.elapsed||0);if(!ready)continue;c.fillStyle='#e6dfa2';c.globalAlpha=.6+Math.sin(t*2+node.x)*.2;c.fillRect(node.x-2,node.y-14,4,4);c.globalAlpha=1;label(node.x,node.y-22,node.name,'#d7dfad');}
 for(const loot of state.loot||[]){if(loot.scene!==s)continue;c.fillStyle='#bd9c59';c.fillRect(loot.x-7,loot.y-10,14,10);c.fillStyle='#f5d487';c.fillRect(loot.x-1,loot.y-11,2,13);c.fillStyle='#b8e4bd';c.fillRect(loot.x-2,loot.y-22+Math.sin(t*3)*2,4,4);}
}
export function drawOcclusion(c,state,art){if(state.scene!=='overworld'||!art.map)return;const p=state.player;const canopies=[{x1:229,x2:433,base:822,points:[[230,660],[301,625],[367,653],[401,692],[428,754],[410,799],[341,804],[275,758]]},{x1:607,x2:793,base:896,points:[[607,753],[646,710],[718,727],[769,760],[794,812],[774,857],[704,864],[650,836]]}];for(const tree of canopies){if(p.x<tree.x1-20||p.x>tree.x2+20||p.y>tree.base)continue;c.save();c.beginPath();tree.points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();c.drawImage(art.map,0,0,1024,1536);c.restore();}}
