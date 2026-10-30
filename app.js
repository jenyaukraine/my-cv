(()=>{
 const de=document.documentElement.lang==='de';
 const api=location.hostname==='jenyaukraine.github.io'?'https://inkora.at/cv/api':new URL('api',location.href).href;
 let session;try{session=sessionStorage.getItem('cv-session');if(!session){session=crypto.randomUUID();sessionStorage.setItem('cv-session',session);}}catch{session=crypto.randomUUID();}
 const tracking=!new URLSearchParams(location.search).has('preview')&&navigator.doNotTrack!=='1';
 let visitor=session;if(tracking){try{visitor=localStorage.getItem('cv-visitor');if(!visitor){visitor=crypto.randomUUID();localStorage.setItem('cv-visitor',visitor);}}catch{visitor=session;}}
 const status=document.querySelector('.stats-status');
 const render=data=>{for(const key of ['online','today','total','unique'])document.querySelectorAll(`[data-stat="${key}"]`).forEach(el=>{el.textContent=new Intl.NumberFormat(de?'de-DE':'en-GB').format(data[key]);});if(status)status.textContent='';};
 const unavailable=()=>{document.querySelectorAll('[data-stat]').forEach(e=>e.textContent='—');if(status)status.textContent=de?'Statistik momentan nicht verfügbar.':'Statistics are temporarily unavailable.';};
 async function request(endpoint,data){const r=await fetch(api+endpoint,{method:data?'POST':'GET',headers:data?{'Content-Type':'application/json'}:{},body:data?JSON.stringify({session,...data}):undefined,keepalive:!!data,credentials:'omit'});if(!r.ok)throw new Error('Request failed');return r.json();}
 request('/profile').then(profiles=>{for(const [key,value]of Object.entries(profiles[de?'de':'en']||{}))if(value)document.querySelectorAll(`[data-profile="${key}"]`).forEach(e=>e.textContent=value);}).catch(()=>{});
 const q=new URLSearchParams(location.search);
 const start=tracking?request('/visit',{visitor,page:de?'de':'en',referrer:document.referrer,visible:!document.hidden,utm:{source:q.get('utm_source'),campaign:q.get('utm_campaign')}}):request('/stats');
 start.then(render).catch(unavailable);
 const refresh=()=>{if(document.hidden)return;request(tracking?'/heartbeat':'/stats',tracking?{visible:true}:null).then(render).catch(unavailable);};
 setInterval(refresh,30000);
 document.addEventListener('visibilitychange',()=>{if(!tracking)return;if(document.hidden)request('/heartbeat',{visible:false}).catch(()=>{});else refresh();});
 addEventListener('pagehide',()=>{if(tracking)request('/heartbeat',{visible:false}).catch(()=>{});});
 document.querySelectorAll('a[href$=".pdf"],a[href^="mailto:"],a[href^="https://github.com/jenyaukraine"]').forEach(a=>a.addEventListener('click',()=>{const name=a.getAttribute('href').endsWith('.pdf')?'pdf':a.getAttribute('href').startsWith('mailto:')?'contact':'github';if(tracking)start.then(()=>request('/event',{name})).catch(()=>{});}));
})();
