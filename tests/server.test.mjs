import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {scryptSync,randomUUID} from 'node:crypto';
import {createApp} from '../server.mjs';

test('analytics, origin validation, private admin, editing and durable counters',async()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'portfolio-test-'));const password='test-password-at-least-16';const salt='test-salt';const hash=salt+':'+scryptSync(password,salt,64).toString('hex');
 let server=createApp({dataDir:dir,passwordHash:hash,secure:false,prefix:''});await new Promise(r=>server.listen(0,'127.0.0.1',r));let base='http://127.0.0.1:'+server.address().port;
 const request=async(route,data,cookie,origin='https://inkora.at')=>fetch(base+route,{method:data?'POST':'GET',headers:{...(data?{'Content-Type':'application/json',Origin:origin}:{}),...(cookie?{Cookie:cookie}:{})},body:data?JSON.stringify(data):undefined});
 try{
  const range=await fetch(base+'/assets/pentaloop.mp3',{headers:{Range:'bytes=0-31'}});assert.equal(range.status,206);assert.equal((await range.arrayBuffer()).byteLength,32);assert.match(range.headers.get('content-range'),/^bytes 0-31\//);
  assert.equal((await fetch(base+'/assets/pentaloop.mp3',{headers:{Range:'bytes=999999999999-'}})).status,416);
  assert.equal((await request('/api/admin/stats')).status,401);
  assert.equal((await request('/.env')).status,404);
  assert.equal((await request('/server.mjs')).status,404);
  assert.equal((await request('/api/visit',{session:randomUUID()},null,'https://evil.invalid')).status,403);
  assert.equal((await request('/api/visit',{session:'bad'})).status,400);
  const sid=randomUUID();let r=await request('/api/visit',{session:sid,page:'en',referrer:'https://example.com/private?secret=abc',utm:{source:'newsletter',campaign:'launch'}});assert.equal(r.status,200);assert.deepEqual(await r.json(),{online:1,today:1,total:1,unique:1});
  r=await request('/api/heartbeat',{session:sid,visible:false});assert.equal((await r.json()).online,0);
  r=await request('/api/heartbeat',{session:sid,visible:true});assert.equal((await r.json()).online,1);
  r=await request('/api/event',{session:sid,name:'pdf'});assert.equal(r.status,200);
  assert.equal((await request('/api/event',{session:randomUUID(),name:'pdf'})).status,400);
  r=await request('/api/login',{username:'admin',password:'wrong'});assert.equal(r.status,401);
  r=await request('/api/login',{username:'admin',password});assert.equal(r.status,200);const cookie=r.headers.get('set-cookie').split(';')[0];assert.match(r.headers.get('set-cookie'),/HttpOnly/);assert.match(r.headers.get('set-cookie'),/SameSite=Strict/);
  r=await request('/api/admin/stats',null,cookie);const stats=await r.json();assert.equal(stats.total,1);assert.equal(stats.sources[0].source,'newsletter');assert.equal(stats.campaigns[0].campaign,'launch');assert.deepEqual(stats.events,[{name:'pdf',count:1}]);assert.equal(stats.days[0].views,1);
  r=await request('/api/admin/profile',{lang:'en',intro:'Updated introduction',availability:'Open to work'},cookie);assert.equal(r.status,200);assert.equal((await (await request('/api/profile')).json()).en.intro,'Updated introduction');
  assert.equal((await request('/api/admin/profile',{lang:'en',intro:'x'.repeat(1501),availability:'test'},cookie)).status,400);
  r=await request('/api/admin/logout',{},cookie);assert.equal(r.status,200);assert.equal((await request('/api/admin/stats',null,cookie)).status,401);
  const duplicate=await request('/api/visit',{session:randomUUID(),visitor:sid});const duplicateStats=await duplicate.json();assert.equal(duplicateStats.unique,1);assert.equal(duplicateStats.total,2);
  await new Promise(r=>server.close(r));server=createApp({dataDir:dir,passwordHash:hash,secure:false,prefix:''});await new Promise(r=>server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+server.address().port;
  assert.equal((await (await request('/api/stats')).json()).total,2);assert.equal((await (await request('/api/profile')).json()).en.availability,'Open to work');
  assert.equal((await request('/api/admin/stats',null,cookie)).status,401);
 }finally{await new Promise(r=>server.close(r));rmSync(dir,{recursive:true,force:true});}
});
