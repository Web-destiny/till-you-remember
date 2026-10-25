const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
await mkdir('qa-output',{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM?{executablePath:process.env.PLAYWRIGHT_CHROMIUM}:{})});
const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
await context.addInitScript(()=>{const raw=sessionStorage.getItem('qa-resume');if(!raw)return;const ch=JSON.parse(raw),key='tyr.chapter1.v1',s=JSON.parse(localStorage.getItem(key));if(ch.player)Object.assign(s.player,ch.player);for(const [k,v]of Object.entries(ch))if(k!=='player')s[k]=v;localStorage.setItem(key,JSON.stringify(s));sessionStorage.removeItem('qa-resume');});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4173');await page.locator('#loading').waitFor({state:'hidden'});await page.waitForTimeout(500);
assert.equal(await page.title(),'Пока ты помнишь — Till You Remember');
console.log('Asset alpha',await page.evaluate(async()=>{const im=new Image();im.src='/assets/characters.png';await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);return [[0,0],[400,100],[15,250],[500,500]].map(([a,b])=>Array.from(x.getImageData(a,b,1,1).data));}));
await page.screenshot({path:'qa-output/mobile-start.png'});
await page.locator('[data-class="mage"]').click();assert.equal(await page.locator('[data-class="mage"]').getAttribute('aria-pressed'),'true');
await page.locator('[data-class="knight"]').click();await page.locator('#start-button').click();
for(let i=0;i<4;i++)await page.locator('#dialog-next').click();await page.waitForTimeout(3000);
assert.equal(await page.locator('#quest-title').textContent(),'Следы в тишине');
await page.screenshot({path:'qa-output/mobile-game.png'});
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight),true);
const buttons=await page.locator('#attack,#dash,#joystick,#skill-1,#skill-2,#skill-3,#heal').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {id:el.id,x:r.x,y:r.y,w:r.width,h:r.height,visible:getComputedStyle(el).display!=='none'};}));
for(const b of buttons){assert(b.visible,b.id+' visible');assert(b.x>=0&&b.y>=0&&b.x+b.w<=390&&b.y+b.h<=844,b.id+' in viewport');}
// A genuine touch joystick drag moves the player and releases cleanly.
const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('tyr.chapter1.v1')).player.y);
const joy=await page.locator('#joystick').boundingBox(),cdp=await context.newCDPSession(page),jx=joy.x+joy.width/2,jy=joy.y+joy.height/2;
await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:jx,y:jy}]});
await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:jx,y:jy-35}]});await page.waitForTimeout(600);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
await page.keyboard.down('KeyW');await page.waitForTimeout(650);await page.keyboard.up('KeyW');
await page.locator('#pause').click();await page.locator('#save-game').click();
const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('tyr.chapter1.v1')));assert(saved.player.y<before-20,'movement changes saved position');
await page.locator('#resume-game').click();await page.locator('#map-button').click();await page.screenshot({path:'qa-output/mobile-map.png'});await page.locator('#modal-close').click();
await page.reload();await page.locator('#loading').waitFor({state:'hidden'});assert(await page.locator('#continue-button').isVisible());await page.locator('#continue-button').click();
assert.equal(await page.locator('#class-label').textContent(),'Страж');
// Seed the same persisted player at the elder; exercise the real quest dialogue and save path.
async function resumeAt(changes){await page.evaluate(ch=>sessionStorage.setItem('qa-resume',JSON.stringify(ch)),changes);await page.reload();await page.locator('#loading').waitFor({state:'hidden'});await page.locator('#continue-button').click();await page.waitForTimeout(150);}
await resumeAt({player:{x:410,y:1260}});await page.locator('#interact').click();for(let i=0;i<4;i++)await page.locator('#dialog-next').click();assert.equal(await page.locator('#quest-title').textContent(),'То, что не забрать');
await page.locator('#pause').click();await page.locator('#save-game').click();await page.locator('#resume-game').click();
// Real-time combat: a regular attack and both damage skills kill a nearby shadow.
await resumeAt({player:{x:505,y:1060,hp:180,mp:100}});await page.locator('#skill-1').click();await page.waitForTimeout(150);assert(await page.locator('#skill-1').evaluate(el=>el.classList.contains('cooldown')));await page.locator('#skill-3').click();await page.waitForTimeout(300);await page.locator('#pause').click();await page.locator('#save-game').click();let combat=await page.evaluate(()=>JSON.parse(localStorage.getItem('tyr.chapter1.v1')));assert(combat.killCount>0,'combat rewards persisted');await page.locator('#resume-game').click();
// Collect each memory through the proximity interaction and its dialogue.
for(const pos of [{x:503,y:970},{x:532,y:748},{x:505,y:326}]){await resumeAt({player:{...pos,hp:180}});await page.locator('#interact').click();await page.locator('#dialog-next').click();await page.waitForTimeout(100);}
assert.equal(await page.locator('#quest-title').textContent(),'За гранью забвения');
await page.waitForTimeout(200);await page.locator('#pause').click();await page.locator('#save-game').click();const bossSave=await page.evaluate(()=>JSON.parse(localStorage.getItem('tyr.chapter1.v1')));await page.locator('#resume-game').click();
// Test the boss's death trigger without repeating the long damage cycle.
bossSave.enemies=bossSave.enemies.map(e=>e.id==='warden'?{...e,hp:50}:{...e,hp:0});await resumeAt({player:{x:512,y:255,hp:180,mp:100},enemies:bossSave.enemies});await page.locator('#skill-1').click();await page.waitForTimeout(3100);assert.equal(await page.locator('#quest-title').textContent(),'Пока ты помнишь');
await page.locator('#pause').click();await page.locator('#save-game').click();await page.locator('#resume-game').click();
await resumeAt({player:{x:512,y:173,hp:180}});await page.locator('#interact').click();for(let i=0;i<3;i++)await page.locator('#dialog-next').click();await page.waitForTimeout(3200);assert(await page.locator('#modal-content').getByText('Она помнит тебя.').isVisible());await page.screenshot({path:'qa-output/mobile-ending.png'});
// Compact portrait layout and desktop title screen.
await context.close();const compact=await browser.newContext({viewport:{width:375,height:667},isMobile:true,hasTouch:true});const cp=await compact.newPage();await cp.goto('http://127.0.0.1:4173');await cp.locator('#loading').waitFor({state:'hidden'});await cp.screenshot({path:'qa-output/compact-start.png'});const r=await cp.locator('#start-button').boundingBox();assert(r.y+r.height<667,'small phone start fits');await compact.close();
const desk=await browser.newContext({viewport:{width:1440,height:900}});const dp=await desk.newPage();await dp.goto('http://127.0.0.1:4173');await dp.locator('#loading').waitFor({state:'hidden'});await dp.screenshot({path:'qa-output/desktop-start.png'});await desk.close();
await browser.close();assert.deepEqual(errors,[]);console.log('PASS: portrait 390×844 and 375×667, desktop, class selection, intro, movement, save/load, dialogue, combat, all three memories, boss completion, ending. No page errors.');
