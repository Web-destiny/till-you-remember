import { art,loadArt,portrait,drawWorld,WORLD } from './art.js?v=3';
import { CLASSES } from './content.js?v=3';
import { createRPG } from './rpg.js?v=3';
import { walkableFoot, bounds, DOORS, INTERIORS } from './world.js?v=3';
import { installSaveTransfer } from './save-transfer.js?v=3';
import { installSkillUI } from './skill-ui.js?v=3';
const $=id=>document.getElementById(id), hide=id=>$(id).classList.add('hidden'), show=id=>$(id).classList.remove('hidden');
const SAVE='tyr.chapter1.v1';
const typeKey=t=>t==='knight'?'paladin':t;
const freshPlayer=t=>{const type=typeKey(t);return{x:512,y:1340,type,dir:'up',hp:CLASSES[type].hp,maxHp:CLASSES[type].hp,mp:CLASSES[type].mp,maxMp:CLASSES[type].mp,invuln:0,flash:0,attackCD:0,dashCD:0,cooldowns:[0,0,0],moving:false,level:1,xp:0,potions:3,gold:0,shield:0};};
const npcData=()=>[
 {id:'elder',name:'Орен',role:'СТАРОСТА ТИХОЛЕСЬЯ',x:397,y:1255,type:'elder',marker:'!',hidden:false},
 {id:'merchant',name:'Мира',role:'ТРАВНИЦА',x:702,y:1405,type:'merchant',marker:'◇',hidden:false},
 {id:'liora',name:'Амо',role:'ТВОЙ СВЕТ',x:551,y:1327,type:'liora',marker:'',hidden:true}
];
const enemy=(id,x,y,tier=0)=>({id,x,y,homeX:x,homeY:y,type:tier===2?'boss':'shade',dir:'down',hp:tier===2?660:tier===1?90:65,maxHp:tier===2?660:tier===1?90:65,tier,attackCD:1.2,skillCD:3,flash:0,moving:false,windup:0,slow:0});
const enemiesData=()=>[enemy('s1',505,1060),enemy('s2',537,1000),enemy('s3',500,880,1),enemy('s4',533,811),enemy('s5',484,700,1),enemy('s6',530,385,1),enemy('s7',492,355,1),enemy('warden',512,216,2)];
const state={stage:'start',scene:'overworld',time:0,quest:0,player:freshPlayer('paladin'),npcs:npcData(),enemies:enemiesData(),shards:[{id:0,x:503,y:970,collected:false},{id:1,x:532,y:748,collected:false},{id:2,x:505,y:326,collected:false}],effects:[],projectiles:[],areas:[],paused:false,modal:null,dialog:null,dialogIndex:0,dialogDone:null,selected:'paladin',killCount:0,herb:false,herbReward:false,ending:false,saveTimer:0,shake:0};
let rpg=null;
let updateSkillIcons=()=>{};
const canvas=$('world'),ctx=canvas.getContext('2d',{alpha:false});
const view={width:innerWidth,height:innerHeight,dpr:Math.min(devicePixelRatio||1,2),zoom:1,camera:{x:512,y:1260}};
const input={keys:new Set(),joyX:0,joyY:0,attack:false,pointerId:null};
let soundOn=false,audio=null,musicTimer=null,frameTime=0,lastHud=0,lastSaveNotice=-50;
function resize(){const b=$('app').getBoundingClientRect();view.width=b.width;view.height=b.height;view.dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(b.width*view.dpr);canvas.height=Math.round(b.height*view.dpr);view.zoom=Math.max(b.width/WORLD.width,b.width<701?1.17:1.05);}
window.addEventListener('resize',resize);resize();
function tone(freq=440,dur=.1,type='sine',volume=.03,delay=0){if(!soundOn||!audio)return;const t=audio.currentTime+delay,o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+dur);}
function initAudio(){if(!audio){const AC=window.AudioContext||window.webkitAudioContext;if(AC)audio=new AC();}audio?.resume().catch(()=>{});}
function music(){if(musicTimer)return;let bar=0;musicTimer=setInterval(()=>{if(!soundOn||document.hidden)return;const notes=[146.83,174.61,130.81,164.81],n=notes[bar++%4];tone(n,3.8,'sine',.019);tone(n*1.5,3.4,'sine',.009,.3);tone(n*2,2,'triangle',.007,1);tone(n*3,1.4,'sine',.005,1.9);},4000);}
function toast(message,reward=false){const el=document.createElement('div');el.className='toast'+(reward?' reward':'');el.textContent=message;$('toasts').appendChild(el);setTimeout(()=>el.classList.add('fade'),3000);setTimeout(()=>el.remove(),3600);if($('toasts').children.length>2)$('toasts').firstChild.remove();}
function fx(kind,x,y,extra={}){const life=kind==='text'?1.1:kind==='spark'?.6:.35;state.effects.push({kind,x,y,life,maxLife:life,...extra});}
function queueHit(delay,callback){(state.pendingHits??=[]).push({delay,callback});}
function burst(x,y,color='#c7e6cb',count=14){for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,v=20+Math.random()*65;fx('spark',x,y-15,{vx:Math.cos(a)*v,vy:Math.sin(a)*v-15,color,size:Math.random()<.7?2:3});}}
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const classInfo=()=>rpg?.stats()||CLASSES[state.player.type];
function transition(title,kicker='ГЛАВА I'){ $('transition-kicker').textContent=kicker;$('transition-title').textContent=title;show('transition');setTimeout(()=>hide('transition'),2850);}
function setQuest(q){state.quest=q;updateQuest();saveGame();}
const quests=[['Когда погас свет','Найдите Орена у колодца'],['Следы в тишине','Поговорите с Ореном'],['То, что не забрать','Соберите осколки памяти'],['За гранью забвения','Победите Хранителя у святилища'],['Пока ты помнишь','Вернитесь к Амо у портала'],['Обещание исполнено','Тихолесье снова помнит её имя']];
function updateQuest(){const q=quests[state.quest];$('quest-title').textContent=state.quest===5?'Дорога домой':q[0];$('quest-objective').textContent=state.quest===5?(state.world?.house.owned?'Обустраивайте общий дом с Амо':'Купите участок или дом в рыночном квартале'):q[1]+(state.quest===2?` · ${state.shards.filter(s=>s.collected).length} / 3`:'');state.npcs[0].marker=state.quest<2?'!':state.herb&&!state.herbReward?'?':'◇';}
function currentTarget(){const together=rpg?.target();if(state.quest===5&&together)return together;if(state.scene!=='overworld')return null;if(state.quest<2)return state.npcs[0];if(state.quest===2)return state.shards.find(s=>!s.collected);if(state.quest===3)return state.enemies.find(e=>e.type==='boss');if(state.quest===4)return state.npcs.find(n=>n.id==='liora');if(state.quest===5)return{x:512,y:1490};return null;}
function drawPortraits(){document.querySelectorAll('[data-portrait]').forEach(c=>portrait(c,c.dataset.portrait));portrait($('portrait'),state.player.type);}
function selectClass(type){state.selected=type;art.animations?.ensureWalk(type);document.querySelectorAll('[data-class]').forEach(el=>{const on=el.dataset.class===type;el.classList.toggle('selected',on);el.setAttribute('aria-pressed',String(on));});$('class-description').textContent=CLASSES[type].desc;document.querySelector('.panel-heading small').textContent=`0${Object.keys(CLASSES).indexOf(type)+1} / 04`;tone(350+Object.keys(CLASSES).indexOf(type)*100,.12,'sine',.03);}
document.querySelectorAll('[data-class]').forEach(el=>el.addEventListener('click',()=>selectClass(el.dataset.class)));
function startGame(){initAudio();state.player=freshPlayer(state.selected);rpg.reset();state.npcs=npcData();state.enemies=enemiesData();state.shards.forEach(s=>s.collected=false);Object.assign(state,{quest:0,stage:'prologue',killCount:0,herb:false,herbReward:false,ending:false,effects:[],projectiles:[],areas:[]});state.player.x=507;state.player.y=1345;state.npcs[2].hidden=false;hide('start-screen');show('hud');drawPortraits();updateSkills();updateQuest();
  dialog([
    ['Амо','Я загадала желание. Когда всё закончится, мы уедем к морю. Ты ведь не забыл?','liora','НА КРАЮ ТИХОЛЕСЬЯ'],
    ['Морриган','Я обещал. И я помню.','hero',''],
    ['Незнакомец','Есть имена, которым не место в этом мире. Она идёт с нами.','shade','ГОЛОС ИЗ ТУМАНА'],
    ['Амо','Морриган… Что бы ни случилось — помни меня.','liora',''],
  ],()=>{burst(state.npcs[2].x,state.npcs[2].y,'#d0a4ed',65);state.npcs[2].hidden=true;state.shake=8;tone(83,1.5,'sawtooth',.025);state.stage='playing';state.quest=1;updateQuest();transition('Когда погас свет','ПРОЛОГ');setTimeout(()=>toast('Найдите старосту у колодца. Следуйте за ◇'),2900);saveGame();});
}
$('start-button').addEventListener('click',()=>{if(hasSave()){openModal('newgame');return;}startGame();});
function dialog(lines,onDone){input.attack=false;input.keys.clear();state.player.moving=false;state.dialog=lines;state.dialogIndex=0;state.dialogDone=onDone;show('dialog');$('touch-controls').style.visibility='hidden';hide('interact');renderDialog();}
function renderDialog(){const [name,text,type,role]=state.dialog[state.dialogIndex];$('dialog-name').textContent=name;$('dialog-text').textContent=text;$('dialog-role').textContent=role||'ТИХОЛЕСЬЕ';portrait($('dialog-portrait'),type==='hero'?state.player.type:type);$('dialog-next').innerHTML=state.dialogIndex===state.dialog.length-1?'Продолжить <span>↵</span>':'Далее <span>↵</span>';if(name==='Амо')tone(587,.4,'sine',.015);}
function nextDialog(){if(!state.dialog)return;state.dialogIndex++;if(state.dialogIndex>=state.dialog.length){state.dialog=null;hide('dialog');$('touch-controls').style.visibility='';const callback=state.dialogDone;state.dialogDone=null;callback?.();}else renderDialog();}
$('dialog-next').addEventListener('click',nextDialog);
function updateSkills(){$('class-label').textContent=classInfo().label;classInfo().skills.forEach((name,i)=>{const el=$('skill-'+(i+1));el.querySelector('small').textContent=name;el.setAttribute('aria-label',name);});updateSkillIcons(state.player.type);document.body.style.setProperty('--weapon-x',({paladin:0,mage:20,rogue:40,necromancer:60})[state.player.type]+'%');portrait($('portrait'),state.player.type);}
function nearestInteraction(){if(state.stage!=='playing'||state.dialog)return null;const p=state.player;
  const near=rpg?.nearby();if(near)return near;if(state.scene!=='overworld')return null;
  const npcs=state.npcs.filter(n=>!n.hidden&&distance(n,p)<53);if(npcs.length)return {kind:'npc',value:npcs.sort((a,b)=>distance(a,p)-distance(b,p))[0]};
  if(state.quest===2){const s=state.shards.find(s=>!s.collected&&distance(s,p)<38);if(s)return{kind:'shard',value:s};}
  if(state.herb&&!state.herbReward&&distance(p,{x:567,y:649})<35)return{kind:'herb'};
  return null;
}
function interact(){if(state.dialog){nextDialog();return;}if(state.paused)return;const nearby=nearestInteraction();if(!nearby)return;
  if(nearby.kind==='world'){rpg.interact(nearby);return;}
  if(nearby.kind==='shard'){
    const s=nearby.value;s.collected=true;burst(s.x,s.y,'#c8f3ed',25);tone(659,.3,'sine',.05);tone(880,.7,'sine',.025,.15);state.player.mp=state.player.maxMp;const count=state.shards.filter(s=>s.collected).length;
    const memories=['Она смеялась, когда дождь заставал вас без плащей. «Пойдём медленнее», — говорила она.','У неё была привычка согревать твои ладони. Даже когда самой было холодно.','«Если я когда-нибудь потеряюсь, ищи меня там, где всё началось». У старого святилища.'];
    dialog([['Эхо памяти',memories[s.id],'liora',`ОСКОЛОК ${count} / 3`]],()=>{if(count===3){setQuest(3);toast('Печать снята. Путь к святилищу открыт.',true);burst(512,297,'#dab4f6',45);}else{updateQuest();saveGame();toast('Осколок памяти найден · '+count+' / 3',true);}});return;
  }
  if(nearby.kind==='herb'){if(!rpg.give('potion',2))return;state.herbReward=true;burst(567,649,'#d5ebac');toast('Лунный мох собран · +2 зелья',true);saveGame();return;}
  const n=nearby.value;
  if(n.id==='elder'){
    if(state.quest<2){dialog([
      ['Орен','Туман принёс сюда Хранителя. Он забирает людей, вырывая их имена из памяти мира. Но ты ещё помнишь её.','elder','СТАРОСТА ТИХОЛЕСЬЯ'],
      ['Морриган','Амо. Её зовут Амо. Куда они её увели?','hero',''],
      ['Орен','К святилищу на севере. Собери три осколка её памяти — их свет рассеет печать. Тени на дороге попытаются тебе помешать.','elder',''],
      ['Орен','И не забывай о себе: лечись зельями, уклоняйся от ударов. Твоя память — единственная дорога домой для неё.','elder',''],
    ],()=>{setQuest(2);toast('Новый квест: То, что не забрать',true);toast('Удерживайте атаку. Умения — кнопки над джойстиком.');});}
    else dialog([['Орен',state.quest>=4?'Я снова слышу её имя. Ты сделал то, чего не смог бы ни один меч сам по себе.':'Три осколка лежат вдоль северной дороги. Память светится голубым. Иди к свету.','elder','СТАРОСТА ТИХОЛЕСЬЯ']]);
  }
  if(n.id==='merchant'){
    if(!state.herb){dialog([['Мира','Ты идёшь к мосту? Собери лунный мох у восточного фонаря. Я оставила там два зелья для тех, кто ещё не сдался.','merchant','ТРАВНИЦА'] ],()=>{state.herb=true;toast('Побочный квест: Дар у моста',true);saveGame();});}
    else if(state.player.gold>=15){dialog([['Мира','Одно зелье стоит 15 монет. Для тебя — с надеждой, что оно не понадобится.','merchant','ТРАВНИЦА']],()=>{if(rpg.give('potion')){state.player.gold-=15;toast('Получено зелье · −15 монет',true);saveGame();}});}
    else dialog([['Мира','У меня есть зелья за 15 монет. А в лунном мхе у моста ещё может остаться немного целебной росы.','merchant','ТРАВНИЦА']]);
  }
  if(n.id==='liora'&&state.quest===4)finishStory();else if(n.id==='liora'&&state.quest===5)dialog([['Амо',state.world.house.owned?'Давай вернёмся домой. Мне хочется побыть с тобой у огня.':'У южной дороги есть старый дом. Может, начнём с него? Я помогу, чем смогу.','liora','ДОРОГА ДОМОЙ']]);
}
$('interact').addEventListener('click',interact);
function walkable(x,y){return walkableFoot(state.scene||'overworld',x,y,state.stage==='playing'?state.quest:5);}
function moveEntity(e,dx,dy){const ox=e.x,oy=e.y,steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/3));for(let i=0;i<steps;i++){if(walkable(e.x+dx/steps,e.y))e.x+=dx/steps;if(walkable(e.x,e.y+dy/steps))e.y+=dy/steps;}e.walkDistance=(e.walkDistance||0)+Math.hypot(e.x-ox,e.y-oy);}
function closestEnemy(range=Infinity){if(state.scene!=='overworld')return null;const p=state.player;return state.enemies.filter(e=>e.hp>0&&(e.type!=='boss'||state.quest>=3)&&distance(e,p)<=range).sort((a,b)=>distance(a,p)-distance(b,p))[0];}
function aim(){const p=state.player,e=closestEnemy(classInfo().range+70);if(e)return Math.atan2(e.y-p.y,e.x-p.x);const dirs={up:-Math.PI/2,down:Math.PI/2,left:Math.PI,right:0};return dirs[p.dir];}
function hitEnemy(e,damage,crit=false){if(e.hp<=0||state.scene!=='overworld')return;crit=crit||Math.random()<classInfo().crit;damage=Math.round(damage*(crit?1.5:1));e.hp-=damage;e.flash=.12;const lifeSteal=classInfo().lifesteal||0;if(lifeSteal)state.player.hp=Math.min(state.player.maxHp,state.player.hp+damage*lifeSteal);fx('text',e.x,e.y-42,{text:String(damage),color:crit?'#f7e0a2':'#eef0d8',big:crit});burst(e.x,e.y,'#bdb0cf',5);tone(130+Math.random()*80,.07,'triangle',.035);
 if(e.hp<=0){e.hp=0;state.killCount++;const p=state.player;p.xp+=e.tier===2?130:22;p.gold+=e.tier===2?80:8;burst(e.x,e.y,'#b7a9cf',22);p.mp=Math.min(p.maxMp,p.mp+12);
   if(p.xp>=p.level*60){p.xp-=p.level*60;p.level++;p.maxHp+=16;p.hp=Math.min(p.maxHp,p.hp+65);p.maxMp+=8;p.mp=p.maxMp;toast('Новый уровень · '+p.level+' · здоровье восстановлено',true);burst(p.x,p.y,'#f4e4a8',35);tone(523,.2,'sine',.04);tone(784,.5,'sine',.03,.17);}
   if(e.type==='boss'){state.projectiles=state.projectiles.filter(p=>p.friendly);state.areas=[];state.npcs[2].hidden=false;state.npcs[2].x=512;state.npcs[2].y=145;state.npcs[2].marker='!';setQuest(4);hide('boss-bar');transition('Имя, которое ты сохранил','СВЯТИЛИЩЕ');toast('Амо ждёт у портала.',true);}
   rpg.onKill(e);saveGame();
 }
}
function damagePlayer(amount){const p=state.player;if(p.invuln>0||state.dialog)return;if(p.shield>0)amount*=.35;amount=Math.max(1,Math.round(amount*(100/(100+classInfo().armor*4))));p.hp=Math.max(0,p.hp-amount);p.invuln=.65;p.flash=.15;state.shake=3;fx('text',p.x,p.y-45,{text:'−'+amount,color:'#f4b8a9'});tone(90,.12,'triangle',.045);if(p.hp<=0)die();}
function attack(){if(state.stage!=='playing'||state.paused||state.dialog||state.romancePose)return;const p=state.player,cl=classInfo();if(p.attackCD>0||p.action?.kind==='skill'&&p.action.t<.25)return;p.attackCD=cl.delay;const a=aim();p.dir=Math.abs(Math.cos(a))>.6?(Math.cos(a)>0?'right':'left'):(Math.sin(a)>0?'down':'up');p.action={kind:'attack',t:0,duration:cl.delay,angle:a,dir:p.dir};state.world.relationship.holdingHands=false;
  queueHit(cl.delay*.35,()=>{if(p.hp<=0)return;if(['mage','necromancer'].includes(p.type)){state.projectiles.push({x:p.x,y:p.y-14,vx:Math.cos(a)*270,vy:Math.sin(a)*270,life:1.1,friendly:true,kind:p.type==='necromancer'?'soul':'arcane',damage:cl.damage+p.level*2,color:cl.color});tone(p.type==='mage'?560:260,.11,'sine',.025);}
  else{fx('slash',p.x,p.y,{angle:a,r:cl.range-9,color:cl.color});if(state.scene==='overworld')for(const e of state.enemies){if(e.hp<=0||(e.type==='boss'&&state.quest<3))continue;const ea=Math.atan2(e.y-p.y,e.x-p.x),diff=Math.atan2(Math.sin(ea-a),Math.cos(ea-a));if(distance(e,p)<cl.range+12&&Math.abs(diff)<1.5){hitEnemy(e,cl.damage+p.level*2);if(p.type==='rogue')e.poison=4;}}tone(220,.08,'triangle',.016);}});
}
function useSkill(i){
 if(state.stage!=='playing'||state.paused||state.dialog||state.romancePose)return;
 const p=state.player,cl=classInfo(),cost=[20,28,45][i];
 if(p.cooldowns[i]>0)return;if(p.mp<cost){toast('Не хватает энергии');return;}
 p.mp-=cost;p.cooldowns[i]=cl.cooldowns[i];const a=aim();
 p.dir=Math.abs(Math.cos(a))>.6?(Math.cos(a)>0?'right':'left'):(Math.sin(a)>0?'down':'up');
 p.action={kind:'skill',t:0,duration:i===2?1:.8,dir:p.dir,angle:a};state.world.relationship.holdingHands=false;
 const enemies=state.scene==='overworld'?state.enemies.filter(e=>e.hp>0&&(e.type!=='boss'||state.quest>=3)):[],power=1+(cl.spell||0);
 const area=(r,damage)=>{for(const e of enemies)if(distance(e,p)<r)hitEnemy(e,(damage+p.level*4)*power,true);};
 const ring=r=>fx('ring',p.x,p.y,{r,color:cl.color,life:.8,maxLife:.8});
 const recover=n=>{n=Math.round(n*(1+(cl.healing||0)));p.hp=Math.min(p.maxHp,p.hp+n);fx('text',p.x,p.y-45,{text:'+'+n,color:'#d7efb6'});};
 const effect=(kind,r,life)=>fx(kind,p.x,p.y,{r,life,maxLife:life,color:cl.color});
 queueHit(.24,()=>{
  if(p.hp<=0)return;
  fx('text',p.x,p.y-54,{text:cl.skills[i],color:cl.color,small:true,life:.75,maxLife:.75});
  if(p.type==='paladin'){
   if(i===0){fx('slash',p.x,p.y,{angle:a,r:75,color:cl.color,heavy:true});effect('holyStrike',75,.48);area(90,66);}
   if(i===1){recover(52);p.shield=7;p.invuln=.8;ring(55);burst(p.x,p.y,'#f7e4ae',15);}
   if(i===2){effect('judgement',160,.85);area(160,115);p.shield=3;burst(p.x,p.y,cl.color,35);}
  }
  if(p.type==='mage'){
   if(i===0)for(let j=-1;j<=1;j++)state.projectiles.push({x:p.x,y:p.y-14,vx:Math.cos(a+j*.2)*300,vy:Math.sin(a+j*.2)*300,life:1.1,friendly:true,damage:(40+p.level*4)*power,color:'#ffc372',kind:'firebolt'});
   if(i===1){effect('frost',125,.9);area(125,28);for(const e of enemies)if(distance(e,p)<125)e.slow=5;p.invuln=.5;}
   if(i===2){const e=closestEnemy(240)||{x:p.x+Math.cos(a)*80,y:p.y+Math.sin(a)*80};state.areas.push({x:e.x,y:e.y,r:100,timer:.9,maxTime:.9,friendly:true,kind:'meteor',damage:(150+p.level*5)*power});}
  }
  if(p.type==='rogue'){
   if(i===0){fx('afterimage',p.x,p.y,{type:p.type,dir:p.dir,life:.5,maxLife:.5});p.invuln=.7;for(let j=0;j<12;j++)moveEntity(p,Math.cos(a)*4,Math.sin(a)*4);fx('slash',p.x,p.y,{angle:a,r:65,color:cl.color,heavy:true});area(85,65);}
   if(i===1){p.invuln=2.4;effect('smoke',95,2.4);for(const e of enemies)if(distance(e,p)<95){e.poison=7;e.slow=4;}}
   if(i===2)for(let j=-3;j<=3;j++)state.projectiles.push({x:p.x,y:p.y-14,vx:Math.cos(a+j*.22)*330,vy:Math.sin(a+j*.22)*330,life:.9,friendly:true,damage:(54+p.level*4)*power,color:cl.color,kind:'knife'});
  }
  if(p.type==='necromancer'){
   if(i===0){const e=closestEnemy(230);if(e){hitEnemy(e,(65+p.level*4)*power,true);fx('drain',p.x,p.y,{target:e,life:.7,maxLife:.7});recover(35);}else effect('summon',30,.45);}
   if(i===1){state.summons=state.summons.filter(s=>s.type!=='skeleton');const dead=state.enemies.filter(e=>e.hp<=0&&distance(e,p)<200);for(let j=0;j<2+(cl.summons||0);j++){const pos=dead[j]||{x:p.x+(j%2?23:-23),y:p.y-14};state.summons.push({x:pos.x,y:pos.y,hp:90,maxHp:90,life:28,cd:.5,type:'skeleton',dir:p.dir,rise:.45});}effect('summon',55,.9);}
   if(i===2){state.summons=state.summons.filter(s=>s.type!=='undeadpaladin');state.summons.push({x:p.x,y:p.y-30,hp:420,maxHp:420,life:35,cd:.5,type:'undeadpaladin',dir:p.dir,rise:.7});effect('summon',85,1);burst(p.x,p.y,cl.color,35);}
  }
 });
 tone(i===1?440:196,.4,'triangle',.045);tone(i===1?659:392,.6,'sine',.025,.1);
}
function heal(fromInventory=false){if(state.paused&&!fromInventory||state.dialog||state.stage!=='playing')return;const p=state.player;if(rpg.count('potion')<=0){toast('Зелья закончились. Купите их на рынке или сварите из трав.');return;}if(p.hp>=p.maxHp){toast('Здоровье уже восстановлено');return;}rpg.take('potion');const old=p.hp;p.hp=Math.min(p.maxHp,p.hp+85);fx('text',p.x,p.y-45,{text:'+'+Math.round(p.hp-old),color:'#d3edb6'});burst(p.x,p.y,'#c6e9ac',20);tone(659,.3,'sine',.035);saveGame();}
function dash(){if(state.paused||state.dialog||state.stage!=='playing'||state.romancePose)return;const p=state.player;if(p.dashCD>0)return;p.dashCD=Math.max(.8,2.2-(classInfo().dash||0));p.invuln=.45;let dx=input.joyX+(input.keys.has('KeyD')||input.keys.has('ArrowRight')?1:0)-(input.keys.has('KeyA')||input.keys.has('ArrowLeft')?1:0),dy=input.joyY+(input.keys.has('KeyS')||input.keys.has('ArrowDown')?1:0)-(input.keys.has('KeyW')||input.keys.has('ArrowUp')?1:0);if(!dx&&!dy){const a=aim();dx=Math.cos(a);dy=Math.sin(a);}const len=Math.hypot(dx,dy)||1;for(let j=0;j<16;j++){moveEntity(p,dx/len*4,dy/len*4);if(j%3===0)fx('spark',p.x,p.y-10,{color:'#e4e8ce',size:3});}tone(220,.15,'sine',.02);}
function die(){state.paused=true;openModal('death');}
function respawn(){const p=state.player;state.scene='overworld';p.x=512;p.y=1340;p.hp=p.maxHp;p.mp=p.maxMp;if(!rpg.count('potion'))rpg.give('potion');p.invuln=2;closeModal();state.projectiles=[];state.areas=[];state.summons=[];for(const e of state.enemies)if(e.hp>0){e.x=e.homeX;e.y=e.homeY;e.hp=e.maxHp;e.windup=0;}view.camera.x=p.x;view.camera.y=p.y;toast('Орен вернул тебя к жизни. Память осталась с тобой.');saveGame();}
function finishStory(){dialog([
 ['Амо','Ты пришёл. Я слышала, как мир забывает меня. Сначала лицо. Потом голос. А потом… кто-то произнёс моё имя.','liora','У СТАРОГО СВЯТИЛИЩА'],
 ['Морриган','Я обещал, что мы увидим море.','hero',''],
 ['Амо','Тогда пойдём. Только медленно. Я хочу запомнить эту дорогу.','liora',''],
 ],()=>{state.quest=5;state.ending=true;updateQuest();saveGame();burst(512,145,'#f1e4ad',60);transition('Пока ты помнишь','КОНЕЦ ПЕРВОЙ ГЛАВЫ');setTimeout(()=>openModal('ending'),3000);});}
