(()=>{'use strict';
if(typeof document.querySelectorAll!=='function'||typeof window.addEventListener!=='function')return;
const $=id=>document.getElementById(id),app=document.querySelector('[data-app]')?.dataset.app;
const status=(id,message)=>{const e=$(id);if(e)e.textContent=message};
const loadScript=(src,integrity)=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=true;s.referrerPolicy='no-referrer';if(integrity){s.integrity=integrity;s.crossOrigin='anonymous'}s.onload=resolve;s.onerror=()=>reject(Error('The conversion library could not load. Check your connection or use the print option.'));document.head.append(s)});
const exportFile=(name,text,type)=>{const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)};
const docCss='@page{size:A4;margin:18mm}body{font:11pt/1.55 Georgia,"Times New Roman",serif;color:#111}h1,h2,h3{line-height:1.2}table{width:100%;border-collapse:collapse}td,th{border:1px solid #999;padding:6px}img{max-width:100%;height:auto}pre,blockquote{white-space:pre-wrap}p,li{overflow-wrap:anywhere}';
function sanitizedHTML(raw){
 const parsed=new DOMParser().parseFromString('<div>'+raw+'</div>','text/html');
 const good=new Set(['P','DIV','SPAN','H1','H2','H3','H4','H5','H6','STRONG','B','EM','I','U','S','DEL','SUB','SUP','UL','OL','LI','TABLE','THEAD','TBODY','TFOOT','TR','TD','TH','BR','HR','BLOCKQUOTE','PRE','CODE','A','IMG']);
 const root=document.createElement('div');
 function clean(source,target,level){
  if(level>45)return;
  for(const node of Array.from(source.childNodes)){
   if(node.nodeType===Node.TEXT_NODE){target.append(document.createTextNode(node.nodeValue||''));continue}
   if(node.nodeType!==Node.ELEMENT_NODE)continue;
   const tag=node.tagName;if(!good.has(tag)){clean(node,target,level+1);continue}
   const el=document.createElement(tag.toLowerCase());
   if(tag==='IMG'){
    const src=node.getAttribute('src')||'';
    if(!/^data:image\/(?:png|jpeg|gif|webp);base64,[a-z0-9+/=]+$/i.test(src)||src.length>5000000)continue;
    el.setAttribute('src',src);el.setAttribute('alt',(node.getAttribute('alt')||'').slice(0,160));
   }
   if(tag==='A'){
    const href=node.getAttribute('href')||'';
    if(/^#[a-z0-9_-]{1,80}$/i.test(href))el.setAttribute('href',href);
   }
   if((tag==='TD'||tag==='TH')&&Number(node.getAttribute('colspan'))>1)el.colSpan=Math.min(12,Number(node.getAttribute('colspan')));
   clean(node,el,level+1);target.append(el);
  }
 }
 clean(parsed.body,root,0);return root.innerHTML;
}
if(app==='word-to-pdf'){
 let sourceName='operava-word-document',loaded=false,busy=false;
 const preview=$('word-preview'),file=$('word-file'),btn=$('word-download'),print=$('word-print');
 const reset=()=>{preview.replaceChildren();const p=document.createElement('p');p.textContent='Select a document to preview it here.';preview.append(p);btn.disabled=true;print.disabled=true;loaded=false;file.value='';status('word-status','Document cleared from this preview.')};
 $('word-clear').onclick=reset;
 file.onchange=async()=>{const doc=file.files?.[0];reset();if(!doc)return;
  if(!/\.docx$/i.test(doc.name)){status('word-status','Only .docx documents are supported; save .doc files as .docx first.');return}
  if(doc.size>15*1024*1024){status('word-status','This tool supports DOCX files up to 15 MB.');return}
  busy=true;status('word-status','Loading document parser and converting locally…');
  try{
   if(!window.mammoth)await loadScript('https://cdn.jsdelivr.net/npm/mammoth@1.13.0/mammoth.browser.min.js');
   if(!window.mammoth?.convertToHtml)throw Error('Word converter did not initialize.');
   const bytes=await doc.arrayBuffer();
   const result=await window.mammoth.convertToHtml({arrayBuffer:bytes},{convertImage:window.mammoth.images.imgElement(window.mammoth.images.dataUri)});
   preview.innerHTML=sanitizedHTML(result.value||'');
   if(!preview.textContent.trim()&&!preview.querySelector('img'))throw Error('The selected document contained no previewable content.');
   sourceName=doc.name.replace(/\.docx$/i,'').replace(/[^a-z0-9 _.-]/gi,'').slice(0,70)||'operava-document';
   loaded=true;btn.disabled=false;print.disabled=false;
   status('word-status','Ready: '+doc.name+' ('+(doc.size/1048576).toFixed(2)+' MB). '+(result.messages?.length?'Check conversion notes: '+result.messages.length+' warning(s).':'Review formatting, then download PDF.'));
  }catch(error){status('word-status','Conversion unavailable: '+(error.message||'Please try another .docx file.'))}
  finally{busy=false}
 };
 btn.onclick=async()=>{if(!loaded||busy)return;busy=true;btn.disabled=true;status('word-status','Rendering PDF in your browser…');
 try{
  if(!window.html2pdf)await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js','sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg==');
  if(!window.html2pdf)throw Error('PDF renderer did not initialize');
  const oldMax=preview.style.maxHeight,oldOverflow=preview.style.overflow,oldHeight=preview.style.height;preview.style.maxHeight='none';preview.style.overflow='visible';preview.style.height='auto';try{await window.html2pdf().set({margin:Math.min(35,Math.max(5,Number($('word-margin')?.value)||14)),filename:sourceName+'.pdf',image:{type:'jpeg',quality:.96},html2canvas:{scale:2,backgroundColor:'#ffffff',useCORS:false,allowTaint:false},jsPDF:{unit:'mm',format:$('word-page-size')?.value==='letter'?'letter':'a4',orientation:$('word-orientation')?.value==='landscape'?'landscape':'portrait'},pagebreak:{mode:['css','legacy']}}).from(preview).save()}finally{preview.style.maxHeight=oldMax;preview.style.overflow=oldOverflow;preview.style.height=oldHeight}
  status('word-status','PDF generated and downloaded locally. Verify fonts, pagination and accuracy before relying on it.');
 }catch(e){status('word-status','PDF download unavailable: '+e.message+'. Use Print / Save as PDF instead.')}
 finally{busy=false;btn.disabled=false}
 };
 print.onclick=()=>{if(!loaded)return;const w=window.open('','_blank');if(!w){status('word-status','Popup blocked. Allow popups for this site or select Download PDF.');return}try{w.opener=null}catch{}w.document.open();w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>'+sourceName.replace(/[<>&"]/g,'')+'</title><style>'+docCss+'</style></head><body>'+sanitizedHTML(preview.innerHTML)+'</body></html>');w.document.close();w.focus();w.print()};
 window.addEventListener('pagehide',()=>{if(loaded)preview.replaceChildren()});
}
if(app==='calculator'){
 const keys=$('calc-run'),history=$('calc-history'),copy=$('calc-copy');if(keys&&history){
 const previous=keys.onclick;
 function capture(){const out=$('calc-output').textContent;if(out.startsWith('= ')){const row=document.createElement('li');row.textContent=$('calc-input').value+' '+out;history.prepend(row);while(history.children.length>6)history.lastChild.remove()}}
 keys.onclick=()=>{previous();capture()};
 $('calc-input')?.addEventListener('keydown',e=>{if(e.key==='Enter')setTimeout(capture,0)});
 copy?.addEventListener('click',async()=>{const output=$('calc-output').textContent;if(!output.startsWith('= '))return;try{await navigator.clipboard.writeText(output.slice(2));status('calc-status','Result copied to clipboard.')}catch{status('calc-status','Copy unavailable. Select the result instead.')}});
 }
}
if(app==='calendar'){
 $('cal-export-all')?.addEventListener('click',()=>{let saved={};try{saved=JSON.parse(localStorage.getItem('operava-calendar-v1')||'{}')}catch{};const keys=Object.keys(saved).filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x)&&saved[x]);if(!keys.length){status('cal-status','No locally saved notes to export.');return}const dates=keys.sort(),now=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
 const escape=x=>String(x).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//OPERAVA//Private Calendar//EN',...dates.flatMap(date=>{const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+1);const end=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('');return ['BEGIN:VEVENT','UID:'+date+'-'+Math.random().toString(36).slice(2)+'@operavaglobal.com','DTSTAMP:'+now,'DTSTART;VALUE=DATE:'+date.replace(/-/g,''),'DTEND;VALUE=DATE:'+end,'SUMMARY:'+escape(saved[date]),'END:VEVENT']}),'END:VCALENDAR'].join('\r\n');
 exportFile('operava-calendar-events.ics',lines,'text/calendar;charset=utf-8');status('cal-status','Exported '+dates.length+' local event(s) as an ICS calendar.')});
 $('cal-remove')?.addEventListener('click',()=>{$('cal-note').value='';$('cal-save').click()});
}
if(app==='html'){
 const source=$('html-code'),importer=$('html-import'),save=$('html-save-draft'),restore=$('html-restore-draft');
 importer?.addEventListener('change',async()=>{const f=importer.files?.[0];if(!f)return;if(f.size>1024*1024){status('html-status','HTML files over 1 MB are not supported for local editing.');return}source.value=await f.text();$('html-preview').click();status('html-status','Imported '+f.name+' into the local editor. No upload was performed.')});
 save?.addEventListener('click',()=>{try{localStorage.setItem('operava-html-draft-v1',source.value);status('html-status','Draft saved to this browser only.')}catch{status('html-status','Browser storage is unavailable. Download the HTML instead.')}});
 restore?.addEventListener('click',()=>{let v;try{v=localStorage.getItem('operava-html-draft-v1')}catch{}if(v===null||v===undefined){status('html-status','No saved browser-local draft found.');return}source.value=v;$('html-preview').click();status('html-status','Restored saved local draft.')});
 $('html-copy')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(source.value);status('html-status','HTML source copied to clipboard.')}catch{status('html-status','Clipboard unavailable. Select and copy the source manually.')}});
}
if(app==='pdf'){
 $('pdf-word')?.addEventListener('click',()=>{location.href='/utilities/word-to-pdf/'});
}
if(app==='references'){
 const root=$('ref-grid'),filter=$('ref-category'),cards=[...root.querySelectorAll('.ref-card')];
 if(filter){cards.forEach(c=>{const span=c.querySelector('span')?.textContent||'';const topic=span.split(' · ')[0].toLowerCase();c.dataset.category=topic.includes('politic')?'politics':topic.includes('news')?'news':topic.includes('health')?'health':'other'});
 const update=()=>{const q=$('ref-search').value.toLowerCase().trim(),topic=filter.value;let found=0;cards.forEach(c=>{const match=(!q||(c.dataset.search+' '+c.textContent).toLowerCase().includes(q))&&(topic==='all'||topic===c.dataset.category);c.hidden=!match;if(match)found++});status('ref-count',found+' curated sources');$('ref-empty').hidden=found>0};
 filter.addEventListener('change',update);$('ref-search').addEventListener('input',update);update();}
}
})();