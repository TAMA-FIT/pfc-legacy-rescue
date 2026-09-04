(async()=>{
'use strict';
if(window.__PFC_LEGACY_RESCUE_RUNNING__)return;window.__PFC_LEGACY_RESCUE_RUNNING__=true;
const EXPECTED='https://tamafit.github.io',DB='TamaFitPhotoDB',STORE='BodyPhotos';
const F={dat:'tf_dat',tg:'tf_tg',fav:'tf_fav',favSettings:'tf_fav_settings',my:'tf_my',hist:'tf_hist',date:'tf_date',body:'tf_body'};
function readPhotos(){return new Promise(resolve=>{if(!('indexedDB'in window)){resolve({photos:[],status:'unsupported'});return}let req,upgrade=false;try{req=indexedDB.open(DB)}catch(_){resolve({photos:[],status:'open-failed'});return}req.onupgradeneeded=e=>{upgrade=true;try{e.target.transaction.abort()}catch(_){}};req.onerror=()=>resolve({photos:[],status:upgrade?'not-found':'open-failed'});req.onsuccess=e=>{const db=e.target.result;if(!db.objectStoreNames.contains(STORE)){db.close();resolve({photos:[],status:'store-not-found'});return}const r=db.transaction(STORE,'readonly').objectStore(STORE).getAll();r.onsuccess=()=>{const p=Array.isArray(r.result)?r.result:[];db.close();resolve({photos:p,status:'ok'})};r.onerror=()=>{db.close();resolve({photos:[],status:'read-failed'})}}})}
function name(){const d=new Date(),p=n=>String(n).padStart(2,'0');return`PFC_rescue_full_${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}.json`}
async function saveFile(file){try{if(navigator.canShare?.({files:[file]})&&navigator.share){await navigator.share({files:[file],title:'PFC旧データ救出'});return'shared'}}catch(e){if(e?.name==='AbortError')return'cancelled'}const a=document.createElement('a');a.href=URL.createObjectURL(file);a.download=file.name;a.style.display='none';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1800);return'downloaded'}
try{
if(location.origin!==EXPECTED&&!confirm(`旧PFC (${EXPECTED}) 上で実行してください。\n現在: ${location.origin}\nこのまま読み取りを試しますか？`)){window.__PFC_LEGACY_RESCUE_RUNNING__=false;return}
document.getElementById('__pfc_rescue_overlay__')?.remove();
const d={};let core=0;for(const[k,v]of Object.entries(F)){d[k]=localStorage.getItem(v);if(d[k]!=null)core++}
const raw={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&(k.startsWith('tf_')||k.startsWith('pfc_')||k.startsWith('pfc-mirror:v1:')))raw[k]=localStorage.getItem(k)}
const pr=await readPhotos();
const found=core>0||Object.keys(raw).length>0||pr.photos.length>0;
d._pfcRescue={schemaVersion:2,format:'pfc-legacy-rescue-v2',detectionMode:'safari-shortcut-probe',dataFound:found,exportedAt:new Date().toISOString(),sourceOrigin:location.origin,sourceHref:location.href,coreFieldsFound:core,pfcStorageKeyCount:Object.keys(raw).length,rawPfcStorage:raw,bodyPhotoDatabase:DB,bodyPhotoStore:STORE,bodyPhotoStatus:pr.status,bodyPhotoCount:pr.photos.length,bodyPhotos:pr.photos,privacy:'local-only; no rescued data uploaded'};
const text=JSON.stringify(d),file=new File([text],name(),{type:'application/json'});
const ov=document.createElement('div');ov.id='__pfc_rescue_overlay__';ov.style.cssText='position:fixed;inset:0;z-index:2147483647;background:rgba(8,24,16,.82);display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui,-apple-system,sans-serif;color:#172820';
const c=document.createElement('div');c.style.cssText='width:min(520px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:20px;padding:20px;box-shadow:0 20px 60px rgba(0,0,0,.35)';
c.innerHTML=`<div style="font-size:12px;font-weight:900;color:${found?'#187a51':'#9b5d00'}">PFC SAFARI CHECK</div><h2 style="margin:5px 0 12px">${found?'Safari側に旧PFCデータが残っています':'Safari側にはPFCデータが見つかりません'}</h2><div style="display:grid;grid-template-columns:1fr auto;gap:8px 14px;padding:12px;background:${found?'#f1faf5':'#fff8e8'};border-radius:14px"><span>主要PFC項目</span><b>${core}/8</b><span>追加保存キー</span><b>${Object.keys(raw).length}</b><span>体型写真</span><b>${pr.photos.length}枚</b><span>JSONサイズ</span><b>${(text.length/1048576).toFixed(2)}MB</b></div><p style="font-size:13px;line-height:1.6;color:#5f7168">${found?'Safariショートカットだった可能性が高いです。下のボタンから救出ファイルを保存してください。':'このSafari保存領域には旧PFCの記録を確認できませんでした。データは変更していません。'}</p>`;
const b=document.createElement('button');b.textContent='JSONを保存・共有';b.style.cssText='width:100%;border:0;border-radius:13px;padding:14px;background:#187a51;color:#fff;font-weight:900;font-size:16px';
const x=document.createElement('button');x.textContent='閉じる';x.style.cssText='width:100%;border:0;border-radius:13px;padding:12px;margin-top:9px;background:#eef1ef;color:#405048;font-weight:800';
const s=document.createElement('div');s.style.cssText='font-size:12px;color:#5f7168;margin-top:10px;min-height:18px';
b.onclick=async()=>{s.textContent='保存画面を開いています…';const r=await saveFile(file);s.textContent=r==='shared'?'共有/保存を完了しました。':r==='downloaded'?'ファイル保存を開始しました。':r==='cancelled'?'キャンセルしました。':'完了しました。'};
x.onclick=()=>{ov.remove();window.__PFC_LEGACY_RESCUE_RUNNING__=false};
if(found)c.append(b);c.append(x,s);ov.append(c);document.documentElement.append(ov);
if(!found)s.textContent='この結果なら、ホーム画面の旧PFCが独立Webアプリだった可能性もあります。画面をスクリーンショットしてください。';
}catch(e){alert('PFC救出エラー: '+(e?.message||e));window.__PFC_LEGACY_RESCUE_RUNNING__=false}
})();