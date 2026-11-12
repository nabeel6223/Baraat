export function initialize(config) {
const WEDDING=config.wedding, WALIMA=config.reception;
const opener=document.getElementById('opener');
const openBtn=document.getElementById('openBtn');
const video=document.getElementById('openingVideo');
const bgMusic=document.getElementById('bgMusic');
const website=document.getElementById('website');
const scratchCard=document.getElementById('scratchCard');
const scratchCanvas=document.getElementById('scratchCanvas');
const confettiCanvas=document.getElementById('confetti');
const sparkles=document.getElementById('sparkles');
let opened=false,scratched=false,drawing=false;

let shown=false;
function showWebsite(){
  if(shown)return;shown=true;
  opener.classList.add('done');
  setTimeout(()=>{
    opener.classList.add('hidden');
    website.classList.remove('hidden');
    website.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    startSlideshow();
    setupScratch();
    buildCalendar();
    startCountdown();
    startReveals();
    startSparkles();
    window.scrollTo(0,0);
  },650);
}
function startSlideshow(){
  const slides=[...website.querySelectorAll(':scope > .sec')];
  const nav=document.getElementById('slideNav');
  const prev=document.getElementById('prevSlide'),next=document.getElementById('nextSlide');
  const pause=document.getElementById('pauseSlides'),status=document.getElementById('slideStatus');
  const progress=document.getElementById('slideProgress'),title=document.getElementById('slideTitle');
  const options=config.slideshow;
  let index=0,paused=false,interacting=false,focused=false,elapsed=0,last=performance.now(),swipe=null;
  const duration=()=>Math.max(2000,Number(slides[index].classList.contains('scratch-section')?options.scratchIntervalMs:slides[index].matches('.story,.closing,.event')?options.readingIntervalMs:options.intervalMs)||9000);
  function go(value){
    index=options.loop?(value+slides.length)%slides.length:Math.max(0,Math.min(slides.length-1,value));
    elapsed=0;last=performance.now();
    slides.forEach((slide,i)=>{
      const active=i===index;
      slide.classList.toggle('active-slide',active);
      slide.setAttribute('aria-hidden',String(!active));slide.inert=!active;
      slide.querySelector('.reveal').classList.toggle('visible',active);
    });
    sparkles.classList.toggle('finale-petals',slides[index].classList.contains('closing'));
    prev.disabled=!options.loop&&index===0;
    next.disabled=!options.loop&&index===slides.length-1;
    status.textContent=`${index+1} / ${slides.length}`;
    title.textContent=slides[index].querySelector('h2,h3')?.textContent||config.hero.label;
    progress.style.transform='scaleX(0)';
  }
  function frame(now){
    const stopped=paused||interacting||focused||document.hidden;
    if(!stopped)elapsed+=Math.min(now-last,100);
    last=now;
    const fraction=Math.min(1,elapsed/duration());
    progress.style.transform=`scaleX(${fraction})`;
    progress.parentElement.setAttribute('aria-valuenow',String(Math.round(fraction*100)));
    if(fraction>=1&&!stopped&&(options.loop||index<slides.length-1))go(index+1);
    requestAnimationFrame(frame);
  }
  prev.addEventListener('click',()=>go(index-1));
  next.addEventListener('click',()=>go(index+1));
  pause.addEventListener('click',()=>{paused=!paused;pause.textContent=paused?options.play:options.pause;pause.setAttribute('aria-pressed',String(paused));});
  document.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();go(index+1)}if(e.key==='ArrowLeft'){e.preventDefault();go(index-1)}});
  website.addEventListener('pointerdown',e=>{interacting=true;if(!e.target.closest('canvas,button,a'))swipe={x:e.clientX,y:e.clientY};});
  function endGesture(e){
    if(swipe){const dx=e.clientX-swipe.x,dy=e.clientY-swipe.y;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.4)go(index+(dx<0?1:-1));}
    swipe=null;interacting=false;
  }
  window.addEventListener('pointerup',endGesture);
  window.addEventListener('pointercancel',()=>{swipe=null;interacting=false;});
  website.addEventListener('focusin',()=>{focused=true;});
  website.addEventListener('focusout',()=>{focused=false;});
  nav.classList.remove('hidden');
  go(0);requestAnimationFrame(frame);
}

