(()=>{
  function init(){
    const de=document.documentElement.lang==='de';
    const audio=document.querySelector('.music-card audio');
    if(!audio)return;
    const card=document.createElement('div');card.className='cv-track-card';
    card.innerHTML='<img src="assets/polyrhythmic-drive.webp" alt=""><div class="cv-track-card-main"><strong class="cv-track-card-title">Polyrhythmic Drive</strong><span class="cv-track-card-meta">Techno Punch</span><input type="range" min="0" max="0" step=".1" value="0"></div><button type="button"></button><span class="cv-track-card-time">0:00</span>';
    audio.before(card);audio.controls=false;audio.hidden=true;
    const play=card.querySelector('button'),seek=card.querySelector('input'),time=card.querySelector('.cv-track-card-time');
    seek.setAttribute('aria-label',de?'Polyrhythmic Drive spulen':'Seek Polyrhythmic Drive');
    const format=t=>Number.isFinite(t)?Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0'):'0:00';
    function update(){play.textContent=audio.paused?'▶':'Ⅱ';play.setAttribute('aria-label',audio.paused?(de?'Abspielen':'Play'):'Pause');seek.disabled=!Number.isFinite(audio.duration);if(!seek.disabled){seek.max=String(audio.duration);seek.value=String(audio.currentTime);}time.textContent=format(audio.currentTime)+' / '+format(audio.duration);}
    play.addEventListener('click',()=>{if(audio.paused)audio.play().catch(()=>{});else audio.pause();});
    seek.addEventListener('input',()=>{if(Number.isFinite(audio.duration))audio.currentTime=Number(seek.value);});
    for(const event of ['play','pause','ended','timeupdate','loadedmetadata','durationchange'])audio.addEventListener(event,update);
    update();
    const section=document.querySelector('#beyond-web');
    if(section&&'IntersectionObserver'in window)new IntersectionObserver(entries=>document.body.classList.toggle('cv-music-in-view',entries[0].isIntersecting),{threshold:.15}).observe(section);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
