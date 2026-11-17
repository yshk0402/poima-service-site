export class ContactError extends Error { constructor(code) { super(code); this.code=code; } }
export function normalizeContact(input) {
  const email=String(input.email||'').trim().toLowerCase(), category=String(input.category||''), body=String(input.body||'').trim();
  if(email.length>254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || !['account','prediction','exchange','offer','other'].includes(category) || body.length<1 || body.length>3000 || input.accepted!==true || input.website) throw new ContactError('invalid_request');
  return {email,category,body,accepted:true};
}
export async function submitContact(config,input,storage=globalThis.sessionStorage,fetcher=globalThis.fetch) {
  if(!config.enabled)throw new ContactError('unavailable');
  const fields=normalizeContact(input), fingerprint=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify([fields,config.privacyVersion]))))).map(n=>n.toString(16).padStart(2,'0')).join('');
  const key='poima-public-support:'+config.endpoint;
  let saved;
  try { saved=JSON.parse(storage.getItem(key)||'null'); } catch {throw new ContactError('storage_unavailable');}
  const requestID=saved?.fingerprint===fingerprint&&/^[0-9a-f-]{36}$/.test(saved.requestID)?saved.requestID:crypto.randomUUID();
  try { storage.setItem(key,JSON.stringify({requestID,fingerprint})); } catch {throw new ContactError('storage_unavailable');}
  let response;
  try { response=await fetcher(config.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...fields,requestID,privacyVersion:config.privacyVersion,challenge:input.challenge||'',website:''}),credentials:'omit',redirect:'error',signal:AbortSignal.timeout(15000)}); } catch {throw new ContactError('connection');}
  let data;try{data=await response.json();}catch{throw new ContactError('connection');}
  if(!response.ok)throw new ContactError(['invalid_request','too_many_requests','notice_changed','challenge_required'].includes(data?.error?.code)?data.error.code:'connection');
  if(data.accepted!==true||data.requestID!==requestID||!/^[A-F0-9]{12}$/.test(data.receipt||''))throw new ContactError('connection');
  // Keep only the receipt and payload hash in this tab so response-loss/reload retries reuse the ID.
  return data;
}