function saveGame(){if(state.stage!=='playing')return;try{const p=state.player;localStorage.setItem(SAVE,JSON.stringify({version:2,quest:state.quest,player:{...p},shards:state.shards.map(s=>s.collected),enemies:state.enemies.map(e=>({id:e.id,hp:e.hp})),killCount:state.killCount,herb:state.herb,herbReward:state.herbReward,ending:state.ending,...rpg?.serialize(),time:Date.now()}));return true;}catch{return false;}}
function hasSave(){try{const s=JSON.parse(localStorage.getItem(SAVE));return [1,2].includes(s?.version)&&CLASSES[typeKey(s.player?.type)]&&Array.isArray(s.shards)&&Array.isArray(s.enemies)&&Number.isInteger(s.quest)&&s.quest>=0&&s.quest<=5;}catch{return false;}}
function continueGame(){if(!hasSave()){toast('Сохранение не найдено');return;}const s=JSON.parse(localStorage.getItem(SAVE)),p=freshPlayer(s.player.type);Object.assign(p,s.player,{type:typeKey(s.player.type),attackCD:0,invuln:1,cooldowns:[0,0,0],moving:false,flash:0});p.hp=Math.max(1,Math.min(p.hp,p.maxHp));p.x=Number(p.x)||512;p.y=Number(p.y)||1340;Object.assign(state,{player:p,quest:s.quest,killCount:s.killCount||0,herb:!!s.herb,herbReward:!!s.herbReward,ending:!!s.ending,stage:'playing',paused:false,npcs:npcData(),enemies:enemiesData(),effects:[],projectiles:[],areas:[]});state.shards.forEach((sh,i)=>sh.collected=!!s.shards[i]);for(const e of state.enemies){const saved=s.enemies.find(en=>en.id===e.id);if(saved)e.hp=Math.max(0,Math.min(e.maxHp,saved.hp));}if(s.quest>=4){Object.assign(state.npcs[2],{hidden:false,x:512,y:145,marker:'!'});}rpg.restore(s);view.camera.x=p.x;view.camera.y=p.y;hide('start-screen');show('hud');drawPortraits();updateSkills();updateQuest();initAudio();toast(s.version===1?'Сохранение обновлено: доступны ремёсла и новый квартал':'Путешествие продолжается');}
$('continue-button').addEventListener('click',continueGame);
function openModal(kind){if(state.dialog)return;state.paused=true;input.keys.clear();input.attack=false;state.modal=kind;show('modal');const el=$('modal-content');
 if(rpg?.renderModal(kind))return;$('modal').querySelector('.modal-card').classList.remove('rpg-folio');
 const button=(id,label,primary=false)=>`<button id="${id}" class="${primary?'primary-button':'secondary-button'}">${label}</button>`;
 if(kind==='pause')el.innerHTML=`<small class="modal-kicker">TILL YOU REMEMBER</small><h2>Мир подождёт.</h2><p>Путешествие сохраняется на этом устройстве. Сделай вдох — Амо всё ещё ждёт.</p>${button('resume-game','Вернуться к истории →',true)}${button('save-game','Сохранить путешествие')}${button('controls-help','Как играть')}${button('back-title','Главное меню')}`;
 if(kind==='controls')el.innerHTML=`<small class="modal-kicker">ПУТЬ НАЧИНАЕТСЯ С ШАГА</small><h2>Как играть</h2><p>На телефоне двигайся левым джойстиком. Удерживай большую кнопку справа для атаки — герой сам выберет ближайшую цель. Маленькая кнопка рядом — рывок с короткой неуязвимостью.</p><p>Три квадратные кнопки — умения класса. Сердце — лечебное зелье. Приблизься к человеку или осколку: появится кнопка взаимодействия. ◇ указывает путь к цели.</p><div class="control-list"><span><kbd>WASD / стрелки</kbd> · ходьба</span><span><kbd>Клик / K</kbd> · атака</span><span><kbd>1 / 2 / 3</kbd> · умения</span><span><kbd>Пробел</kbd> · рывок</span><span><kbd>F</kbd> · разговор / сбор</span><span><kbd>Q</kbd> · зелье</span><span><kbd>J / M</kbd> · журнал / карта</span><span><kbd>Esc</kbd> · пауза</span></div>${button('resume-game','Я готов →',true)}`;
 if(kind==='journal'){const collected=state.shards.filter(s=>s.collected).length;const steps=[['Поговорить с Ореном у колодца',state.quest>=2],['Собрать осколки памяти · '+collected+' / 3',collected===3],['Победить Хранителя забвения',state.quest>=4],['Вернуть Амо',state.quest>=5]];el.innerHTML=`<small class="modal-kicker">ЖУРНАЛ ПУТЕШЕСТВИЯ · ГЛАВА I</small><h2>Следы в тишине</h2><p>Амо увели к старому святилищу. Пока её имя живёт в твоей памяти, ещё не всё потеряно.</p>${steps.map(([title,done],i)=>`<div class="journal-step ${done?'done':i===steps.findIndex(s=>!s[1])?'active':''}"><span>${done?'✓':'◇'}</span>${title}</div>`).join('')}<h3>В дорожной сумке</h3><p>Зелья: ${state.player.potions} · Монеты: ${state.player.gold} · Уровень: ${state.player.level}<br>Опыт: ${state.player.xp} / ${state.player.level*60} · Побеждено теней: ${state.killCount}</p>${state.herb?`<h3>Дар у моста</h3><p>${state.herbReward?'✓ Лунный мох собран, два зелья получены.':'Найдите лунный мох у восточного фонаря моста.'}</p>`:''}${button('resume-game','Продолжить путь →',true)}`;}
 if(kind==='map'){el.innerHTML=`<small class="modal-kicker">ЗЕМЛИ ТИХОЛЕСЬЯ</small><h2>Твоя дорога</h2><canvas id="map-canvas" width="512" height="768"></canvas><div class="map-legend"><span>● Ты</span><span>◇ Цель</span><span>✦ Память</span><span>× Тени</span></div>`;drawMap();}
 if(kind==='death')el.innerHTML=`<small class="modal-kicker">ЭТО ЕЩЁ НЕ КОНЕЦ</small><h2>Память не гаснет.</h2><p>Тени оказались сильнее. Но твоё обещание осталось. Ты вернёшься в деревню с сохранёнными осколками и опытом.</p>${button('respawn','Попробовать снова →',true)}`;
 if(kind==='newgame')el.innerHTML=`<small class="modal-kicker">НОВОЕ ПУТЕШЕСТВИЕ</small><h2>Начать с чистого листа?</h2><p>На этом устройстве уже есть история. Новое путешествие заменит сохранение.</p>${button('confirm-new','Начать новую историю →',true)}${button('load-existing','Продолжить сохранённую историю')}`;
 if(kind==='ending')el.innerHTML=`<small class="modal-kicker">ГЛАВА I · ЗАВЕРШЕНА</small><h2>Она помнит тебя.</h2><p>Ты вернул Амо. Не потому, что был сильнее тьмы, а потому, что не позволил ей стать забытой.</p><p>Побеждено теней: ${state.killCount} · Уровень: ${state.player.level}<br>Все три воспоминания снова принадлежат вам.</p><h3>Дальше — к морю.</h3><p>Первая глава завершена. Можно вернуться в Тихолесье и ещё немного побыть в этом мире.</p>${button('resume-game','Остаться в Тихолесье →',true)}${button('back-title','К началу истории')}`;
 if(kind==='pause'||kind==='controls')el.insertAdjacentHTML('beforeend',`<h3>Сохранение в дорогу</h3><p>Перенесите путешествие на другой адрес или устройство с помощью файла.</p>${button('export-save','Скачать сохранение в файл')}${button('import-save','Загрузить сохранение из файла')}`);
 el.querySelector('#resume-game')?.addEventListener('click',closeModal);
 el.querySelector('#save-game')?.addEventListener('click',()=>toast(saveGame()?'Путешествие сохранено':'Браузер не разрешил сохранение',true));
 el.querySelector('#controls-help')?.addEventListener('click',()=>openModal('controls'));
 el.querySelector('#respawn')?.addEventListener('click',respawn);
 el.querySelector('#confirm-new')?.addEventListener('click',()=>{closeModal();startGame();});
 el.querySelector('#load-existing')?.addEventListener('click',()=>{closeModal();continueGame();});
 el.querySelector('#back-title')?.addEventListener('click',()=>{saveGame();closeModal();state.stage='start';hide('hud');show('start-screen');show('continue-button');state.npcs[2].hidden=true;view.camera.x=512;view.camera.y=1260;});
}
function closeModal(){if(state.modal==='death'&&state.player.hp<=0||rpg&&!rpg.onClose())return;hide('modal');state.modal=null;state.paused=false;}
$('modal-close').addEventListener('click',closeModal);
$('pause').addEventListener('click',()=>{if(state.stage==='start')openModal('controls');else if(state.modal)closeModal();else openModal('pause');});
$('brand').addEventListener('click',e=>{e.preventDefault();if(state.stage==='playing')openModal('pause');});
function collapseQuest(){$('quest-button').classList.remove('expanded');$('quest-button').setAttribute('aria-expanded','false');}
$('journal-button').addEventListener('click',()=>openModal('journal'));$('quest-button').addEventListener('click',()=>{if(matchMedia('(max-width:700px),(pointer:coarse)').matches){const expanded=$('quest-button').classList.toggle('expanded');$('quest-button').setAttribute('aria-expanded',String(expanded));}else openModal('journal');});$('map-button').addEventListener('click',()=>openModal('map'));
$('sound').addEventListener('click',()=>{initAudio();soundOn=!soundOn;$('sound').classList.toggle('sound-on',soundOn);$('sound').setAttribute('aria-label',soundOn?'Выключить звук':'Включить звук');if(soundOn){music();tone(440,.5,'sine',.03);}});
function drawMap(){const cv=$('map-canvas'),c=cv.getContext('2d'),b=bounds(state.scene);cv.width=512;cv.height=Math.round(512*b.height/b.width);const k=512/b.width;if(state.scene==='overworld'&&art.map)c.drawImage(art.map,0,0,cv.width,cv.height);else if(state.scene==='district'&&art.district)c.drawImage(art.district,0,0,cv.width,cv.height);else if(art.interiors&&INTERIORS[state.scene]){const i=INTERIORS[state.scene].cell,w=art.interiors.width/3,h=art.interiors.height/3;c.drawImage(art.interiors,i%3*w,Math.floor(i/3)*h,w,h,0,0,cv.width,cv.height);}c.fillStyle='#20160b55';c.fillRect(0,0,cv.width,cv.height);const mark=(x,y,color,text)=>{c.font='bold 12px Georgia';c.textAlign='center';c.fillStyle=color;c.shadowColor='#000';c.shadowBlur=5;c.fillText(text,x*k,y*k);};if(state.scene==='overworld'){for(const e of state.enemies)if(e.hp>0)mark(e.x,e.y,'#d3a6b6','×');for(const s of state.shards)if(!s.collected)mark(s.x,s.y,'#a5e6e7','✦');}if(state.scene==='district')for(const d of DOORS)mark(d.x,d.y,'#f8e5b3',d.label);const target=currentTarget();if(target)mark(target.x,target.y-25,'#f7d89b','◇');mark(state.player.x,state.player.y,'#fff1b9','●');}
function enemyAI(e,dt){if(e.hp<=0||state.scene!=='overworld')return;e.flash=Math.max(0,e.flash-dt);e.attackCD-=dt;e.skillCD-=dt;e.moving=false;if(e.action){e.action.t+=dt;if(e.action.t>e.action.duration)e.action=null;}
 if(e.type==='boss'&&state.quest!==3)return;const player=state.player,guard=state.summons.find(s=>s.type==='undeadpaladin'&&s.hp>0&&distance(s,e)<110),p=guard||player,d=distance(e,p),boss=e.type==='boss';if(d>(boss?270:195)||player.y>1150)return;
 if(boss){show('boss-bar');$('boss-fill').style.width=e.hp/e.maxHp*100+'%';}
 if(e.windup>0){e.windup-=dt;if(e.windup<=0){if(distance(e,p)<(boss?75:48)){if(guard){guard.hp-=boss?25:12;fx('text',guard.x,guard.y-65,{text:boss?'−25':'−12',color:'#c6e4ae'});}else damagePlayer(boss?36:16+e.tier*5);}fx('slash',e.x,e.y,{r:boss?65:35,angle:Math.atan2(p.y-e.y,p.x-e.x),color:'#d8a4be',heavy:boss});}return;}
 if(boss&&e.skillCD<=0){e.skillCD=e.hp<e.maxHp*.5?3.4:5;const a=Math.atan2(p.y-e.y,p.x-e.x);for(let i=-1;i<=1;i++){state.projectiles.push({x:e.x,y:e.y-18,vx:Math.cos(a+i*.28)*110,vy:Math.sin(a+i*.28)*110,life:3,friendly:false,damage:22});}state.areas.push({x:p.x,y:p.y,r:52,timer:1.05,friendly:false});tone(110,.3,'sine',.025);}
 if(d>(boss?50:32)){const a=Math.atan2(p.y-e.y,p.x-e.x),speed=(boss?35:e.tier?43:39)*(e.slow>0?.35:1);moveEntity(e,Math.cos(a)*speed*dt,Math.sin(a)*speed*dt);e.dir=Math.abs(Math.cos(a))>.6?(Math.cos(a)>0?'right':'left'):(Math.sin(a)>0?'down':'up');e.moving=true;}
 else if(e.attackCD<=0){e.attackCD=boss?1.7:1.4;e.windup=boss?.65:.4;e.action={kind:'attack',t:0,duration:boss?.95:.72,dir:e.dir};fx('ring',e.x,e.y,{r:boss?60:35,color:'#e8a3a2',life:e.windup,maxLife:e.windup});}
}
function update(dt){state.time+=dt;
 for(const f of state.effects){f.life-=dt;if(f.kind==='spark'){f.x+=(f.vx||0)*dt;f.y+=(f.vy||-12)*dt;}if(f.kind==='text')f.y-=17*dt;}state.effects=state.effects.filter(f=>f.life>0);
 if(state.stage!=='playing'||state.paused||state.dialog)return;
 const p=state.player,cl=classInfo();for(const k of ['invuln','flash','attackCD','dashCD','shield'])p[k]=Math.max(0,p[k]-dt);p.cooldowns=p.cooldowns.map(n=>Math.max(0,n-dt));p.mp=Math.min(p.maxMp,p.mp+cl.regen*dt);rpg.update(dt);if(p.action){p.action.t+=dt;if(p.action.t>p.action.duration)p.action=null;}for(const h of state.pendingHits||[]){h.delay-=dt;if(h.delay<=0)h.callback();}state.pendingHits=(state.pendingHits||[]).filter(h=>h.delay>0);
 let dx=input.joyX+(input.keys.has('KeyD')||input.keys.has('ArrowRight')?1:0)-(input.keys.has('KeyA')||input.keys.has('ArrowLeft')?1:0),dy=input.joyY+(input.keys.has('KeyS')||input.keys.has('ArrowDown')?1:0)-(input.keys.has('KeyW')||input.keys.has('ArrowUp')?1:0);
 if(state.romancePose){dx=0;dy=0;}const len=Math.hypot(dx,dy);p.moving=len>.08;if(p.moving){if(len>1){dx/=len;dy/=len;}const before=p.walkDistance||0;moveEntity(p,dx*cl.speed*dt,dy*cl.speed*dt);p.moving=(p.walkDistance||0)>before+.01;p.dir=Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up';if(p.moving)collapseQuest();}
 if(input.attack)attack();for(const e of state.enemies)enemyAI(e,dt);
 for(const pr of state.projectiles){pr.life-=dt;pr.x+=pr.vx*dt;pr.y+=pr.vy*dt;if(pr.friendly){for(const e of state.enemies){if(e.hp>0&&(e.type!=='boss'||state.quest>=3)&&Math.hypot(pr.x-e.x,pr.y-(e.y-14))<19){hitEnemy(e,pr.damage);pr.life=0;break;}}}else if(Math.hypot(pr.x-p.x,pr.y-(p.y-14))<16){damagePlayer(pr.damage);pr.life=0;}}
 state.projectiles=state.projectiles.filter(pr=>pr.life>0);
 for(const a of state.areas){a.timer-=dt;if(a.timer<=0){if(a.kind==='meteor')fx('flameburst',a.x,a.y,{r:a.r,life:.65,maxLife:.65});fx('ring',a.x,a.y,{r:a.r,color:a.friendly?'#f3ba7c':'#d0a5eb'});burst(a.x,a.y,a.friendly?'#f2bc8c':'#ba94df',22);if(a.friendly){for(const e of state.enemies)if(e.hp>0&&distance(a,e)<a.r&&(e.type!=='boss'||state.quest>=3))hitEnemy(e,a.damage,true);}else if(distance(a,p)<a.r)damagePlayer(30);}}state.areas=state.areas.filter(a=>a.timer>0);
 if(state.quest>=4)hide('boss-bar');
 if(state.herb&&!state.herbReward&&p.y>630&&p.y<670){fx('spark',567,640,{color:'#c6f4ad',size:2});}
 if(state.quest===5&&state.scene==='overworld'){const l=state.npcs[2];if(distance(l,p)>180){l.x=p.x;l.y=p.y+30;}if(distance(l,p)>45){const a=Math.atan2(p.y-l.y,p.x-l.x);moveEntity(l,Math.cos(a)*82*dt,Math.sin(a)*82*dt);l.moving=true;l.dir=Math.sin(a)>0?'down':'up';}else l.moving=false;}
 state.saveTimer+=dt;if(state.saveTimer>8){state.saveTimer=0;saveGame();}
}
function hud(){const p=state.player;rpg.hud();$('hp-fill').style.width=Math.max(0,p.hp/p.maxHp*100)+'%';$('mp-fill').style.width=p.mp/p.maxMp*100+'%';$('hp-text').textContent=Math.ceil(p.hp)+' / '+p.maxHp;$('level').textContent=p.level;$('potion-count').textContent=p.potions;
 for(let i=0;i<3;i++){const el=$('skill-'+(i+1)),cd=p.cooldowns[i];el.classList.toggle('cooldown',cd>0);el.querySelector('.skill-timer').textContent=cd>0?Math.ceil(cd):'';el.style.opacity=p.mp<[20,28,45][i]&&cd===0?'.45':'';}
 $('dash').style.opacity=p.dashCD>0?'.4':'1';
 const near=nearestInteraction();if(near&&!state.paused){show('interact');$('interact-label').textContent=near.kind==='world'?near.label:near.kind==='shard'?'Собрать воспоминание':near.kind==='herb'?'Собрать лунный мох':near.value.id==='liora'?'Обнять Амо':'Поговорить · '+near.value.name;}else hide('interact');
 const target=currentTarget();if(target&&state.stage==='playing'&&!state.dialog&&!state.paused){const d=distance(p,target);$('compass').classList.toggle('hidden',d<60);const a=Math.atan2(target.y-p.y,target.x-p.x);$('compass').style.left=(50+Math.cos(a)*17)+'%';$('compass').style.top=(48+Math.sin(a)*12)+'%';$('compass-distance').textContent=Math.round(d/8)+' м';}else hide('compass');
 const region=p.y>1100?'Тихолесье':p.y>605?'Шепчущий лес':p.y>350?'Старый мост':'Забытое святилище';$('region').textContent=state.stage==='start'?'Тихолесье':state.scene==='overworld'?region:state.scene==='district'?'Рыночный квартал':({inn:'Лисья свеча',castle:'Замок',church:'Церковь',chapel:'Часовня',stables:'Конюшни',market:'Рынок',shop:'Медный ворон',workshop:'Мастерская',home:'Ваш дом'})[state.scene];$('region-label').textContent=state.quest===5?'ГЛАВА II · ДОМ ДЛЯ ДВОИХ':'ГЛАВА I · СЛЕДЫ В ТИШИНЕ';document.body.dataset.stage=state.stage;
}
function frame(now){const dt=Math.min((now-frameTime)/1000||.016,.035);frameTime=now;update(dt);view.zoom=Math.max(view.width/WORLD.width,view.width<701?(state.stage==='start'?.6:1.17):1.05);let tx=state.stage==='start'?512:state.player.x,ty=state.stage==='start'?1220:state.player.y;
 const worldBounds=bounds(state.stage==='start'?'overworld':state.scene);view.zoom=Math.max(view.zoom,view.width/worldBounds.width);const halfW=view.width/(2*view.zoom),halfH=view.height/(2*view.zoom);tx=Math.max(halfW,Math.min(worldBounds.width-halfW,tx));if(view.width>700)ty=Math.max(halfH,Math.min(worldBounds.height-halfH,ty));
 const lerp=1-Math.exp(-dt*7);view.camera.x+=(tx-view.camera.x)*lerp;view.camera.y+=(ty-view.camera.y)*lerp;
 if(state.shake>0){state.shake=Math.max(0,state.shake-dt*20);view.camera.x+=(Math.random()-.5)*state.shake;}
 drawWorld(ctx,view,state);if(now-lastHud>90){hud();lastHud=now;}requestAnimationFrame(frame);
}
function joystickReset(){input.joyX=0;input.joyY=0;input.pointerId=null;$('stick').style.transform='';}
$('joystick').addEventListener('pointerdown',e=>{if(state.paused||state.dialog)return;e.preventDefault();input.pointerId=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);moveStick(e);});
function moveStick(e){if(e.pointerId!==input.pointerId)return;const b=$('joystick').getBoundingClientRect(),dx=e.clientX-(b.left+b.width/2),dy=e.clientY-(b.top+b.height/2),r=b.width*.34,len=Math.hypot(dx,dy),f=Math.min(len,r)/(len||1);input.joyX=dx*f/r;input.joyY=dy*f/r;$('stick').style.transform=`translate(${dx*f}px,${dy*f}px)`;}
$('joystick').addEventListener('pointermove',moveStick);for(const ev of ['pointerup','pointercancel','lostpointercapture'])$('joystick').addEventListener(ev,joystickReset);
$('attack').addEventListener('pointerdown',e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);input.attack=true;attack();});for(const ev of ['pointerup','pointercancel','lostpointercapture'])$('attack').addEventListener(ev,()=>input.attack=false);
$('dash').addEventListener('pointerdown',e=>{e.preventDefault();dash();});
document.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click',()=>{if(el.dataset.suppressClick==='true'){delete el.dataset.suppressClick;return;}const action=el.dataset.action;if(action==='heal')heal();else useSkill(Number(action.slice(-1))-1);}));
canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button===0){input.attack=true;attack();}});window.addEventListener('pointerup',e=>{if(e.pointerType==='mouse')input.attack=false;});
window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();if(e.repeat)return;if(e.code==='Escape'){if(state.dialog){return;}if(state.modal)closeModal();else openModal(state.stage==='start'?'controls':'pause');return;}if(state.dialog){if(['Enter','KeyF','Space'].includes(e.code))nextDialog();return;}if(state.paused||state.stage!=='playing')return;input.keys.add(e.code);if(e.code==='KeyK')input.attack=true;if(e.code==='KeyF')interact();if(e.code==='KeyQ')heal();if(e.code==='Space')dash();if(e.code==='Digit1')useSkill(0);if(e.code==='Digit2')useSkill(1);if(e.code==='Digit3')useSkill(2);if(e.code==='KeyJ')openModal('journal');if(e.code==='KeyM')openModal('map');});
window.addEventListener('keyup',e=>{input.keys.delete(e.code);if(e.code==='KeyK')input.attack=false;});
function resetInputs(){input.keys.clear();input.attack=false;joystickReset();}
window.addEventListener('blur',()=>{resetInputs();if(state.stage==='playing'&&!state.dialog&&!state.modal)openModal('pause');});document.addEventListener('visibilitychange',()=>{if(document.hidden){saveGame();resetInputs();if(state.stage==='playing'&&!state.dialog&&!state.modal)openModal('pause');}});window.addEventListener('pagehide',saveGame);window.addEventListener('contextmenu',e=>{if(e.target.closest('#app'))e.preventDefault();});
rpg=createRPG({state,toast,saveGame,openModal,closeModal,hitEnemy,dialog,burst,queueHit,moveEntity,heal:()=>heal(true),resetInputs,updateQuest,snapCamera:()=>{view.camera.x=state.player.x;view.camera.y=state.player.y;},spawnPatrol:()=>{for(const e of state.enemies.filter(e=>e.type!=='boss'))Object.assign(e,enemy(e.id,e.homeX,e.homeY,e.tier));}});
installSaveTransfer({state,saveGame,continueGame,closeModal,toast});
updateSkillIcons=installSkillUI(state,CLASSES);
window.addEventListener('keydown',e=>{if(state.stage!=='playing'||state.dialog||e.repeat)return;const screen={KeyI:'inventory',KeyC:'character',KeyT:'talents',KeyB:'professions'}[e.code];if(screen){e.preventDefault();openModal(screen);}});
await loadArt();drawPortraits();selectClass('paladin');if(hasSave())show('continue-button');hide('loading');requestAnimationFrame(frame);
