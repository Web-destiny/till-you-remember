export const SKILLS={
 paladin:[{short:'Удар',desc:'Удар мечом со светлым следом. Поражает врагов рядом.'},{short:'Защита',desc:'Золотой щит, исцеление и временное снижение входящего урона.'},{short:'Кара',desc:'Столп небесного света обрушивается на врагов вокруг.'}],
 mage:[{short:'Искры',desc:'Три огненных снаряда летят веером вперёд.'},{short:'Лёд',desc:'Кольцо ледяных кристаллов наносит урон и замедляет врагов.'},{short:'Метеор',desc:'Пылающий метеор падает в отмеченную область с задержкой.'}],
 rogue:[{short:'Рывок',desc:'Рывок к врагу и сильный удар кинжалом.'},{short:'Дым',desc:'Облако дыма скрывает героя, отравляет и замедляет врагов.'},{short:'Клинки',desc:'Семь настоящих метательных клинков расходятся веером.'}],
 necromancer:[{short:'Вытяжка',desc:'Зелёный поток вытягивает жизнь из врага и исцеляет тебя.'},{short:'Скелеты',desc:'Два скелета поднимаются из земли и атакуют врагов.'},{short:'Паладин',desc:'Призывает большого мёртвого паладина. Он сражается за тебя и принимает удары.'}]
};
export function installSkillUI(state,classes){
 let timer=null,held=null,hideTimer=null;const slots=Array.from({length:3},(_,i)=>document.getElementById('skill-'+(i+1)));
 const remove=()=>document.getElementById('skill-tooltip')?.remove();
 slots.forEach((el,i)=>{
  const picture=document.createElement('span');picture.className='skill-art';picture.setAttribute('aria-hidden','true');el.prepend(picture);const short=document.createElement('span');short.className='skill-short-name';el.appendChild(short);
  el.addEventListener('pointerdown',e=>{clearTimeout(timer);clearTimeout(hideTimer);held={el,x:e.clientX,y:e.clientY};timer=setTimeout(()=>{if(!held||state.dialog||state.paused)return;el.dataset.suppressClick='true';remove();const tooltip=document.createElement('div');tooltip.id='skill-tooltip';tooltip.setAttribute('role','tooltip');const type=state.player.type,data=SKILLS[type][i],cl=classes[type];tooltip.innerHTML='<strong>'+cl.skills[i]+'</strong>'+data.desc+'<small>Энергия '+[20,28,45][i]+' · Перезарядка '+cl.cooldowns[i]+' сек.</small>';document.getElementById('app').appendChild(tooltip);},420);});
  el.addEventListener('pointermove',e=>{if(held&&Math.hypot(e.clientX-held.x,e.clientY-held.y)>12){clearTimeout(timer);held=null;}});
  for(const ev of ['pointerup','pointercancel'])el.addEventListener(ev,()=>{clearTimeout(timer);held=null;hideTimer=setTimeout(remove,1700);if(ev==='pointercancel')delete el.dataset.suppressClick;});
 });
 return type=>{const row=['paladin','mage','rogue','necromancer'].indexOf(type);slots.forEach((el,i)=>{el.classList.add('has-art');el.style.setProperty('--skill-x',(i/2*100)+'%');el.style.setProperty('--skill-y',(row/3*100)+'%');el.querySelector('.skill-short-name').textContent=SKILLS[type][i].short;el.title=classes[type].skills[i]+'\n'+SKILLS[type][i].desc;});};
}
