
/* linha do resumo: mesmo progresso por scroll da timeline de experiência.
   Bidirecional: sobe ao rolar pra baixo, desce ao rolar de volta pra cima
   (sem "trava" no maior ponto já alcançado). */
(function(){
  var el=null,raf=0,beam=null;
  /* mesma linha de gatilho e normalização pelo próprio tamanho do bloco que a timeline
     de experiência usa (scrollY + 55% da viewport, dividido pela altura real do
     elemento) — a fórmula antiga (70% da viewport + distância combinando viewport e
     conteúdo) acendia antes da hora, mais perceptível no mobile onde o bloco ocupa
     proporcionalmente mais altura da tela. */
  function upd(){raf=0;if(!el)return;var r=el.getBoundingClientRect(),span=Math.max(1,el.clientHeight),docTop=r.top+window.scrollY;var vh=window.innerHeight,line=window.scrollY+vh*0.55;var p=(line-docTop)/span;p=p<0?0:(p>1?1:p);el.style.setProperty("--lead-prog",p.toFixed(4));el.style.setProperty("--lead-px",(p>=0.999?span+40:span*p).toFixed(1)+"px");if(p>=0.999){document.documentElement.setAttribute("data-lead-prog-done","");}else{document.documentElement.removeAttribute("data-lead-prog-done");}if(beam){beam.style.transform="none";beam.style.opacity=p<=0?0:(p>=1?0:(p>0.92?(1-p)/0.08:1));}}
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
/* retrato "Sobre": o scroll só dispara — a varredura em si roda com atraso e
   duração fixos via Web Animations API, sem nenhum vínculo com a posição/
   velocidade do scroll depois de disparada.
   Gatilho = mudança de direção do scroll enquanto a seção está visível: assim
   que o sentido muda (descendo -> subindo ou vice-versa), toca a animação no
   sentido correspondente — não precisa sair e reentrar na viewport. "normal"
   é natural -> halo (linha desce); "reverse" é halo -> natural (linha sobe),
   mesmo par de keyframes nos dois sentidos. "playing" ignora novos gatilhos
   até a transição atual terminar, mas ao terminar reconsidera a direção mais
   recente (útil se o usuário mudou de ideia no meio da transição). */
(function(){
  var lastY=window.scrollY||0,scrollDir="down",lastPlayedDir=null,isIntersecting=false;
  window.addEventListener("scroll",function(){
    var y=window.scrollY||0;
    if(Math.abs(y-lastY)>1){
      var d=y>lastY?"down":"up";
      if(d!==scrollDir){scrollDir=d;maybePlay();}
    }
    lastY=y;
  },{passive:true});

  var DUR=1500,DELAY=1000,EASE="cubic-bezier(0.45,0,0.2,1)";
  var HALO_KF=[{clipPath:"inset(0px 0px 100%)"},{clipPath:"inset(0px 0px 0%)"}];
  var LINE_KF=[{top:"0%",opacity:0,offset:0},{top:"4%",opacity:1,offset:0.04},{top:"96%",opacity:1,offset:0.96},{top:"100%",opacity:0,offset:1}];

  var el=null,halo=null,scanline=null,io=null,playing=false,haloAnim=null,lineAnim=null,firstPlay=true;

  function maybePlay(){
    if(!isIntersecting||playing||scrollDir===lastPlayedDir)return;
    play(scrollDir);
  }

  function play(dir){
    if(playing||!halo||!scanline)return;
    playing=true;
    lastPlayedDir=dir;
    var opts={duration:DUR,delay:firstPlay?DELAY:0,easing:EASE,fill:"forwards",direction:dir==="down"?"normal":"reverse"};
    firstPlay=false;
    if(haloAnim){try{haloAnim.commitStyles();haloAnim.cancel();}catch(e){}}
    if(lineAnim){try{lineAnim.commitStyles();lineAnim.cancel();}catch(e){}}
    haloAnim=halo.animate(HALO_KF,opts);
    lineAnim=scanline.animate(LINE_KF,opts);
    function done(){playing=false;maybePlay();}
    Promise.all([haloAnim.finished,lineAnim.finished]).then(done,done);
  }

  function attach(){
    var found=document.querySelector(".kit-portrait-reveal");
    if(found!==el){el=found;halo=null;scanline=null;lastPlayedDir=null;firstPlay=true;if(io){io.disconnect();io=null;}}
    if(!el)return;
    if(!halo)halo=el.querySelector(".kit-portrait-reveal__img--halo");
    if(!scanline)scanline=el.querySelector(".kit-portrait-reveal__scanline");
    var reduceMotion=!!(window.matchMedia&&window.matchMedia("(prefers-reduced-motion:reduce)").matches);
    if(reduceMotion){
      if(io){io.disconnect();io=null;}
      if(halo)halo.style.clipPath="inset(0px)";
      if(scanline)scanline.style.opacity="0";
      return;
    }
    if(!io){
      io=new IntersectionObserver(function(entries){
        entries.forEach(function(e){isIntersecting=e.isIntersecting;if(isIntersecting)maybePlay();});
      },{threshold:0,rootMargin:"0px"});
      io.observe(el);
    }
  }
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
  var raf = 0, tl = null, fill = null, beam = null, rail = null, nodes = [], firstC = 0, lastC = 0, tlH = 0, prev = -1;
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
      /* o primeiro nó tem t=0, então "p >= t - 0.001" já batia (quase) sempre —
         acendia por padrão antes de qualquer scroll. Só ele exige p>0 de verdade
         (o trilho já começou a preencher); os demais mantêm a mesma tolerância. */
      var on = i === 0 ? p > 0.001 : p >= t - 0.001;
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
    // Bidirecional: acompanha a posição real do scroll nos dois sentidos.
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

/* scroll suave para links âncora internos (ex.: "Conhecer projetos" na hero),
   com easing custom em vez do behavior:'smooth' nativo (rápido demais) —
   não mexe no hash da URL para não interferir no gate de intro.js. */
(function(){
  function easeOutQuart(t){ return 1-Math.pow(1-t,4); }
  function smoothScrollTo(y, duration){
    var root = document.documentElement, prev = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    var startY = window.scrollY, dist = y - startY, startTime = null;
    function step(ts){
      if(startTime===null) startTime = ts;
      var p = Math.min((ts-startTime)/duration, 1);
      window.scrollTo(0, startY + dist*easeOutQuart(p));
      if(p<1) requestAnimationFrame(step);
      else root.style.scrollBehavior = prev;
    }
    requestAnimationFrame(step);
  }
  document.addEventListener('click', function(e){
    var a = e.target.closest('a[href^="#"]');
    if(!a) return;
    var id = a.getAttribute('href').slice(1);
    if(!id) return;
    var target = document.getElementById(id);
    if(!target) return;
    e.preventDefault();
    var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    var nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 96;
    var y = Math.max(target.getBoundingClientRect().top + window.scrollY - nav, 0);
    if(reduce){ window.scrollTo(0, y); } else { smoothScrollTo(y, 1100); }
    /* preventDefault() acima também cancela o passo nativo de foco do navegador
       ao seguir um link "#id" — sem isto, o skip-link ("Pular para o conteúdo")
       só rolava a tela sem levar o foco do teclado junto. .focus() não faz nada
       em elementos sem tabindex (a maioria dos alvos "#id" do site), então é
       seguro chamar aqui pra qualquer link, não só o skip-link. */
    target.focus({ preventScroll: true });
  });
})();