/* Floating gold sparkles + drifting rose petals */
function startSparkles(){
  if(sparkles.dataset.on)return;sparkles.dataset.on='1';
  sparkles.classList.remove('hidden');
  const r=(a,b)=>a+Math.random()*(b-a);
  for(let i=0;i<26;i++){
    const d=document.createElement('i'),sz=r(3,8);
    d.style.cssText=`left:${r(0,100)}%;width:${sz}px;height:${sz}px;--sx:${r(-30,30)}px;animation-duration:${r(9,19)}s;animation-delay:${r(0,14)}s`;
    sparkles.appendChild(d);
  }
  for(let i=0;i<8;i++){
    const p=document.createElement('b');
    p.style.cssText=`left:${r(0,100)}%;--sx:${r(-50,50)}px;animation-duration:${r(14,24)}s;animation-delay:${r(0,18)}s;transform-origin:center`;
    sparkles.appendChild(p);
  }
}

function startReveals(){
  document.querySelectorAll('.reveal').forEach(el=>[...el.children].forEach((c,i)=>c.style.setProperty('--i',i)));

}
openBtn.addEventListener('click',async()=>{
  if(opened)return;
  opened=true;
  openBtn.classList.add('clicked');
  video.currentTime=0;
  video.muted=true;
  // The Tap to Open click is a user gesture, so start the supplied music here.
  // It keeps playing after the opening video ends and the invitation website appears.
  try{
    bgMusic.currentTime=0;
    bgMusic.loop=config.media.loop;bgMusic.volume=config.media.volume;
    await bgMusic.play();
  }catch(e){}
  if(config.opening.mode==='seal'){opener.classList.add('seal-broken');setTimeout(showWebsite,700);return;}
  try{await video.play()}catch(e){showWebsite();}
  // safety net: if the video can't play or never finishes, still open the invitation
  setTimeout(showWebsite,((isFinite(video.duration)&&video.duration)||3)*1000+2500);
});
video.addEventListener('ended',showWebsite);
video.addEventListener('error',()=>{if(config.opening.mode!=='seal')showWebsite();});
const vsrc=video.querySelector('source');if(vsrc)vsrc.addEventListener('error',()=>{if(config.opening.mode!=='seal')showWebsite();});


