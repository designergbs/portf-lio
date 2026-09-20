
/* linha do resumo: mesmo progresso por scroll da timeline de experiência */
(function(){
  var el=null,raf=0,beam=null,peak=0;
  function upd(){raf=0;if(!el)return;var r=el.getBoundingClientRect(),span=Math.max(1,el.clientHeight),top=r.top+el.clientTop;var p=(window.innerHeight*0.55-top)/span;p=p<0?0:(p>1?1:p);if(p>peak)peak=p;p=peak;el.style.setProperty("--lead-prog",p.toFixed(4));el.style.setProperty("--lead-px",(p>=0.999?span+40:span*p).toFixed(1)+"px");if(p>=0.999)document.documentElement.setAttribute("data-lead-prog-done","");if(beam){beam.style.transform="none";beam.style.opacity=p<=0?0:(p>=1?0:(p>0.92?(1-p)/0.08:1));}}
  function tick(){if(!raf)raf=requestAnimationFrame(upd);}
  var bound=false;
  function attach(){var found=document.querySelector(".kit-about__body .kit-lead-group")||document.querySelector(".kit-lead-group");if(found!==el){el=found;beam=null;}    if(!el)return;
    beam=el.querySelector(".kit-lead-beam");
    if(!beam){beam=document.createElement("div");beam.className="kit-lead-beam";el.appendChild(beam);}
    if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion:reduce)").matches){el.style.setProperty("--lead-prog",1);return;}
    if(!bound){bound=true;window.addEventListener("scroll",tick,{passive:true});window.addEventListener("resize",tick);}
    upd();}
  setInterval(attach,400);attach();
})();
(function(){function wrap(){document.querySelectorAll("#experiencia .gb-exp__tags").forEach(function(t){if(t.querySelector(":scope > .gb-exp__tags-inner"))return;var inner=document.createElement("div");inner.className="gb-exp__tags-inner";while(t.firstChild)inner.appendChild(t.firstChild);t.appendChild(inner);});}
var obsEl=null;function boot(){var sec=document.getElementById("experiencia");if(!sec||!sec.querySelector(".gb-exp__tags"))return;wrap();if(obsEl!==sec){obsEl=sec;new MutationObserver(wrap).observe(sec,{childList:true,subtree:true});}}
setInterval(boot,400);boot();})();
(function(){var raf=0;
function sync(){raf=0;if(window.innerWidth<=1180){document.querySelectorAll("#experiencia .gb-exp").forEach(function(c){if(c.style.getPropertyValue("--tags-offset"))c.style.removeProperty("--tags-offset");});return;}
document.querySelectorAll("#experiencia .gb-exp").forEach(function(card){var inner=card.querySelector(".gb-exp__tags-inner");if(!inner)return;
var openExtra=0;card.querySelectorAll("details.gb-exp__disc").forEach(function(det){if(!det.open)return;var body=det.querySelector("ul,.gb-exp__list");if(body)openExtra+=body.offsetHeight;});
var closedH=card.offsetHeight-openExtra;
var v=Math.round((closedH-inner.offsetHeight)/2)+"px";
if(card.style.getPropertyValue("--tags-offset")!==v)card.style.setProperty("--tags-offset",v);});}
function tick(){if(!raf)raf=requestAnimationFrame(sync);}
var obs2=null,bound2=false;
function boot2(){var sec=document.getElementById("experiencia");if(!sec||!sec.querySelector(".gb-exp__tags-inner"))return;if(!bound2){bound2=true;window.addEventListener("resize",tick);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(sync);}if(obs2!==sec){obs2=sec;new MutationObserver(tick).observe(sec,{childList:true,subtree:true});}sync();}
setInterval(boot2,400);boot2();})();

