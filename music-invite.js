(()=>{
 function init(){
 const de=document.documentElement.lang==='de',key='cv-music-choice';
 try{if(sessionStorage.getItem(key))return;}catch{}
 const track=document.querySelector('audio[aria-label*="Pentaloop"]');if(!track)return;
 const invite=document.createElement('aside');invite.className='cv-music-invite';invite.setAttribute('aria-label',de?'Musik des Autors':'Music by the author');
 invite.innerHTML=`<p class="cv-music-kicker">TECHNO PUNCH / PENTALOOP</p><h2>${de?'Meinen Lebenslauf mit meiner Musik lesen?':'Read my CV with my music?'}</h2><p>${de?'Pentaloop — ein Track aus meiner eigenen Musikproduktion.':'Pentaloop — a track from my own music production.'}</p><button type="button" class="cv-music-play">${de?'Pentaloop abspielen':'Play Pentaloop'} ▷</button><button type="button" class="cv-music-dismiss">${de?'Ohne Musik':'No thanks'}</button><p class="cv-music-status" role="status"></p>`;
 const remember=value=>{try{sessionStorage.setItem(key,value);}catch{}};
 function compact(){
  invite.replaceChildren();invite.classList.add('cv-player');
  const top=document.createElement('div');top.className='cv-player-top';
  const cover=document.createElement('img');cover.src='assets/pentaloop.webp';cover.alt='Pentaloop cover';cover.width=48;cover.height=48;
  const name=document.createElement('div');name.className='cv-player-name';const title=document.createElement('strong');title.textContent='Pentaloop';const artist=document.createElement('span');artist.textContent='Techno Punch';name.append(title,artist);
  const control=document.createElement('button');control.className='cv-player-toggle';control.type='button';
  const close=document.createElement('button');close.className='cv-music-close';close.type='button';close.textContent='×';close.setAttribute('aria-label',de?'Musik stoppen und schließen':'Stop music and close');
  top.append(cover,name,control,close);
  const seek=document.createElement('input');seek.type='range';seek.className='cv-player-seek';seek.min='0';seek.max=String(Number.isFinite(track.duration)?track.duration:0);seek.step='.1';seek.value=String(track.currentTime);seek.setAttribute('aria-label',de?'Pentaloop spulen':'Seek Pentaloop');
  const times=document.createElement('div');times.className='cv-player-times';const elapsed=document.createElement('span'),duration=document.createElement('span');times.append(elapsed,duration);
  const format=t=>Number.isFinite(t)?Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0'):'—:—';
  const update=()=>{control.textContent=track.paused?'▶':'Ⅱ';control.setAttribute('aria-label',track.paused?(de?'Abspielen':'Play'):'Pause');elapsed.textContent=format(track.currentTime);duration.textContent=format(track.duration);if(Number.isFinite(track.duration)){seek.max=String(track.duration);seek.value=String(track.currentTime);seek.disabled=false;}else seek.disabled=true;};
  const events=['play','pause','ended','timeupdate','loadedmetadata','durationchange'];events.forEach(e=>track.addEventListener(e,update));
  seek.addEventListener('input',()=>{if(Number.isFinite(track.duration)){track.currentTime=Number(seek.value);update();}});
  control.addEventListener('click',()=>{if(track.paused)track.play().catch(()=>{});else track.pause();});
  close.addEventListener('click',()=>{track.pause();events.forEach(e=>track.removeEventListener(e,update));invite.remove();});
  invite.append(top,seek,times);update();
 }
 invite.querySelector('.cv-music-dismiss').addEventListener('click',()=>{remember('declined');invite.remove();});
 invite.querySelector('.cv-music-play').addEventListener('click',()=>{track.play().then(()=>{remember('accepted');compact();}).catch(()=>{invite.querySelector('.cv-music-status').textContent=de?'Wiedergabe konnte nicht gestartet werden. Bitte erneut versuchen.':'Playback could not start. Please try again.';});});
 document.body.append(invite);
 }
 if(document.readyState==='complete')init();else addEventListener('DOMContentLoaded',init,{once:true});
})();