/* ---------- Heart the Date: monthly calendar with a burgundy heart ---------- */
const HEART='<svg viewBox="0 0 32 30" aria-hidden="true"><path d="M16 29C14 27.5 1 18.5 1 9.5 1 4.5 4.8 1.5 8.8 1.5c3 0 5.5 1.7 7.2 4.3 1.7-2.6 4.2-4.3 7.2-4.3C27.2 1.5 31 4.5 31 9.5 31 18.5 18 27.5 16 29z"/></svg>';
const ordinal=n=>n+(['th','st','nd','rd'][(n%100>>3^1&&n%10<4)?n%10:0]||'th');
function buildCalendar(){
  const grid=document.getElementById('calGrid');
  if(!grid||grid.dataset.built)return;grid.dataset.built='1';
  const y=WEDDING.year,m=WEDDING.month-1;
  const first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate();
  document.getElementById('calMonth').textContent=new Date(y,m,1).toLocaleDateString(config.locale,{month:'long',year:'numeric'});
  let html='';
  for(let i=0;i<first;i++)html+='<span class="day"></span>';
  for(let d=1;d<=days;d++){
    if(d===WEDDING.day)html+=`<span class="day heart">${HEART}<b>${d}</b></span>`;
    else if(WALIMA&&WALIMA.year===y&&WALIMA.month-1===m&&d===WALIMA.day)html+=`<span class="day ring"><b>${d}</b></span>`;
    else html+=`<span class="day"><b>${d}</b></span>`;
  }
  grid.innerHTML=html;
  const wd=new Date(y,m,WEDDING.day).toLocaleDateString(config.locale,{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  const note=document.getElementById('calNote');
  note.textContent=wd;
  if(WALIMA){const small=document.createElement('small');small.textContent=config.calendar.receptionNote.replace('{label}',WALIMA.label).replace('{date}',new Date(WALIMA.year,WALIMA.month-1,WALIMA.day).toLocaleDateString(config.locale,{day:'numeric',month:'long'}));note.appendChild(small);}

}

/* ---------- Wedding Countdown (live) ---------- */
function startCountdown(){
  const els={d:document.getElementById('cdD'),h:document.getElementById('cdH'),m:document.getElementById('cdM'),s:document.getElementById('cdS')};
  const note=document.getElementById('cdNote');
  if(!els.d||els.d.dataset.on)return;els.d.dataset.on='1';
  const target=new Date(WEDDING.iso).getTime();
  const pad=n=>String(n).padStart(2,'0');
  const set=(el,v)=>{if(el.textContent!==v){el.textContent=v;el.classList.remove('tick');void el.offsetWidth;el.classList.add('tick')}};
  function tick(){
    let t=Math.max(0,Math.floor((target-Date.now())/1000));
    set(els.d,String(Math.floor(t/86400)));
    set(els.h,pad(Math.floor(t%86400/3600)));
    set(els.m,pad(Math.floor(t%3600/60)));
    set(els.s,pad(t%60));
    if(t===0){note.textContent=config.countdown.finished;clearInterval(timer)}
  }
  const timer=setInterval(tick,1000);
  tick();
}

let scratchStarted=false;
const fontsReady=(document.fonts&&document.fonts.load)?Promise.all([
  document.fonts.load('48px "Great Vibes"'),document.fonts.load('700 40px "Dancing Script"'),document.fonts.load('600 11px Montserrat'),document.fonts.load('500 10px Montserrat')
]).catch(()=>{}):Promise.resolve();
async function setupScratch(){
  if(scratched)return;
  await Promise.race([fontsReady,new Promise(r=>setTimeout(r,1800))]);
  if(scratched||scratchStarted)return;
  const r=scratchCard.getBoundingClientRect();if(!r.width)return;const d=Math.min(2,window.devicePixelRatio||1);
  scratchCanvas.width=Math.round(r.width*d);scratchCanvas.height=Math.round(r.height*d);
  scratchCanvas.style.width=r.width+'px';scratchCanvas.style.height=r.height+'px';
  const c=scratchCanvas.getContext('2d');c.setTransform(d,0,0,d,0,0);
  c.globalCompositeOperation='source-over';
  const W=r.width,H=r.height;

  // Brushed-gold foil
  const gold=c.createLinearGradient(0,0,W,H);
  [[0,'#b8892f'],[.2,'#e3c775'],[.42,'#f6e6b0'],[.62,'#d2a850'],[.82,'#f4e2a4'],[1,'#b0802a']].forEach(([o,col])=>gold.addColorStop(o,col));
  c.fillStyle=gold;c.fillRect(0,0,W,H);
  // fine foil lines
  c.globalAlpha=.16;
  for(let i=0;i<Math.floor(W/6);i++){
    c.fillStyle=i%2?'#fff8d7':'#6e4a14';
    c.fillRect(i*6+Math.random()*3,0,Math.random()*.8+.25,H);
  }
  c.globalAlpha=1;
  // double frame
  c.strokeStyle='rgba(107,20,37,.55)';c.lineWidth=1.2;c.strokeRect(12,12,W-24,H-24);
  c.strokeStyle='rgba(255,248,220,.85)';c.lineWidth=1;c.strokeRect(17,17,W-34,H-34);

  c.textAlign='center';c.textBaseline='middle';
  // engraved text: light highlight underneath, burgundy on top (readable on gold)
  const engrave=(txt,x,y)=>{
    c.fillStyle='rgba(255,248,220,.9)';c.fillText(txt,x,y+1.2);
    c.fillStyle='#5e1021';c.fillText(txt,x,y);
  };
  c.letterSpacing='3.5px';
  c.font='600 11px Montserrat, sans-serif';
  engrave(config.scratch.foilTop,W/2+1.75,H/2-Math.min(34,H*.26));

  c.letterSpacing='0px';
  // fit using the real ink bounds so swashes of the script capitals are never cut off
  let fs=50,m;
  c.textAlign='left';
  do{c.font=`400 ${fs}px "Great Vibes", "Snell Roundhand", cursive`;m=c.measureText(config.scratch.foilTitle);fs-=2}
  while((m.actualBoundingBoxLeft+m.actualBoundingBoxRight)>W-96&&fs>24);
  c.textAlign='left';
  engrave(config.scratch.foilTitle,(W-(m.actualBoundingBoxLeft+m.actualBoundingBoxRight))/2+m.actualBoundingBoxLeft,H/2-2);
  c.textAlign='center';

  c.letterSpacing='3px';
  c.font='500 10px Montserrat, sans-serif';
  engrave(config.scratch.foilBottom,W/2+1.5,H/2+Math.min(32,H*.25));
  c.letterSpacing='0px';
  c.font='14px serif';engrave(config.scratch.ornament,W/2,H/2+Math.min(48,H*.38));
}
function point(e){const r=scratchCanvas.getBoundingClientRect(),t=e.touches?e.touches[0]:e;return{x:t.clientX-r.left,y:t.clientY-r.top}}
let lastPoint=null;
function eraseAt(p){
  const c=scratchCanvas.getContext('2d');
  c.globalCompositeOperation='destination-out';
  c.lineCap='round';c.lineJoin='round';c.lineWidth=38;
  if(lastPoint){
    c.beginPath();c.moveTo(lastPoint.x,lastPoint.y);c.lineTo(p.x,p.y);c.stroke();
  } else {
    c.beginPath();c.arc(p.x,p.y,19,0,Math.PI*2);c.fill();
  }
  // Overlap a soft circular dab to make quick finger strokes continuous.
  c.beginPath();c.arc(p.x,p.y,19,0,Math.PI*2);c.fill();
  lastPoint=p;
}
function scratch(e){
  if(!drawing)return;e.preventDefault();
  scratchStarted=true;const p=point(e);eraseAt(p);checkScratch();
}
let lastCheck=0;
function checkScratch(force){
  if(scratched)return;
  const now=performance.now();if(!force&&now-lastCheck<140)return;lastCheck=now;
  const c=scratchCanvas.getContext('2d'),d=c.getImageData(0,0,scratchCanvas.width,scratchCanvas.height).data;
  let clear=0,total=0;
  for(let i=3;i<d.length;i+=20){total++;if(d[i]<30)clear++}
  if(clear/total>.4){
    scratched=true;scratchCard.classList.add('revealed');launchConfetti();
  }
}
scratchCanvas.addEventListener('pointerdown',e=>{drawing=true;lastPoint=null;scratchCanvas.setPointerCapture(e.pointerId);scratch(e)});
scratchCanvas.addEventListener('pointermove',scratch);
scratchCanvas.addEventListener('pointerup',e=>{drawing=false;checkScratch(true);lastPoint=null;try{scratchCanvas.releasePointerCapture(e.pointerId)}catch(_){} });
scratchCanvas.addEventListener('pointercancel',()=>{drawing=false;lastPoint=null});
window.addEventListener('resize',()=>{if(!scratched&&!scratchStarted)setupScratch()});

function launchConfetti(){
  const c=confettiCanvas,x=c.getContext('2d');
  const dpr=Math.min(2,window.devicePixelRatio||1);
  c.width=innerWidth*dpr;c.height=innerHeight*dpr;x.setTransform(dpr,0,0,dpr,0,0);
  const W=innerWidth,H=innerHeight;
  const palette=['#b08a3e','#d9b86a','#f3dda0','#fff4cf','#6b1425','#9b2335','#e8a5ae','#fbeedd','#ffffff'];
  const bits=[];
  function burst(px,py,n,spread,power){
    for(let i=0;i<n;i++){
      const ang=-Math.PI/2+(Math.random()-.5)*spread,sp=Math.random()*power+power*.35;
      bits.push({x:px,y:py,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,w:Math.random()*7+4,h:Math.random()*11+5,
        rot:Math.random()*6.28,vr:(Math.random()-.5)*.4,a:1,fade:.0022+Math.random()*.002,
        sway:Math.random()*6.28,color:palette[Math.floor(Math.random()*palette.length)],shape:Math.floor(Math.random()*3)});
    }
  }
  // Big multi-point bursts, one after another
  const shots=[[.5,.5,260,2.6,20],[.08,.72,220,1.6,22],[.92,.72,220,1.6,22],[.3,.6,200,2.2,19],[.7,.6,200,2.2,19],[.5,.45,260,3.2,22]];
  shots.forEach((s,i)=>setTimeout(()=>burst(W*s[0],H*s[1],s[2],s[3],s[4]),i*380));
  // Confetti rain from the top for several seconds
  const rainEnd=performance.now()+6500;
  const rain=setInterval(()=>{
    if(performance.now()>rainEnd){clearInterval(rain);return}
    for(let i=0;i<14;i++){
      bits.push({x:Math.random()*W,y:-20,vx:(Math.random()-.5)*2,vy:Math.random()*2+1.5,w:Math.random()*7+4,h:Math.random()*11+5,
        rot:Math.random()*6.28,vr:(Math.random()-.5)*.3,a:1,fade:.0016,sway:Math.random()*6.28,
        color:palette[Math.floor(Math.random()*palette.length)],shape:Math.floor(Math.random()*3)});
    }
  },90);
  function draw(){
    x.clearRect(0,0,W,H);
    for(let i=bits.length-1;i>=0;i--){
      const b=bits[i];
      b.vx*=.992;b.vy+=.2;if(b.vy>7)b.vy=7;
      b.sway+=.06;b.x+=b.vx+Math.sin(b.sway)*.7;b.y+=b.vy;b.rot+=b.vr;b.a-=b.fade;
      if(b.a<=0||b.y>H+30){bits.splice(i,1);continue}
      x.save();x.globalAlpha=b.a;x.translate(b.x,b.y);x.rotate(b.rot);x.fillStyle=b.color;
      if(b.shape===0)x.fillRect(-b.w/2,-b.h/2,b.w,b.h);
      else if(b.shape===1){x.beginPath();x.arc(0,0,b.w*.45,0,6.283);x.fill()}
      else{x.scale(1,Math.abs(Math.sin(b.sway)));x.fillRect(-b.w/2,-b.h/2,b.w,b.h)}
      x.restore();
    }
    if(bits.length||performance.now()<rainEnd+500)requestAnimationFrame(draw);else x.clearRect(0,0,W,H);
  }
  requestAnimationFrame(draw);
}
document.getElementById('skipBtn').addEventListener('click',()=>{bgMusic.loop=config.media.loop;bgMusic.volume=config.media.volume;bgMusic.play().catch(()=>{});video.pause();showWebsite();});
scratchCanvas.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();scratched=true;scratchCard.classList.add('revealed');launchConfetti();}});
document.body.style.overflow='hidden';
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{if(!scratched)setupScratch()});

}
