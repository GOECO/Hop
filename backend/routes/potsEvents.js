/** Authenticated and durable POTS -> GOECO restaurant event receiver (Node 24+).
 * Fail closed without configured secrets. SQLite is a single-store MVP inbox.
 */
import { Router } from 'express';
import { createHmac, createHash, timingSafeEqual } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const EVENT_TYPES = new Set([
  'pos.counter.created', 'pos.order.submitted', 'pos.order.accepted',
  'pos.order.cancelled', 'pos.order.cash_recorded'
]);
const PRECEDENCE = {
  'pos.counter.created': 3, 'pos.order.submitted': 1,
  'pos.order.accepted': 2, 'pos.order.cash_recorded': 3,
  'pos.order.cancelled': 4
};
const ORDER_REF = /^pots:[1-9]\d{0,14}$/;
const EVENT_ID = /^pots:pos\.(?:counter\.created|order\.(?:submitted|accepted|cancelled|cash_recorded)):[1-9]\d{0,14}$/;
function failure(status, detail) { const e = new Error(detail); e.status = status; return e; }

export function validateEvent(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw failure(422, 'Invalid event');
  const { event_id: id, event_type: type, payload: p } = body;
  if (typeof id !== 'string' || !EVENT_ID.test(id) || typeof type !== 'string' ||
      !EVENT_TYPES.has(type) || !p || typeof p !== 'object' || Array.isArray(p) ||
      typeof p.order_ref !== 'string' || !ORDER_REF.test(p.order_ref) ||
      id !== 'pots:' + type + ':' + p.order_ref.split(':')[1])
    throw failure(422, 'Invalid event type, id or order mapping');
  if (!Number.isSafeInteger(p.total_vnd) || p.total_vnd < 0 ||
      !['pending', 'cash_recorded'].includes(p.payment_status) ||
      !['counter','submitted','accepted','cancelled'].includes(p.fulfillment_state) ||
      !(p.table === null || typeof p.table === 'string' && p.table.length <= 60) ||
      !Array.isArray(p.items) || p.items.length === 0 || p.items.length > 100)
    throw failure(422, 'Invalid POS payload');
  const topKeys = new Set(['order_ref','total_vnd','payment_status','fulfillment_state','table','items']);
  if (Object.keys(p).some(k => !topKeys.has(k))) throw failure(422,'Unexpected personal data');
  let total = 0;
  for (const x of p.items) {
    if (!x || typeof x !== 'object' || Array.isArray(x) ||
        Object.keys(x).some(k => !['sku','quantity','unit_price_vnd'].includes(k)) ||
        typeof x.sku !== 'string' || !/^[A-Za-z0-9._-]{1,64}$/.test(x.sku) ||
        !Number.isSafeInteger(x.quantity) || x.quantity <= 0 || x.quantity > 10000 ||
        !Number.isSafeInteger(x.unit_price_vnd) || x.unit_price_vnd < 0)
      throw failure(422, 'Invalid line item');
    total += x.quantity * x.unit_price_vnd;
    if (!Number.isSafeInteger(total)) throw failure(422,'Total overflow');
  }
  if (total !== p.total_vnd) throw failure(422,'Order total mismatch');
  const allowed = {
    'pos.counter.created': ['counter','cash_recorded'],
    'pos.order.submitted': ['submitted','pending'],
    'pos.order.accepted': ['accepted','pending'],
    'pos.order.cancelled': ['cancelled','pending'],
    'pos.order.cash_recorded': ['accepted','cash_recorded']
  };
  const [state, payment] = allowed[type];
  const validPayment = type === 'pos.counter.created'
    ? ['pending','cash_recorded'].includes(p.payment_status)
    : p.payment_status === payment;
  if (p.fulfillment_state !== state || !validPayment)
    throw failure(422,'Invalid event state');
  return { id, type, payload: p };
}

function openDb(file) {
  if (file !== ':memory:') mkdirSync(dirname(resolve(file)), {recursive:true});
  const db = new DatabaseSync(file, {timeout:10000});
  db.exec([
    'PRAGMA journal_mode=WAL;',
    'CREATE TABLE IF NOT EXISTS pots_inbox(',
    'event_id TEXT PRIMARY KEY,event_type TEXT NOT NULL,payload_hash TEXT NOT NULL,',
    'order_ref TEXT NOT NULL,raw_payload TEXT NOT NULL,',
    "received_at TEXT NOT NULL DEFAULT(datetime('now')));",
    'CREATE TABLE IF NOT EXISTS pots_orders(',
    'order_ref TEXT PRIMARY KEY,table_label TEXT,fulfillment_state TEXT NOT NULL,',
    'payment_status TEXT NOT NULL,total_vnd INTEGER NOT NULL,last_rank INTEGER NOT NULL,',
    "updated_at TEXT NOT NULL DEFAULT(datetime('now')));"
  ].join(' '));
  return db;
}

