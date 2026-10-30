(()=>{
 function init(){
  const de=document.documentElement.lang==='de',track=document.querySelector('audio[aria-label*="Pentaloop"]');if(!track)return;
  const format=t=>Number.isFinite(t)?Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0'):'—:—';
  function player(floating){
   const box=document.createElement(floating?'aside':'div');box.className=floating?'cv-music-invite cv-player':'cv-player cv-inline-player';box.setAttribute('aria-label',de?'Pentaloop Musikplayer':'Pentaloop music player');
   box.innerHTML='<div class="cv-player-top"><img src="assets/pentaloop.webp" width="48" height="48" alt="Pentaloop cover"><div class="cv-player-name"><strong>Pentaloop</strong><span>Techno Punch</span></div><button type="button" class="cv-player-toggle"></button><button type="button" class="cv-speaker"></button></div><input class="cv-player-seek" type="range" min="0" max="0" step=".1" value="0"><div class="cv-player-times"><span></span><span></span></div>';
   const play=box.querySelector('.cv-player-toggle'),speaker=box.querySelector('.cv-speaker'),seek=box.querySelector('input'),times=box.querySelectorAll('.cv-player-times span');seek.setAttribute('aria-label',de?'Pentaloop spulen':'Seek Pentaloop');
   function update(){play.textContent=track.paused?'▶':'Ⅱ';play.setAttribute('aria-label',track.paused?(de?'Abspielen':'Play'):'Pause');speaker.textContent=track.muted?'🔇':'🔊';speaker.setAttribute('aria-label',track.muted?(de?'Ton einschalten':'Unmute'):(de?'Ton ausschalten':'Mute'));times[0].textContent=format(track.currentTime);times[1].textContent=format(track.duration);seek.disabled=!Number.isFinite(track.duration);if(!seek.disabled){seek.max=String(track.duration);seek.value=String(track.currentTime);}}
   play.addEventListener('click',()=>{if(track.paused)track.play().catch(()=>{});else track.pause();});speaker.addEventListener('click',()=>{if(track.paused){track.muted=false;track.play().catch(()=>{});}else track.muted=!track.muted;update();});seek.addEventListener('input',()=>{if(Number.isFinite(track.duration))track.currentTime=Number(seek.value);});
   for(const event of ['play','pause','ended','timeupdate','loadedmetadata','durationchange','volumechange'])track.addEventListener(event,update);update();return box;
  }
  document.body.append(player(true));const inline=track.closest('.next-track');if(inline){const custom=player(false);inline.replaceChildren(custom,track);track.controls=false;track.hidden=true;}
  track.volume=.3;track.play().catch(()=>{});
 }
 if(document.readyState==='complete')init();else addEventListener('DOMContentLoaded',init,{once:true});
})();
