(()=>{
 function init(){
 const de=document.documentElement.lang==='de',key='cv-music-choice';
 try{if(sessionStorage.getItem(key))return;}catch{}
 const track=document.querySelector('audio[aria-label*="Pentaloop"]');if(!track)return;
 const invite=document.createElement('aside');invite.className='cv-music-invite';invite.setAttribute('aria-label',de?'Musik des Autors':'Music by the author');
 invite.innerHTML=`<p class="cv-music-kicker">TECHNO PUNCH / PENTALOOP</p><h2>${de?'Meinen Lebenslauf mit meiner Musik lesen?':'Read my CV with my music?'}</h2><p>${de?'Pentaloop — ein Track aus meiner eigenen Musikproduktion.':'Pentaloop — a track from my own music production.'}</p><button type="button" class="cv-music-play">${de?'Pentaloop abspielen':'Play Pentaloop'} ▷</button><button type="button" class="cv-music-dismiss">${de?'Ohne Musik':'No thanks'}</button><p class="cv-music-status" role="status"></p>`;
 const remember=value=>{try{sessionStorage.setItem(key,value);}catch{}};
 function compact(){invite.replaceChildren();const bar=document.createElement('div');bar.className='cv-music-playing';const name=document.createElement('p');name.textContent='♫ Pentaloop · Techno Punch';const control=document.createElement('button');control.className='cv-music-play';const update=()=>{control.textContent=track.paused?(de?'Abspielen':'Play'):'Pause';};update();control.addEventListener('click',()=>{if(track.paused)track.play().catch(()=>{});else track.pause();});track.addEventListener('play',update);track.addEventListener('pause',update);track.addEventListener('ended',update);const close=document.createElement('button');close.className='cv-music-close';close.textContent='×';close.setAttribute('aria-label',de?'Musik stoppen und schließen':'Stop music and close');close.addEventListener('click',()=>{track.pause();invite.remove();});bar.append(name,control,close);invite.append(bar);}
 invite.querySelector('.cv-music-dismiss').addEventListener('click',()=>{remember('declined');invite.remove();});
 invite.querySelector('.cv-music-play').addEventListener('click',()=>{track.play().then(()=>{remember('accepted');compact();}).catch(()=>{invite.querySelector('.cv-music-status').textContent=de?'Wiedergabe konnte nicht gestartet werden. Bitte erneut versuchen.':'Playback could not start. Please try again.';});});
 document.body.append(invite);
 }
 if(document.readyState==='complete')init();else addEventListener('DOMContentLoaded',init,{once:true});
})();
