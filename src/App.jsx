/* Ported verbatim from the original ui_kits/portfolio/index.html inline <script> (the
   hash-based Home/CaseStudy view switcher). Left as-is on purpose: it drives the fade
   transition between views and the scroll-to-anchor/scroll-to-top logic, and still reads
   Home/CaseStudy/CaseTradeIn/GB/GB_AGIBANK off `window`, exactly like every other legacy
   module under src/legacy/ (see src/ds-bootstrap.js and src/main.jsx for how those globals
   get set up before this component ever renders). */
function App(){
  const {lang}=window.useLang();
  const [view,setView]=React.useState(()=>{const m=/case=([\w-]+)/.exec(location.hash);return m?{name:"case",slug:m[1]}:{name:"home"};});
  const [out,setOut]=React.useState(false);
  /* título/descrição da home tal como vieram do index.html — capturados uma
     única vez (antes de qualquer troca de view) para restaurar exatamente o
     que já existia ao voltar pra Home, sem duplicar esses textos aqui. */
  const [homeMeta]=React.useState(()=>{
    const m=document.querySelector('meta[name="description"]');
    return {title:document.title,desc:m?m.getAttribute("content"):""};
  });
  const first=React.useRef(true);
  const timers=React.useRef([]);
  React.useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);
  const jump=React.useCallback(()=>{const r=document.documentElement,p=r.style.scrollBehavior;r.style.scrollBehavior='auto';window.scrollTo(0,0);document.body.scrollTop=0;r.scrollTop=0;r.style.scrollBehavior=p;},[]);
  const navTo=React.useCallback((next)=>{
    const reduce=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    if(reduce){jump();setView(next);return;}
    setOut(true);
    timers.current.push(setTimeout(()=>{jump();setView(next);},240));
  },[jump]);
  /* mantém a URL em sincronia com a view atual (só compara o slug do case, não
     o hash inteiro — assim não apaga a âncora de seção que o índice do case
     grava no próprio hash, ex. "#case=trade-in&resultados"). Sem isso, abrir um
     case pelo clique nunca mudava a barra de endereço: nova aba, atualizar e
     voltar/avançar do navegador sempre caíam de volta na Home. */
  React.useEffect(()=>{
    const m=/case=([\w-]+)/.exec(location.hash);
    const currentSlug=m?m[1]:null;
    const desiredSlug=view.name==="case"?view.slug:null;
    if(currentSlug===desiredSlug)return;
    const desired=desiredSlug?"#case="+desiredSlug:"";
    window.history.pushState({name:view.name,slug:desiredSlug||undefined},"",location.pathname+location.search+desired);
  },[view.name,view.slug]);
  /* voltar/avançar do navegador: re-deriva a view do hash (que o browser já
     trocou sozinho) e reaproveita a mesma transição de fade do navTo. */
  React.useEffect(()=>{
    const onPopState=()=>{
      const m=/case=([\w-]+)/.exec(location.hash);
      navTo(m?{name:"case",slug:m[1]}:{name:"home"});
    };
    window.addEventListener("popstate",onPopState);
    return ()=>window.removeEventListener("popstate",onPopState);
  },[navTo]);
  /* título/descrição por case e idioma; restaura os valores originais da home
     (capturados em homeMeta) assim que a view volta a ser "home". */
  React.useEffect(()=>{
    const metaDesc=document.querySelector('meta[name="description"]');
    if(view.name==="case"){
      const item=(window.GB.cases||[]).find((c)=>c.slug===view.slug);
      document.title=item&&item.title?item.title+" — "+homeMeta.title:homeMeta.title;
      const desc=(item&&item.context)||homeMeta.desc;
      if(metaDesc&&desc)metaDesc.setAttribute("content",desc);
    }else{
      document.title=homeMeta.title;
      if(metaDesc)metaDesc.setAttribute("content",homeMeta.desc);
    }
  },[view.name,view.slug,lang,homeMeta]);
  /* o novo view monta ainda invisível: reposiciona no topo antes de qualquer pintura e só então faz fade-in */
  React.useLayoutEffect(()=>{
    if(first.current){first.current=false;return;}
    if(!view.anchor)jump();
    let a=0,b=0;
    a=requestAnimationFrame(()=>{if(!view.anchor)jump();b=requestAnimationFrame(()=>setOut(false));});
    /* rAF é pausado em abas/iframes em segundo plano: fallback garante que a view apareça */
    const t=setTimeout(()=>{if(!view.anchor)jump();setOut(false);},120);
    return ()=>{cancelAnimationFrame(a);cancelAnimationFrame(b);clearTimeout(t);};
  },[view,jump]);
  React.useEffect(()=>{window.lucide&&window.lucide.createIcons();
    if(!view.anchor){return;}
    const nav=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'))||96;
    const root=document.documentElement;const prev=root.style.scrollBehavior;root.style.scrollBehavior='auto';
    let tries=0,raf=0,timer=0;
    const go=()=>{const t=document.getElementById(view.anchor);if(!t){root.style.scrollBehavior=prev;return;}
      const y=Math.max(t.getBoundingClientRect().top+window.scrollY-nav,0);
      if(Math.abs(window.scrollY-y)>1)window.scrollTo({top:y,behavior:'instant'});
      if(++tries<6){timer=window.setTimeout(()=>{raf=window.requestAnimationFrame(go);},100);}else{root.style.scrollBehavior=prev;}};
    raf=window.requestAnimationFrame(go);
    return ()=>{if(raf)window.cancelAnimationFrame(raf);if(timer)window.clearTimeout(timer);root.style.scrollBehavior=prev;};
  },[view]);
  const shell=(c)=><div className={"kit-viewfade"+(out?" is-out":"")}><a className="gb-skip-link" href="#main-content">{window.gbT("caseCommon.skipToContent")}</a>{c}</div>;
  if(view.name==="case"){const list=window.GB.cases;const item=list.find(c=>c.slug===view.slug)||list[0];const next=list[(list.indexOf(item)+1)%list.length];
    const back=(anchor)=>navTo({name:"home",anchor:typeof anchor==="string"?anchor:null});
    if(item.slug==="trade-in"&&window.CaseTradeIn) return shell(<window.CaseTradeIn key={item.slug} onBack={back} onOpenCase={(slug)=>navTo({name:"case",slug})} nextCase={next}/>);
    if(item.slug==="app-agi"&&window.CaseTradeIn&&window.GB_AGIBANK) return shell(<window.CaseTradeIn key={item.slug} data={window.GB_AGIBANK} onBack={back} onOpenCase={(slug)=>navTo({name:"case",slug})} nextCase={next}/>);
    return shell(<window.CaseStudy slug={item.slug} onBack={back} onOpenCase={(slug)=>navTo({name:"case",slug})}/>);}
  return shell(<window.Home onOpenCase={(slug)=>navTo({name:"case",slug})}/>);
}

export default App;
