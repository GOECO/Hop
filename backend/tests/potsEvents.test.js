import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createServer } from 'node:http';
import { createHmac } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createPotsEventsRouter } from '../routes/potsEvents.js';

const SECRET='local-integration-secret-32-characters-abcdef';
const ADMIN='local-admin-secret-32-characters-abcdefgh';
const now=1792344000;

function payload(type='pos.order.submitted',id=1){
  const states={
    'pos.order.submitted':['submitted','pending'],
    'pos.order.accepted':['accepted','pending'],
    'pos.order.cancelled':['cancelled','pending'],
    'pos.order.cash_recorded':['accepted','cash_recorded'],
    'pos.counter.created':['counter','cash_recorded']
  };
  const [fulfillment_state,payment_status]=states[type];
  return {event_id:'pots:'+type+':'+id,event_type:type,
    payload:{order_ref:'pots:'+id,table:type==='pos.counter.created'?null:'Bàn 01',
      fulfillment_state,payment_status,total_vnd:50000,
      items:[{sku:'CAFE',quantity:2,unit_price_vnd:25000}]}};
}

async function session(fn,{config=true}={}){
  const folder=mkdtempSync(join(tmpdir(),'goeco-pots-'));
  const router=createPotsEventsRouter({
    dbPath:join(folder,'events.sqlite3'),
    sharedSecret:config?SECRET:'',adminSecret:config?ADMIN:'',clock:()=>now
  });
  const app=express();
  app.use('/api/integrations/pots',express.raw({type:'application/json',limit:'16kb'}),router);
  const server=createServer(app);
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url='http://127.0.0.1:'+server.address().port+'/api/integrations/pots';
  try{await fn(url)}finally{
    await new Promise(resolve=>server.close(resolve));router.closeDb();
    rmSync(folder,{recursive:true,force:true});
  }
}
async function post(url,data,{badSig=false,ts=now,headerId}={}){
  const raw=JSON.stringify(data);
  const sig=createHmac('sha256',SECRET).update(String(ts)+'.'+raw).digest('hex');
  const resp=await fetch(url+'/events',{method:'POST',
    headers:{'Content-Type':'application/json','X-POTS-Timestamp':String(ts),
      'X-POTS-Signature':badSig?'0'.repeat(64):sig,
      'X-POTS-Event-ID':headerId||data.event_id},body:raw});
  return {status:resp.status,body:await resp.json()};
}
async function orders(url,token=ADMIN){
 const resp=await fetch(url+'/orders',{headers:{'X-GOECO-POTS-Admin':token}});
 return {status:resp.status,body:await resp.json()};
}

test('fail closed when secrets absent',async()=>{
 await session(async url=>{
   assert.equal((await post(url,payload())).status,503);
   assert.equal((await orders(url)).status,503);
 },{config:false});
});
test('valid signed event is durable, exact replay dedup, private list',async()=>{
 await session(async url=>{
   const one=await post(url,payload());
   assert.equal(one.status,200);assert.equal(one.body.applied,true);
   const repeat=await post(url,payload());
   assert.equal(repeat.status,200);assert.equal(repeat.body.duplicate,true);
   assert.equal((await orders(url,'wrong')).status,401);
   const result=await orders(url);
   assert.equal(result.status,200);
   assert.equal(result.body.orders.length,1);
   assert.equal(result.body.orders[0].payment_status,'pending');
 });
});
test('tampering, stale signatures and mismatch are rejected',async()=>{
 await session(async url=>{
   assert.equal((await post(url,payload(),{badSig:true})).status,401);
   assert.equal((await post(url,payload(),{ts:now-61})).status,401);
   assert.equal((await post(url,payload(),{headerId:'pots:pos.order.accepted:1'})).status,401);
   const changed=payload();changed.payload.total_vnd=1;
   assert.equal((await post(url,changed)).status,422);
   changed.payload.total_vnd=50000;changed.payload.customer_name='PII forbidden';
   assert.equal((await post(url,changed)).status,422);
 });
});
test('accepted, cash and duplicate events; out-of-order submitted cannot regress',async()=>{
 await session(async url=>{
   assert.equal((await post(url,payload('pos.order.accepted'))).status,200);
   assert.equal((await post(url,payload('pos.order.cash_recorded'))).status,200);
   const later=await post(url,payload('pos.order.submitted'));
   assert.equal(later.status,200);assert.equal(later.body.applied,false);
   const snapshot=await orders(url);
   assert.equal(snapshot.body.orders[0].fulfillment_state,'accepted');
   assert.equal(snapshot.body.orders[0].payment_status,'cash_recorded');
   assert.equal((await post(url,payload('pos.order.cancelled'))).status,409);
 });
});
test('cancelled wins over old accepted events; no payment for cancelled order',async()=>{
 await session(async url=>{
   assert.equal((await post(url,payload('pos.order.submitted',3))).status,200);
   assert.equal((await post(url,payload('pos.order.cancelled',3))).status,200);
   const old=await post(url,payload('pos.order.accepted',3));
   assert.equal(old.status,200);assert.equal(old.body.applied,false);
   assert.equal((await post(url,payload('pos.order.cash_recorded',3))).status,409);
   assert.equal((await orders(url)).body.orders[0].fulfillment_state,'cancelled');
 });
});
test('counter sales are recorded as cashier-confirmed cash, not bank verification',async()=>{
 await session(async url=>{
   assert.equal((await post(url,payload('pos.counter.created',8))).status,200);
   const snapshot=await orders(url);
   assert.equal(snapshot.body.orders[0].fulfillment_state,'counter');
   assert.equal(snapshot.body.orders[0].payment_status,'cash_recorded');
 });
});