function store(db, e, hash) {
  const p = e.payload;
  db.exec('BEGIN IMMEDIATE');
  try {
    const old = db.prepare('SELECT payload_hash FROM pots_inbox WHERE event_id=?').get(e.id);
    if (old) {
      if (old.payload_hash !== hash) throw failure(409,'Conflicting event ID');
      db.exec('COMMIT');
      return {acknowledged:true,duplicate:true,applied:false,event_id:e.id};
    }
    const prior = db.prepare('SELECT * FROM pots_orders WHERE order_ref=?').get(p.order_ref);
    if (prior && prior.total_vnd !== p.total_vnd) throw failure(409,'Order total has changed');
    if (prior && prior.payment_status === 'cash_recorded' && e.type === 'pos.order.cancelled')
      throw failure(409,'Recorded payment requires manual refund workflow');
    if (prior && prior.fulfillment_state === 'cancelled' && e.type === 'pos.order.cash_recorded')
      throw failure(409,'Cannot record payment for a cancelled order');
    db.prepare('INSERT INTO pots_inbox(event_id,event_type,payload_hash,order_ref,raw_payload) VALUES(?,?,?,?,?)')
      .run(e.id,e.type,hash,p.order_ref,JSON.stringify(p));
    const rank = PRECEDENCE[e.type], applied = !prior || rank > prior.last_rank;
    if (applied) {
      db.prepare([
        'INSERT INTO pots_orders(order_ref,table_label,fulfillment_state,payment_status,total_vnd,last_rank)',
        'VALUES(?,?,?,?,?,?) ON CONFLICT(order_ref) DO UPDATE SET',
        'table_label=excluded.table_label,fulfillment_state=excluded.fulfillment_state,',
        'payment_status=excluded.payment_status,total_vnd=excluded.total_vnd,',
        "last_rank=excluded.last_rank,updated_at=datetime('now')"
      ].join(' ')).run(p.order_ref,p.table,p.fulfillment_state,p.payment_status,p.total_vnd,rank);
    }
    db.exec('COMMIT');
    return {acknowledged:true,duplicate:false,applied,event_id:e.id};
  } catch (err) { db.exec('ROLLBACK'); throw err; }
}

export function createPotsEventsRouter({ dbPath=process.env.GOECO_POTS_INBOX_DB || './data/pots-inbox.sqlite3',
  sharedSecret=process.env.GOECO_POTS_SYNC_SECRET || '',
  adminSecret=process.env.GOECO_POTS_ADMIN_SECRET || '',
  clock=()=>Math.floor(Date.now()/1000) }={}) {
  const router=Router();
  let db;
  const ready=sharedSecret.length>=32 && adminSecret.length>=32 && sharedSecret!==adminSecret;
  function database(){ if(!db) db=openDb(dbPath); return db; }
  router.post('/events',(req,res)=>{
    try {
      if(!ready)throw failure(503,'POTS integration disabled');
      const raw=req.body;
      if(!Buffer.isBuffer(raw) || raw.length===0 || raw.length>16384)
        throw failure(415,'Expected raw application/json body');
      const stamp=req.get('X-POTS-Timestamp'),sig=req.get('X-POTS-Signature'),
            eid=req.get('X-POTS-Event-ID');
      if(!stamp|| !/^\d{10,11}$/.test(stamp) || !sig || !/^[0-9a-f]{64}$/.test(sig) ||
         !eid || eid.length>128)throw failure(401,'Invalid POTS credentials');
      if(Math.abs(clock()-Number(stamp))>60)throw failure(401,'Expired POTS event');
      const expected=createHmac('sha256',sharedSecret).update(stamp+'.').update(raw).digest();
      if(!timingSafeEqual(expected,Buffer.from(sig,'hex')))throw failure(401,'Invalid POTS signature');
      let parsed;
      try { parsed=JSON.parse(raw.toString('utf8')); }catch{throw failure(422,'Malformed JSON');}
      const event=validateEvent(parsed);
      if(eid!==event.id)throw failure(401,'Signed event header mismatch');
      const hash=createHash('sha256').update(raw).digest('hex');
      res.json(store(database(),event,hash));
    } catch(err){ res.status(err.status||500).json({error:err.status?err.message:'Internal error'}); }
  });
  router.get('/orders',(req,res)=>{
    try{
      if(!ready)throw failure(503,'POTS integration disabled');
      const token=req.get('X-GOECO-POTS-Admin');
      if(!token || !timingSafeEqual(
        createHash('sha256').update(token).digest(),
        createHash('sha256').update(adminSecret).digest()))throw failure(401,'Unauthenticated');
      const orders=database().prepare('SELECT order_ref,table_label,fulfillment_state,payment_status,total_vnd,updated_at FROM pots_orders ORDER BY updated_at DESC,order_ref DESC LIMIT 100').all();
      res.json({orders});
    }catch(err){ res.status(err.status||500).json({error:err.status?err.message:'Internal error'}); }
  });
  router.closeDb=()=>{if(db){db.close();db=undefined;}};
  return router;
}
export default createPotsEventsRouter;
