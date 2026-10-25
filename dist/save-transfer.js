export function installSaveTransfer({state,saveGame,continueGame,closeModal,toast}){
 const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.id='save-file';input.hidden=true;document.body.appendChild(input);
 const allowedClasses=new Set(['knight','paladin','mage','rogue','necromancer']);
 function validate(s){return s&&[1,2].includes(s.version)&&allowedClasses.has(s.player?.type)&&Number.isInteger(s.quest)&&s.quest>=0&&s.quest<=5&&Array.isArray(s.shards)&&s.shards.length===3&&Array.isArray(s.enemies)&&s.enemies.length<=100&&Number.isFinite(Number(s.player.level))&&Number(s.player.level)>=1&&Number(s.player.level)<=100;}
 document.addEventListener('click',e=>{
  if(e.target.closest('#export-save')){if(state.stage==='playing')saveGame();const value=localStorage.getItem('tyr.chapter1.v1');if(!value){toast('Сначала начните или загрузите путешествие');return;}const url=URL.createObjectURL(new Blob([value],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='till-you-remember-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Сохранение выгружено в файл',true);}
  if(e.target.closest('#import-save'))input.click();
 });
 input.addEventListener('change',async()=>{const file=input.files?.[0];input.value='';if(!file)return;const backup=localStorage.getItem('tyr.chapter1.v1');try{if(file.size>2*1024*1024)throw new Error('size');const data=JSON.parse(await file.text());if(!validate(data))throw new Error('format');localStorage.setItem('tyr.chapter1.v1',JSON.stringify(data));closeModal();continueGame();toast('Путешествие перенесено на это устройство',true);}catch{if(backup)localStorage.setItem('tyr.chapter1.v1',backup);else localStorage.removeItem('tyr.chapter1.v1');toast('Не удалось прочитать сохранение. Выберите файл этой игры.');}});
}