(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var raf = 0, tl = null, fill = null, beam = null, rail = null, nodes = [], firstC = 0, lastC = 0, tlH = 0, prev = -1, peak = 0;
  function build(el, listenersBound){
    tl = el;
    rail = document.createElement('span');
    rail.className = 'gb-tl';
    rail.setAttribute('aria-hidden','true');
    rail.innerHTML = '<span class="gb-tl__base"></span><span class="gb-tl__fill"></span><span class="gb-tl__beam"></span>';
    tl.insertBefore(rail, tl.firstChild);
    fill = rail.querySelector('.gb-tl__fill');
    beam = rail.querySelector('.gb-tl__beam');
    nodes = Array.prototype.slice.call(tl.querySelectorAll('.gb-timeline__node'));
    measure();
    if(reduce){ nodes.forEach(function(n){ n.classList.add('is-on'); var it = n.closest('.gb-timeline__item'); if(it) it.classList.add('is-lit'); }); return; }
    var onScroll = function(){ if(!raf) raf = requestAnimationFrame(paint); };
    if(!listenersBound){
      window.addEventListener('scroll', onScroll, { passive:true });
      window.addEventListener('resize', function(){ measure(); onScroll(); });
    }
    if('ResizeObserver' in window){
      var ro = new ResizeObserver(function(){ measure(); onScroll(); });
      ro.observe(tl);
      Array.prototype.forEach.call(tl.children, function(c){ if(c !== rail) ro.observe(c); });
    }
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ measure(); paint(); });
    paint();
  }
  /* leituras de layout concentradas aqui; offsetTop é imune a transforms de entrada */
  function offTop(el, stop){
    var y = 0, n = el;
    while(n && n !== stop){ y += n.offsetTop; n = n.offsetParent; }
    return y;
  }
  function measure(){
    if(!tl || !nodes.length) return;
    tlH = tl.offsetHeight;
    nodes.forEach(function(n){ n.__c = offTop(n, tl) + n.offsetHeight / 2; });
    firstC = nodes[0].__c;
    lastC = nodes[nodes.length - 1].__c;
    rail.style.top = firstC + 'px';
    rail.style.height = Math.max(0, tlH - firstC) + 'px';
    var span = Math.max(1, tlH - firstC);
    fill.style.height = span + 'px';
    if(reduce) return;
    write(prev < 0 ? 0 : prev, true);
  }
  function write(p, force){
    var span = Math.max(1, tlH - firstC);
    fill.style.transform = 'scaleY(' + p + ')';
    beam.style.transform = 'translateY(' + (span * p) + 'px)';
    beam.style.opacity = p <= 0 ? 0 : (p >= 1 ? 0 : (p > 0.92 ? (1 - p) / 0.08 : 1));
    var tipIdx = 0;
    nodes.forEach(function(n, i){
      var t = (n.__c - firstC) / span;
      var on = p >= t - 0.001;
      var item = n.closest('.gb-timeline__item');
      if(item) item.classList.toggle('is-lit', on);
      if(on){
        tipIdx = i;
        if(!n.classList.contains('is-on')){
          n.classList.add('is-on');
          if(!force){ n.classList.add('is-hit'); setTimeout(function(){ n.classList.remove('is-hit'); }, 460); }
        }
      } else { n.classList.remove('is-on','is-hit'); }
    });
    nodes.forEach(function(n, i){ n.classList.toggle('is-tip', i === tipIdx && n.classList.contains('is-on')); });
  }
  function paint(){
    raf = 0;
    if(!tl) return;
    var top = tl.getBoundingClientRect().top + window.scrollY;
    var line = window.scrollY + window.innerHeight * 0.55;
    var p = (line - (top + firstC)) / Math.max(1, tlH - firstC);
    p = p < 0 ? 0 : (p > 1 ? 1 : p);
    // Só avança: ao subir o scroll, mantém o maior preenchimento já alcançado.
    if(p > peak) peak = p;
    p = peak;
    if(Math.abs(p - prev) < 0.001) return;
    prev = p;
    write(p);
  }
  var bound = false;
  setInterval(function(){
    var el = document.querySelector('#experiencia .gb-timeline');
    if(!el){ tl = null; prev = -1; return; }
    if(el === tl && el.querySelector('.gb-tl')) return;
    if(el.querySelector('.gb-tl')) return;
    prev = -1;    build(el, bound);
    bound = true;
  }, 250);
})();

(function(){
  if(!('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('has-reveal-js');
  var init=function(){
    var groups=document.querySelectorAll('[data-reveal-group]:not([data-reveal-bound])');
    if(!groups.length) return;
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
        setTimeout(function(){
          e.target.querySelectorAll('[data-reveal-card]').forEach(function(c){c.classList.add('reveal-done');});
        },1000);
      });
    },{threshold:0.15,rootMargin:'0px 0px -10% 0px'});
    groups.forEach(function(g){g.setAttribute('data-reveal-bound','');io.observe(g);});
  };
  setInterval(init,400);init();
})();
