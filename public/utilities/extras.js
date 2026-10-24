(()=>{'use strict';
const app=document.querySelector('[data-app]')?.dataset.app,$=id=>document.getElementById(id);
const status=(id,s)=>{if($(id))$(id).textContent=s};
const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
const dl=(name,text,mime='application/json')=>{const u=URL.createObjectURL(new Blob([text],{type:mime})),a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000)};
if(app==='currency'){
 const key='operava-fx-favorites-v1',list=$('fx-favorites'),fee=$('fx-fee');
 const fav=()=>read(key,[]).filter(x=>typeof x==='string'&&/^[A-Z]{3}\/[A-Z]{3}$/.test(x)).slice(0,12);
 function choices(){list.replaceChildren();const n=document.createElement('option');n.value='';n.textContent='Select saved pair';list.append(n);for(const c of fav()){const o=document.createElement('option');o.value=c;o.textContent=c.replace('/',' → ');list.append(o)}}
 function estimate(){const from=$('fx-from').value,to=$('fx-to').value,data=read('operava-fx-cache-v2-'+from,null),rate=from===to?1:Number(data?.rates?.[to]),amount=Number($('fx-amount').value),pct=Number(fee.value);
  if(!Number.isFinite(rate)||rate<=0||!Number.isFinite(amount)||amount<0){status('fx-inverse','Inverse quote appears after rates load.');status('fx-effective','Calculate a rate to see an estimated deduction.');return}
  status('fx-inverse','Inverse reference: 1 '+to+' = '+(1/rate).toPrecision(9)+' '+from);
  const deduction=Math.min(100,Math.max(0,Number.isFinite(pct)?pct:0));const result=amount*rate*(1-deduction/100);status('fx-effective','Illustrative net after '+pct+'% deduction: '+result.toLocaleString(undefined,{maximumFractionDigits:4})+' '+to+'. Not an actual transfer quote.');
 }
 $('fx-favorite').onclick=()=>{const p=$('fx-from').value+'/'+$('fx-to').value;save(key,[p,...fav().filter(v=>v!==p)].slice(0,12));choices();status('fx-favorite-status','Pair saved on this device.')};
 list.onchange=()=>{if(!list.value)return;const p=list.value.split('/');$('fx-from').value=p[0];$('fx-to').value=p[1];$('fx-convert').click()};
 fee.oninput=estimate;
 for(const id of ['fx-from','fx-to','fx-amount'])$(id).addEventListener('change',estimate);
 if(typeof MutationObserver!=='undefined')new MutationObserver(estimate).observe($('fx-result'),{childList:true,characterData:true,subtree:true});
 choices();estimate();
}
if(app==='calendar'){
 const key='operava-calendar-v1',results=$('cal-search-results'),input=$('cal-search');
 const get=()=>{const a=read(key,{});return a&&typeof a==='object'&&!Array.isArray(a)?a:{}};
 const dateOK=s=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const [y,m,d]=s.split('-').map(Number),x=new Date(y,m-1,d);return x.getFullYear()===y&&x.getMonth()===m-1&&x.getDate()===d};
 function show(){const q=input.value.trim().toLowerCase();results.replaceChildren();let count=0;for(const [date,note] of Object.entries(get()).sort((a,b)=>a[0].localeCompare(b[0]))){if(!dateOK(date)||typeof note!=='string'||!(date+' '+note).toLowerCase().includes(q))continue;count++;if(count>50)continue;const b=document.createElement('button');b.type='button';b.className='op-note-result';b.textContent=date+' · '+note.slice(0,120);b.onclick=()=>{$('cal-date').value=date;$('cal-date').dispatchEvent(new Event('change',{bubbles:true}))};results.append(b)}status('cal-search-count',count+' matching saved note(s)'+(count>50?'; first 50 shown':''))}
 input.oninput=show;
 $('cal-backup').onclick=()=>dl('operava-calendar-backup.json',JSON.stringify({format:'OPERAVA-calendar-v1',exportedAt:new Date().toISOString(),notes:get()},null,2));
 $('cal-restore').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>256000)throw Error('Backup exceeds 250 KB');const obj=JSON.parse(await file.text());if(obj?.format!=='OPERAVA-calendar-v1'||!obj.notes||Array.isArray(obj.notes)||typeof obj.notes!=='object')throw Error('Invalid backup format');const entries=Object.entries(obj.notes);if(entries.length>2000||entries.some(([k,v])=>!dateOK(k)||typeof v!=='string'||v.length>160))throw Error('Invalid dates or notes');if(!save(key,{...get(),...Object.fromEntries(entries)}))throw Error('Browser storage unavailable');$('cal-today').click();show();status('cal-status','Restored '+entries.length+' notes. Matching dates overwritten.')}catch(err){status('cal-status','Backup import failed: '+err.message)}finally{e.target.value=''}};
 $('cal-save').addEventListener('click',()=>setTimeout(show,0));$('cal-remove')?.addEventListener('click',()=>setTimeout(show,0));show();
}
if(app==='calculator'){
 let m=0;function show(){status('calc-memory-value','Memory: '+Number(m.toPrecision(12)))}
 const result=()=>{const s=$('calc-output').textContent;const n=Number(s.startsWith('= ')?s.slice(2):NaN);return Number.isFinite(n)?n:null};
 $('calc-m-plus').onclick=()=>{const n=result();if(n===null)return status('calc-status','Calculate a result first.');m+=n;if(!Number.isFinite(m))m=0;show()};
 $('calc-m-minus').onclick=()=>{const n=result();if(n===null)return status('calc-status','Calculate a result first.');m-=n;if(!Number.isFinite(m))m=0;show()};
 $('calc-m-recall').onclick=()=>{$('calc-input').value+=String(Number(m.toPrecision(12)));$('calc-input').focus()};
 $('calc-m-clear').onclick=()=>{m=0;show()};
 $('calc-history-clear').onclick=()=>{$('calc-history').replaceChildren();status('calc-status','History cleared.')};show();
}
if(app==='pdf'){
 let original=null;const file=$('pdf-file'),btn=$('pdf-save-original');
 const sync=()=>{original=file.files?.[0]||null;btn.disabled=!original;status('pdf-file-meta',original?original.name+' · '+(original.size/1048576).toFixed(2)+' MB':'No PDF selected.')};
 file.addEventListener('change',sync);$('pdf-clear').addEventListener('click',()=>{original=null;btn.disabled=true;status('pdf-file-meta','No PDF selected.')});
 btn.onclick=()=>{if(!original)return;const u=URL.createObjectURL(original),a=document.createElement('a');a.href=u;a.download=original.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000)};
 function render(){const val=$('pdf-text').value,p=$('pdf-text-preview');status('pdf-word-count',(val.trim()?val.trim().split(/\s+/).length:0)+' words · '+val.length+' characters');p.replaceChildren();if(!val.trim()){p.textContent='Enter text to preview it before printing.';return}const h=document.createElement('h2');h.textContent=$('pdf-title').value.trim()||'Document';const pre=document.createElement('pre');pre.textContent=val;p.append(h,pre)}
 $('pdf-text').addEventListener('input',render);$('pdf-title').addEventListener('input',render);render();sync();
}
if(app==='word-to-pdf'){
 const view=$('word-preview'),file=$('word-file'),drop=$('word-drop');
 function words(){const s=view.textContent.trim();status('word-word-count',(s?s.split(/\s+/).length:0)+' words in preview')}
 view.addEventListener('input',words);if(typeof MutationObserver!=='undefined')new MutationObserver(words).observe(view,{childList:true,characterData:true,subtree:true});words();
 const stop=e=>{e.preventDefault();e.stopPropagation()};
 for(const evt of ['dragenter','dragover'])drop.addEventListener(evt,e=>{stop(e);drop.classList.add('is-over')});
 for(const evt of ['dragleave','drop'])drop.addEventListener(evt,e=>{stop(e);drop.classList.remove('is-over')});
 drop.addEventListener('drop',e=>{const f=e.dataTransfer?.files?.[0];if(!f)return;if(!/\.docx$/i.test(f.name))return status('word-status','Only .docx files are supported.');try{const dt=new DataTransfer();dt.items.add(f);file.files=dt.files;file.dispatchEvent(new Event('change',{bubbles:true}))}catch{status('word-status','Drag/drop unsupported; use the file selector.')}});
}
if(app==='html'){
 const src=$('html-code'),find=$('html-find'),replacement=$('html-replace');
 function stats(){status('html-stats',src.value.split('\n').length+' lines · '+src.value.length+' characters · '+new Blob([src.value]).size+' bytes')}
 src.addEventListener('input',stats);stats();
 $('html-find-next').onclick=()=>{const q=find.value;if(!q)return;let i=src.value.indexOf(q,src.selectionEnd);if(i<0)i=src.value.indexOf(q);if(i<0)return status('html-status','Text not found.');src.focus();src.setSelectionRange(i,i+q.length);status('html-status','Found at character '+(i+1))};
 $('html-replace-one').onclick=()=>{const q=find.value,start=src.selectionStart,end=src.selectionEnd;if(!q)return;if(src.value.slice(start,end)!==q)return $('html-find-next').click();src.setRangeText(replacement.value,start,end,'end');src.dispatchEvent(new Event('input',{bubbles:true}));status('html-status','Replaced one selected occurrence.')};
 $('html-wrap').onclick=()=>{const a=src.selectionStart,b=src.selectionEnd;if(a===b)return status('html-status','Select source text before applying bold.');src.setRangeText('<strong>'+src.value.slice(a,b)+'</strong>',a,b,'select');src.dispatchEvent(new Event('input',{bubbles:true}))};
}
if(app==='references'){
 const key='operava-reference-bookmarks-v1',cards=[...document.querySelectorAll('.ref-card')],only=$('ref-bookmarks');
 const fav=()=>{const a=read(key,[]);return Array.isArray(a)?a.filter(x=>typeof x==='string').slice(0,100):[]};
 function apply(){const selection=new Set(fav());for(const card of cards){const link=card.querySelector('a[href]'),btn=card.querySelector('.op-bookmark');if(!link||!btn)continue;const saved=selection.has(link.href);btn.textContent=saved?'★ Saved':'☆ Save';btn.setAttribute('aria-pressed',String(saved));if(only.checked&&!saved)card.hidden=true}status('ref-bookmark-status',selection.size+' saved references in this browser.')}
 for(const card of cards){const link=card.querySelector('a[href]');if(!link)continue;const btn=document.createElement('button');btn.type='button';btn.className='op-bookmark';btn.setAttribute('aria-label','Save reference');btn.onclick=()=>{const set=new Set(fav());if(set.has(link.href))set.delete(link.href);else set.add(link.href);save(key,[...set]);$('ref-search').dispatchEvent(new Event('input'));apply()};card.append(btn)}
 only.onchange=()=>{$('ref-search').dispatchEvent(new Event('input'));apply()};
 $('ref-export').onclick=()=>dl('operava-research-bookmarks.json',JSON.stringify({format:'OPERAVA-references-v1',urls:fav()},null,2));
 $('ref-clear-bookmarks').onclick=()=>{if(confirm('Clear saved references from this browser?')){save(key,[]);only.checked=false;$('ref-search').dispatchEvent(new Event('input'));apply()}};
 $('ref-search').addEventListener('input',()=>{if(only.checked)apply()});$('ref-category').addEventListener('change',()=>{if(only.checked)apply()});apply();
}
})();