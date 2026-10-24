/* OPERAVA V2 utility motion parity. Theme state is owned by existing theme
   switch logic on each page and shares the website's operava-theme storage key. */
(function(){
'use strict';
function start(){
  var doc=document.documentElement;
  doc.style.colorScheme=doc.dataset.theme==='light'?'light':'dark';
  var ambient=document.createElement('div');ambient.className='op-tools-ambient';ambient.setAttribute('aria-hidden','true');document.body.prepend(ambient);
  var header=document.querySelector('.op-site-header');
  var bar=null;
  if(header){
    bar=document.createElement('div');
    bar.className='op-scroll-progress';bar.setAttribute('aria-hidden','true');header.appendChild(bar);
  }
  var scheduled=false;
  function update(){
    scheduled=false;
    var max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    if(bar)bar.style.transform='scaleX('+Math.min(1,Math.max(0,scrollY/max))+')';
    if(header)header.classList.toggle('op-scrolled',scrollY>20);
  }
  window.addEventListener('scroll',function(){if(!scheduled){scheduled=true;requestAnimationFrame(update)}},{passive:true});
  window.addEventListener('resize',update);
  window.addEventListener('operava-theme-change',function(){doc.style.colorScheme=doc.dataset.theme==='light'?'light':'dark'});
  update();
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window){
    var els=document.querySelectorAll('.tool-panel,.explainer,.faq,.ref-card,.op-addon,.utility-card,.tool-card,.tool-tile');
    var io=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('op-inview');io.unobserve(entry.target)}})},{threshold:.08,rootMargin:'0px 0px 40px 0px'});
    els.forEach(function(el){el.classList.add('op-parity-reveal');if(el.getBoundingClientRect().top<innerHeight*.9){el.classList.add('op-inview')}else{io.observe(el)}});
    doc.classList.add('op-parity-motion');
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();