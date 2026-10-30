(()=>{
 'use strict';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const de=document.documentElement.lang==='de';
 const body=document.body;
 const canvas=document.createElement('canvas');canvas.className='matrix-world-canvas';canvas.setAttribute('aria-hidden','true');
 const liftsLayer=document.createElement('div');liftsLayer.className='matrix-lifts';liftsLayer.setAttribute('aria-hidden','true');
 const actor=document.createElement('div');actor.className='matrix-neo';actor.setAttribute('aria-hidden','true');
 const sprite=document.createElement('div');sprite.className='matrix-neo-sprite';actor.append(sprite);
 body.prepend(canvas,liftsLayer,actor);
 const ctx=canvas.getContext('2d');
 if(!ctx){canvas.remove();liftsLayer.remove();actor.remove();return;}
 const sections=[document.querySelector('.hero'),...document.querySelectorAll('main > section')].filter(Boolean);
 const lifts=sections.map((section,i)=>{const el=document.createElement('div');el.className='matrix-lift';el.innerHTML='<div class="matrix-lift-display"></div><div class="matrix-lift-doors"><i></i><i></i></div><div class="matrix-lift-floor"></div>';el.querySelector('.matrix-lift-display').textContent=String(i+1).padStart(2,'0')+' / '+(i%2?'WEST':'EAST');liftsLayer.append(el);return{el,section,x:0,y:0,w:0,h:0};});
 const toggle=document.createElement('button');toggle.type='button';toggle.className='matrix-motion-toggle';body.append(toggle);
 let width=0,height=0,size=180,rain=[],active=-1,elapsed=0,last=0,lastPaint=0,scrollY=window.scrollY,direction=1,scrollingUntil=0,lastShot=0,flight=null,x=0,y=0,frame=0,paused=reduced.matches;
 let beams=[],revealed=false,enabled=!body.classList.contains('theme-light');
 body.classList.toggle('matrix-world',enabled);
 const updateToggle=()=>{toggle.hidden=reduced.matches||!enabled;toggle.textContent=paused?(de?'Animation starten':'Resume motion'):(de?'Animation pausieren':'Pause motion');toggle.setAttribute('aria-pressed',String(paused));body.classList.toggle('matrix-paused',paused);};
 const pause=value=>{paused=value;last=0;beams=[];updateToggle();if(paused){actor.style.opacity='0';canvas.style.opacity='.18';ctx.clearRect(0,0,width,height);}};
 toggle.addEventListener('click',()=>pause(!paused));reduced.addEventListener('change',()=>pause(reduced.matches));updateToggle();
 document.addEventListener('cv-theme-change',()=>{const next=!body.classList.contains('theme-light');if(next===enabled)return;enabled=next;body.classList.toggle('matrix-world',enabled);body.classList.remove('matrix-awake');elapsed=0;revealed=false;last=0;beams=[];actor.style.opacity='0';updateToggle();if(enabled)measure();});
 function measure(){
  width=innerWidth;height=innerHeight;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  const compact=width<1400;size=width<700?105:compact?155:Math.min(310,(width-1060)/2-25);actor.style.width=size+'px';actor.style.height=size*1.333+'px';
  const liftW=Math.max(70,size*.8),liftH=size*1.5;const rect=document.querySelector('.hero > .container')?.getBoundingClientRect();const contentLeft=rect?.left||24,contentRight=rect?.right||width-24;
  lifts.forEach((lift,i)=>{const box=lift.section.getBoundingClientRect();lift.w=liftW;lift.h=liftH;lift.x=i%2?Math.max(8,contentLeft-liftW-35):Math.min(width-liftW-8,contentRight+35);lift.y=box.top+window.scrollY+Math.min(120,box.height*.18);lift.el.style.width=liftW+'px';lift.el.style.height=liftH+'px';lift.el.style.transform=`translate3d(${lift.x}px,${lift.y}px,0)`;});
  rain=Array.from({length:Math.ceil(width/23)},()=>({y:Math.random()*height,speed:32+Math.random()*70,seed:Math.random()}));
  liftsLayer.style.height=document.documentElement.scrollHeight+'px';active=-1;flight=null;selectLift(performance.now(),true);
 }
 function selectLift(now,instant=false){
  const focus=window.scrollY+height*.36;let best=0,dist=Infinity;
  lifts.forEach((lift,i)=>{const d=Math.abs(lift.y+lift.h*.4-focus);if(d<dist){dist=d;best=i;}});
  if(best!==active){lifts[active]?.el.classList.remove('matrix-lift-active');active=best;lifts[active].el.classList.add('matrix-lift-active');
   const dest=lifts[active];const toX=dest.x+(dest.w-size)/2,toY=dest.y+dest.h*.18-window.scrollY;
   if(instant){x=toX;y=toY;flight=null;}else flight={start:now,fromX:x,fromDocY:y+window.scrollY,toX,toDocY:dest.y+dest.h*.18};
  }
 }
 const onScroll=()=>{const next=window.scrollY;if(Math.abs(next-scrollY)>1){direction=next>scrollY?1:-1;scrollingUntil=performance.now()+450;}scrollY=next;};
 addEventListener('scroll',onScroll,{passive:true});
 let resizePending=false;const resize=()=>{if(resizePending)return;resizePending=true;requestAnimationFrame(()=>{resizePending=false;measure();});};
 addEventListener('resize',resize,{passive:true});new ResizeObserver(resize).observe(document.querySelector('main'));
 document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden)beams=[];});
 const glyphs='01アイウエオカキクケコサシスセソタチツテト';
 function draw(now){
  requestAnimationFrame(draw);
  if(!enabled||paused||document.hidden){last=0;return;}
  if(now-lastPaint<40)return;const dt=last?Math.min((now-last)/1000,.08):0;last=now;lastPaint=now;elapsed+=dt;
  const strength=Math.min(1,elapsed/50);body.style.setProperty('--matrix-strength',strength.toFixed(3));canvas.style.opacity=String(.24+strength*.5);
  ctx.fillStyle='rgba(3,15,20,.10)';ctx.fillRect(0,0,width,height);ctx.font='14px monospace';
  rain.forEach((drop,i)=>{drop.y+=drop.speed*dt*(.55+strength*.8);if(drop.y>height+80)drop.y=-Math.random()*200;if(drop.seed>.24+strength*.76)return;ctx.fillStyle=frame%23===i%23?'#bdffe5':'#3da684';ctx.fillText(glyphs[(frame+i*7)%glyphs.length],i*23,drop.y);});frame++;
  selectLift(now);
  const lift=lifts[active];const targetX=lift.x+(lift.w-size)/2,targetY=lift.y+lift.h*.18-window.scrollY;
  let pose=66.666,rotation=direction*7;
  if(flight){const t=Math.min(1,(now-flight.start)/1050),ease=1-Math.pow(1-t,3);x=flight.fromX+(targetX-flight.fromX)*ease;y=flight.fromDocY+(flight.toDocY-flight.fromDocY)*ease-window.scrollY-Math.sin(t*Math.PI)*Math.min(135,height*.18);pose=t<.55?33.333:0;rotation=direction*(Math.sin(t*Math.PI)*28);if(t===1)flight=null;}
  else{x+=(targetX-x)*.18;y+=(targetY-y)*.2;}
  const entered=elapsed>6;body.classList.toggle('matrix-awake',elapsed>5);
  if(entered&&!revealed){revealed=true;flight={start:now,fromX:x+size*.4,fromDocY:y+window.scrollY+size*.4,toX:targetX,toDocY:lift.y+lift.h*.18};}
  actor.style.opacity=entered?String(Math.min(1,(elapsed-6)/1.2)*(width<700?.38:width<1400?.55:.95)):'0';
  if(entered&&now<scrollingUntil&&now-lastShot>580){lastShot=now;const startX=x+size*.6,startY=y+size*.55;beams.push({x:startX,y:startY,dir:direction,born:now});}
  if(now-lastShot<95)pose=100;
  actor.style.transform=`translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${rotation.toFixed(1)}deg)`;sprite.style.backgroundPosition=pose+'% center';
  beams=beams.filter(b=>now-b.born<220);for(const beam of beams){const p=(now-beam.born)/220;ctx.globalAlpha=(1-p)*.75;ctx.strokeStyle='#d8ffc5';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(beam.x+(active%2?-1:1)*p*90,beam.y+beam.dir*p*180);ctx.lineTo(beam.x+(active%2?-1:1)*(p*90+55),beam.y+beam.dir*(p*180+120));ctx.stroke();}ctx.globalAlpha=1;
 }
 measure();requestAnimationFrame(draw);
})();
