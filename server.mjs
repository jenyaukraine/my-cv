import http from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import {scryptSync,timingSafeEqual,randomBytes,createHash} from 'node:crypto';
import {readFileSync,createReadStream,mkdirSync,statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

export function createApp({dataDir=process.env.DATA_DIR||'data',passwordHash=process.env.ADMIN_PASSWORD_HASH,secure=process.env.NODE_ENV==='production',origin=process.env.PUBLIC_ORIGIN||'https://inkora.at',prefix=process.env.PUBLIC_PREFIX||'/cv'}={}){
 if(!passwordHash) throw new Error('ADMIN_PASSWORD_HASH is required; generate with scripts/admin-password.mjs');
 const [salt,hash]=passwordHash.split(':');
 if(!salt||!hash||hash.length!==128) throw new Error('Invalid ADMIN_PASSWORD_HASH');
 mkdirSync(dataDir,{recursive:true});
 const db=new DatabaseSync(path.join(dataDir,'analytics.sqlite'));
 db.exec(`PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS views(id INTEGER PRIMARY KEY, session TEXT NOT NULL, ts INTEGER NOT NULL, day TEXT NOT NULL, page TEXT NOT NULL, source TEXT NOT NULL, campaign TEXT NOT NULL); CREATE INDEX IF NOT EXISTS views_day ON views(day); CREATE INDEX IF NOT EXISTS views_session ON views(session,ts); CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY, session TEXT NOT NULL, ts INTEGER NOT NULL, day TEXT NOT NULL, name TEXT NOT NULL); CREATE INDEX IF NOT EXISTS events_day ON events(day); CREATE TABLE IF NOT EXISTS profile(lang TEXT PRIMARY KEY, value TEXT NOT NULL);`);
 const sessions=new Map(),active=new Map(),limits=new Map();
 const root=path.dirname(fileURLToPath(import.meta.url));
 const allowed=new Set([origin,'https://punchenko.de','https://www.punchenko.de','https://jenyaukraine.github.io',...(secure?[]:['http://localhost:8092','http://127.0.0.1:8092'])]);
 const day=(ts=Date.now())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Kyiv',year:'numeric',month:'2-digit',day:'2-digit'}).format(ts);
 const counts=()=>({online:[...active.values()].filter(t=>t>Date.now()-90000).length,today:db.prepare('SELECT COUNT(*) n FROM views WHERE day=?').get(day()).n,total:db.prepare('SELECT COUNT(*) n FROM views').get().n});
 const timer=setInterval(()=>{let now=Date.now();for(const [k,v]of active)if(v<now-90000)active.delete(k);for(const [k,v]of sessions)if(v<now)sessions.delete(k);for(const [k,v]of limits)if(v.until<now)limits.delete(k);db.prepare('DELETE FROM events WHERE ts < ?').run(now-90*86400000);db.prepare('DELETE FROM views WHERE ts < ?').run(now-90*86400000);},60000);timer.unref();
 // Lifetime page-load total is preserved independently of the 90-day detail retention.
 db.exec('CREATE TABLE IF NOT EXISTS visitors(id TEXT PRIMARY KEY, first_seen INTEGER NOT NULL);');
 db.exec('CREATE TABLE IF NOT EXISTS counters(key TEXT PRIMARY KEY,value INTEGER NOT NULL);');
 db.prepare("INSERT OR IGNORE INTO counters VALUES('total',(SELECT COUNT(*) FROM views))").run();
 const totals=()=>({...counts(),unique:db.prepare('SELECT COUNT(*) n FROM visitors').get().n,total:db.prepare("SELECT value FROM counters WHERE key='total'").get().value});
 const limit=(key,max,ms)=>{const now=Date.now();let v=limits.get(key);if(!v||v.until<now){v={count:0,until:now+ms};limits.set(key,v);}return ++v.count<=max;};
 const send=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 const body=async req=>{let text='';for await(const chunk of req){text+=chunk;if(Buffer.byteLength(text)>8192)throw new Error('Body too large');}return JSON.parse(text||'{}');};
 const ip=req=>req.socket.remoteAddress; // No forwarded IP is trusted or persisted.
 const validSid=s=>typeof s==='string'&&/^[a-zA-Z0-9-]{16,64}$/.test(s);
 const isAdmin=req=>{const token=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('cv_admin='))?.slice(9);return token&&sessions.get(token)>Date.now()?token:null;};
 const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('X-Frame-Options','DENY');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; media-src 'self'; connect-src 'self' https://inkora.at; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  const url=new URL(req.url,'http://local');const route=url.pathname;
  const requestOrigin=req.headers.origin;
  if(requestOrigin&&allowed.has(requestOrigin)){res.setHeader('Access-Control-Allow-Origin',requestOrigin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Headers','Content-Type');res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');}
  if(req.method==='OPTIONS'){res.writeHead(requestOrigin&&allowed.has(requestOrigin)?204:403);res.end();return;}
  try{
   if(route.startsWith('/api/')){
    if(req.method==='POST'&&(!requestOrigin||!allowed.has(requestOrigin)))return send(res,403,{error:'Origin not allowed'});
    if(route==='/api/health'&&req.method==='GET')return send(res,200,{ok:true});
    if(route==='/api/stats'&&req.method==='GET')return send(res,200,totals());
    if(route==='/api/profile'&&req.method==='GET'){
     const out=JSON.parse(readFileSync(path.join(root,'profile-defaults.json'),'utf8'));for(const row of db.prepare('SELECT * FROM profile').all())out[row.lang]=JSON.parse(row.value);return send(res,200,out);
    }
    if(route==='/api/login'&&req.method==='POST'){
     if(!limit('login:'+ip(req),8,900000))return send(res,429,{error:'Too many attempts. Try again in 15 minutes.'});
     const b=await body(req);if(typeof b.password!=='string'||b.password.length>256)return send(res,400,{error:'Invalid password'});
     if(b.username!=='admin'||!timingSafeEqual(scryptSync(b.password,salt,64),Buffer.from(hash,'hex')))return send(res,401,{error:'Incorrect login or password'});
     const token=randomBytes(32).toString('hex');sessions.set(token,Date.now()+8*3600000);
     res.setHeader('Set-Cookie',`cv_admin=${token}; HttpOnly; SameSite=Strict; Path=${prefix||'/'}; Max-Age=28800${secure?'; Secure':''}`);return send(res,200,{ok:true});
    }
    if(route.startsWith('/api/admin')){
     const token=isAdmin(req);if(!token)return send(res,401,{error:'Sign in required'});
     if(route==='/api/admin/logout'&&req.method==='POST'){sessions.delete(token);res.setHeader('Set-Cookie',`cv_admin=; HttpOnly; SameSite=Strict; Path=${prefix||'/'}; Max-Age=0${secure?'; Secure':''}`);return send(res,200,{ok:true});}
     if(route==='/api/admin/stats'&&req.method==='GET')return send(res,200,{...totals(),timezone:'Europe/Kyiv',days:db.prepare('SELECT day,COUNT(*) views FROM views GROUP BY day ORDER BY day DESC LIMIT 30').all().reverse(),sources:db.prepare('SELECT source,COUNT(*) views FROM views GROUP BY source ORDER BY views DESC LIMIT 25').all(),campaigns:db.prepare("SELECT campaign,COUNT(*) views FROM views WHERE campaign!='' GROUP BY campaign ORDER BY views DESC LIMIT 25").all(),events:db.prepare('SELECT name,COUNT(*) count FROM events GROUP BY name ORDER BY count DESC').all(),todayEvents:db.prepare('SELECT name,COUNT(*) count FROM events WHERE day=? GROUP BY name').all(day())});
     if(route==='/api/admin/profile'&&req.method==='POST'){
      const b=await body(req);if(!['en','de'].includes(b.lang))return send(res,400,{error:'Invalid language'});
      const value={};for(const [k,max]of [['intro',1500],['availability',100]]){if(typeof b[k]!=='string'||b[k].length>max)return send(res,400,{error:`Invalid ${k}`});value[k]=b[k].trim();}
      db.prepare('INSERT INTO profile VALUES(?,?) ON CONFLICT(lang) DO UPDATE SET value=excluded.value').run(b.lang,JSON.stringify(value));return send(res,200,{ok:true});
     }
     return send(res,404,{error:'Not found'});
    }
    if(['/api/visit','/api/heartbeat','/api/event'].includes(route)&&req.method==='POST'){
     if(/bot|crawler|spider|headless/i.test(req.headers['user-agent']||''))return send(res,202,{ignored:true});
     if(!limit('traffic:'+ip(req),6000,60000))return send(res,429,{error:'Rate limit'});
     const b=await body(req);if(b.visitor!==undefined&&!validSid(b.visitor))return send(res,400,{error:'Invalid visitor'});if(!validSid(b.session))return send(res,400,{error:'Invalid session'});
     if(route==='/api/visit'){
      if(!limit('visit:'+b.session,20,60000))return send(res,429,{error:'Rate limit'});
      let source='direct';try{if(b.referrer){const ref=new URL(b.referrer);if(['http:','https:'].includes(ref.protocol))source=ref.hostname.slice(0,100);}}catch{}
      const params=b.utm&&typeof b.utm==='object'?b.utm:{};
      const clean=v=>typeof v==='string'?v.replace(/[^\p{L}\p{N} ._/-]/gu,'').slice(0,80):'';
      if(clean(params.source))source=clean(params.source);const campaign=clean(params.campaign);
      db.exec('BEGIN');try{db.prepare('INSERT OR IGNORE INTO visitors VALUES(?,?)').run(createHash('sha256').update(b.visitor||b.session).digest('hex'),Date.now());db.prepare('INSERT INTO views(session,ts,day,page,source,campaign) VALUES(?,?,?,?,?,?)').run(b.session,Date.now(),day(),b.page==='de'?'de':'en',source,campaign);db.prepare("UPDATE counters SET value=value+1 WHERE key='total'").run();db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
      if(b.visible!==false)active.set(b.session,Date.now());
     }else if(route==='/api/heartbeat'){
      if(b.visible===false)active.delete(b.session);else if(db.prepare('SELECT 1 FROM views WHERE session=? LIMIT 1').get(b.session))active.set(b.session,Date.now());
     }else{
      if(!['pdf','contact','github'].includes(b.name))return send(res,400,{error:'Invalid event'});
      if(!db.prepare('SELECT 1 FROM views WHERE session=? LIMIT 1').get(b.session))return send(res,400,{error:'Unknown session'});
      if(!limit('event:'+b.session+':'+b.name,10,60000))return send(res,429,{error:'Rate limit'});
      db.prepare('INSERT INTO events(session,ts,day,name) VALUES(?,?,?,?)').run(b.session,Date.now(),day(),b.name);
     }
     return send(res,200,totals());
    }
    return send(res,404,{error:'Not found'});
   }
   if(!['GET','HEAD'].includes(req.method))return send(res,405,{error:'Method not allowed'});
   let name=decodeURIComponent(route).replace(/^\/+|\/+$/g,'')||'index.html';if(name==='admin')name='admin.html';
   const publicFile=/^(index\.html|de\.html|privacy\.html|admin\.html|styles\.css|tech-map\.js|cv-navigation\.js|cv-enhancements\.css|matrix-world\.css|matrix-world\.js|music-invite\.js|analytics\.css|admin\.css|theme\.js|app\.js|admin\.js|profile-defaults\.json|Eugen_Punchenko_CV(?:_DE)?\.pdf|Jenya_Punchenko_CV\.pdf|robots\.txt|assets\/[a-zA-Z0-9_.-]+)$/.test(name);
   if(!publicFile)return send(res,404,{error:'Not found'});
   const file=path.join(root,name);let stat;try{stat=statSync(file);}catch{return send(res,404,{error:'Not found'});}
   const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.mp3':'audio/mpeg','.pdf':'application/pdf','.txt':'text/plain','.json':'application/json'};
   if(name==='admin.html')res.setHeader('X-Robots-Tag','noindex, nofollow');
   if(name.endsWith('.mp3'))res.setHeader('Accept-Ranges','bytes');
   if(name.endsWith('.mp3')&&req.headers.range){const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);let start=0,end=stat.size-1;if(match&&(match[1]||match[2])){if(!match[1])start=Math.max(0,stat.size-Number(match[2]));else{start=Number(match[1]);if(match[2])end=Math.min(end,Number(match[2]));}}else start=stat.size;if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=stat.size||end<start){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});res.end();return;}res.writeHead(206,{'Content-Type':'audio/mpeg','Content-Range':`bytes ${start}-${end}/${stat.size}`,'Content-Length':end-start+1});if(req.method==='HEAD')res.end();else createReadStream(file,{start,end}).pipe(res);return;}
   res.writeHead(200,{'Content-Type':types[path.extname(name)]||'application/octet-stream','Content-Length':stat.size,'Cache-Control':name.endsWith('.html')?'no-cache':'public, max-age=3600'});
   if(req.method==='HEAD')res.end();else createReadStream(file).pipe(res);
  }catch(e){if(!res.headersSent)send(res,400,{error:'Invalid request'});else res.end();}
 });
 server.on('close',()=>{clearInterval(timer);db.close();});return server;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const server=createApp();server.listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('Portfolio server ready'));}
