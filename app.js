'use strict';
const KEY='focus-tracker-v1';
const defaults={categories:['Reading','Homework','Studying'],sessions:[],tasks:[],goals:{},settings:{sound:true}};
function load(){try{const obj=JSON.parse(localStorage.getItem(KEY));if(obj&&Array.isArray(obj.categories)&&Array.isArray(obj.sessions))return {...obj,tasks:Array.isArray(obj.tasks)?obj.tasks:[],goals:obj.goals&&typeof obj.goals==='object'?obj.goals:{},settings:obj.settings&&typeof obj.settings==='object'?obj.settings:{sound:true}};}catch(e){console.warn('Could not read saved data',e)}return structuredClone(defaults)}
let data=load();let active=null;let tickHandle=null;let audioContext=null;let goalAlerts=new Set();
const $=id=>document.getElementById(id);
function persist(){try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){alert('Unable to save data. Check available browser storage.')}}
function localDate(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function startOfDay(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate())}
function secondsFmt(seconds){const s=Math.floor(Math.max(0,seconds));return [Math.floor(s/3600),Math.floor(s/60)%60,s%60].map(x=>String(x).padStart(2,'0')).join(':')}
function shortFmt(seconds){const m=Math.round(seconds/60);return `${Math.floor(m/60)}h ${m%60}m`}
function elapsed(){return active?active.elapsed+(active.running?Math.max(0,(Date.now()-active.resumedAt)/1000):0):0}
function goalFor(activity){return data.goals[activity]||{session:0,daily:0}}
function minutesValue(id){const v=Number($(id).value);return Number.isFinite(v)?Math.min(1440,Math.max(0,Math.floor(v))):0}
function savedTodaySeconds(activity){const today=localDate(new Date());return data.sessions.filter(s=>s.activity===activity&&s.date===today).reduce((sum,s)=>sum+s.seconds,0)}
function activeTodaySeconds(activity){if(!active||active.activity!==activity)return 0;const now=Date.now(),start=new Date(active.startedAt).getTime(),todayStart=startOfDay(new Date()).getTime();if(start>=todayStart)return elapsed();if(!active.running)return 0;return Math.max(0,(now-Math.max(todayStart,active.resumedAt))/1000)}
function updateGoalInputs(){const goal=goalFor($('activity').value);$('sessionGoal').value=goal.session||0;$('dailyGoal').value=goal.daily||0;$('sessionGoal').disabled=!!active;$('dailyGoal').disabled=!!active}
function progressText(seconds,goalMinutes){return goalMinutes?`${Math.floor(seconds/60)} / ${goalMinutes} min`:'No goal'}
function setProgress(barId,seconds,goalMinutes){const bar=$(barId);bar.style.width=goalMinutes?`${Math.min(100,seconds/(goalMinutes*60)*100)}%`:'0%';bar.classList.toggle('complete',!!goalMinutes&&seconds>=goalMinutes*60)}
function updateProgress(){const activity=active?.activity||$('activity').value;const goal=goalFor(activity);const sessionSeconds=active?elapsed():0;const dailySeconds=savedTodaySeconds(activity)+activeTodaySeconds(activity);$('sessionProgress').textContent=progressText(sessionSeconds,goal.session);$('dailyProgress').textContent=progressText(dailySeconds,goal.daily);setProgress('sessionBar',sessionSeconds,goal.session);setProgress('dailyBar',dailySeconds,goal.daily)}
function playAlertSound(){if(!data.settings.sound)return;try{const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)return;audioContext=audioContext||new AudioCtx();if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});const now=audioContext.currentTime;for(const [i,freq] of [660,880].entries()){const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.frequency.value=freq;osc.type='sine';gain.gain.setValueAtTime(.0001,now+i*.24);gain.gain.exponentialRampToValueAtTime(.15,now+i*.24+.02);gain.gain.exponentialRampToValueAtTime(.0001,now+i*.24+.2);osc.connect(gain).connect(audioContext.destination);osc.start(now+i*.24);osc.stop(now+i*.24+.22)}}catch(e){console.warn('Sound unavailable',e)}}
function showGoalAlert(message){const node=document.createElement('div');node.className='goal-alert';const span=document.createElement('span');span.textContent=message;const close=document.createElement('button');close.type='button';close.textContent='Dismiss';close.addEventListener('click',()=>node.remove());node.append(span,close);$('alertRegion').prepend(node);while($('alertRegion').children.length>3)$('alertRegion').lastElementChild.remove();playAlertSound()}
// Foreground-only alerts. Future push support can use a server to schedule messages;
// no push subscription or server endpoint is included in this static GitHub Pages build.
function checkGoals(){if(!active)return;const goal=goalFor(active.activity),sessionSeconds=elapsed(),dailySeconds=savedTodaySeconds(active.activity)+activeTodaySeconds(active.activity);const day=localDate(new Date());const checks=[{type:'session',threshold:goal.session,seconds:sessionSeconds,key:`session:${active.startedAt}`},{type:'daily',threshold:goal.daily,seconds:dailySeconds,key:`daily:${day}:${active.activity}`}];for(const g of checks){if(!g.threshold||g.seconds<g.threshold*60||goalAlerts.has(g.key))continue;if(g.type==='daily'&&data.goalNotified?.[g.key])continue;goalAlerts.add(g.key);if(g.type==='daily'){data.goalNotified=data.goalNotified||{};data.goalNotified[g.key]=true;persist()}showGoalAlert(`${active.activity}: ${g.type==='session'?'session':'daily'} goal reached (${g.threshold} minutes)!`)}}
function updateTimer(){ $('timer').textContent=secondsFmt(elapsed());updateProgress();checkGoals() }
function updateButtons(){const running=!!active?.running;$('start').disabled=running;$('start').textContent=active?'Resume':'Start';$('pause').disabled=!running;$('finish').disabled=!active;$('activity').disabled=!!active;$('sessionGoal').disabled=!!active;$('dailyGoal').disabled=!!active;$('timerStatus').textContent=!active?'Choose an activity and start tracking.':running?'Tracking time now.':'Paused. Resume or finish to save.';updateTimer()}
function renderCategories(){
 const selected=$('activity').value;
 $('activity').replaceChildren();$('categories').replaceChildren();
 data.categories.forEach(c=>{
  const opt=document.createElement('option');opt.value=c;opt.textContent=c;$('activity').append(opt);
  const chip=document.createElement('button');chip.type='button';chip.className='chip category-chip';
  chip.setAttribute('aria-label',`Remove category ${c}`);chip.title=`Remove ${c}`;
  const name=document.createElement('span');name.className='chip-name';name.textContent=c;
  const x=document.createElement('span');x.className='chip-remove';x.textContent='×';x.setAttribute('aria-hidden','true');
  chip.append(name,x);chip.disabled=active?.activity===c;
  if(chip.disabled)chip.title='Finish the active timer before removing this category';
  chip.addEventListener('click',()=>{
   if(active?.activity===c)return;
   if(data.categories.length===1){alert('Keep at least one category. Add another before removing this one.');return}
   if(!confirm(`Remove category "${c}"? Previous sessions will be kept.`))return;
   data.categories=data.categories.filter(v=>v!==c);delete data.goals[c];persist();renderCategories();
  });$('categories').append(chip);
 });
 if(data.categories.includes(selected))$('activity').value=selected;updateGoalInputs();updateProgress();
}
function renderTasks(){
 const node=$('tasks');node.replaceChildren();
 const completed=data.tasks.filter(t=>t.done).length;
 $('taskCount').textContent=`${completed}/${data.tasks.length} done`;
 if(!data.tasks.length){const p=document.createElement('p');p.className='empty';p.textContent='No tasks yet. Add something to work on.';node.append(p);return}
 data.tasks.forEach(task=>{
  const row=document.createElement('div');row.className='task-row';
  const label=document.createElement('label');label.className='task-label';
  const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=!!task.done;
  checkbox.addEventListener('change',()=>{task.done=checkbox.checked;persist();renderTasks()});
  const title=document.createElement('span');title.textContent=task.title;
  if(task.done)title.className='task-done';label.append(checkbox,title);
  const remove=document.createElement('button');remove.type='button';remove.className='task-delete';remove.textContent='×';remove.title='Delete task';remove.setAttribute('aria-label',`Delete task ${task.title}`);
  remove.addEventListener('click',()=>{data.tasks=data.tasks.filter(t=>t.id!==task.id);persist();renderTasks()});
  row.append(label,remove);node.append(row);
 });
}
function totals(){const today=localDate(new Date());const day=new Date();const offset=(day.getDay()+6)%7;const weekStart=startOfDay(day);weekStart.setDate(weekStart.getDate()-offset);const sessions=data.sessions;$('todayTotal').textContent=shortFmt(sessions.filter(s=>s.date===today).reduce((a,s)=>a+s.seconds,0));$('weekTotal').textContent=shortFmt(sessions.filter(s=>new Date(s.start)>=weekStart).reduce((a,s)=>a+s.seconds,0));$('sessionCount').textContent=String(sessions.length)}
function renderChart(){const days=Number($('chartRange').value),now=new Date(),totalsByDay={};for(const s of data.sessions)totalsByDay[s.date]=(totalsByDay[s.date]||0)+s.seconds;const dates=Array.from({length:days},(_,i)=>{const d=startOfDay(now);d.setDate(d.getDate()-(days-i-1));return d});const max=Math.max(3600,...dates.map(d=>totalsByDay[localDate(d)]||0));$('chart').replaceChildren();dates.forEach((d,i)=>{const seconds=totalsByDay[localDate(d)]||0;const col=document.createElement('div');col.className='bar-column';const track=document.createElement('div');track.className='bar-track';const bar=document.createElement('div');bar.className='bar';bar.style.height=`${seconds/max*100}%`;bar.title=`${localDate(d)}: ${shortFmt(seconds)}`;track.append(bar);const label=document.createElement('small');label.textContent=days===7?d.toLocaleDateString(undefined,{weekday:'short'}):(i%5===0||i===days-1?String(d.getDate()):'');col.append(track,label);$('chart').append(col)})}
function renderHistory(){const node=$('history');node.replaceChildren();if(!data.sessions.length){const p=document.createElement('p');p.className='empty';p.textContent='No sessions yet. Start your first timer above.';node.append(p);return}data.sessions.slice().reverse().slice(0,30).forEach(s=>{const item=document.createElement('div');item.className='history-item';const left=document.createElement('div');const title=document.createElement('strong');title.textContent=s.activity;const sub=document.createElement('small');sub.textContent=new Date(s.start).toLocaleString(undefined,{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'});left.append(title,sub);const dur=document.createElement('span');dur.className='duration';dur.textContent=shortFmt(s.seconds);item.append(left,dur);node.append(item)})}
function render(){renderCategories();totals();renderChart();renderHistory();renderTasks();updateButtons()}
$('activity').addEventListener('change',()=>{updateGoalInputs();updateProgress()});
for(const [id,type] of [['sessionGoal','session'],['dailyGoal','daily']])$(id).addEventListener('change',()=>{const category=$('activity').value;data.goals[category]={...goalFor(category),[type]:minutesValue(id)};persist();updateGoalInputs();updateProgress()});
$('soundEnabled').checked=data.settings.sound!==false;$('soundEnabled').addEventListener('change',()=>{data.settings.sound=$('soundEnabled').checked;persist()});
$('start').addEventListener('click',()=>{if(!active){active={activity:$('activity').value,startedAt:new Date().toISOString(),elapsed:0,resumedAt:Date.now(),running:true}}else{active.resumedAt=Date.now();active.running=true}updateButtons();renderCategories()});
$('pause').addEventListener('click',()=>{if(!active?.running)return;active.elapsed=elapsed();active.running=false;updateButtons()});
$('finish').addEventListener('click',()=>{if(!active)return;checkGoals();const seconds=Math.round(elapsed());if(seconds<1){active=null;updateButtons();return}data.sessions.push({id:crypto.randomUUID(),activity:active.activity,start:active.startedAt,date:localDate(new Date(active.startedAt)),seconds});active=null;persist();render()});
$('addCategoryForm').addEventListener('submit',e=>{e.preventDefault();const name=$('newCategory').value.trim();if(!name)return;if(data.categories.some(c=>c.toLowerCase()===name.toLowerCase())){alert('That category already exists.');return}data.categories.push(name);$('newCategory').value='';persist();renderCategories();$('activity').value=name});
$('addTaskForm').addEventListener('submit',e=>{e.preventDefault();const title=$('newTask').value.trim();if(!title)return;data.tasks.push({id:crypto.randomUUID(),title,done:false});$('newTask').value='';persist();renderTasks()});
$('chartRange').addEventListener('change',renderChart);
$('export').addEventListener('click',()=>{const rows=[['Activity','Start','Date','Duration (minutes)'],...data.sessions.map(s=>[s.activity,s.start,s.date,(s.seconds/60).toFixed(2)])];const csv=rows.map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`focus-tracker-${localDate(new Date())}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
tickHandle=setInterval(()=>{updateTimer();if(!active)totals()},1000);
render();
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.warn));
