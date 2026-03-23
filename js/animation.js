let animMap,animLine,animDot,animGhost,animSelIdx=0,animSpeed=3,animTimer;

function initAnimPage(){
  setTimeout(()=>{
    if(!animMap){
      animMap=L.map('anim-map',{zoomControl:false,attributionControl:false});
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(animMap);
      animMap.setView([41.871,41.994],14);
    }
    animMap.invalidateSize();
    buildAnimSel();
    if(DB.runs().length)loadAnimRun();
  },150);
}

function buildAnimSel(){
  const runs=DB.runs(),sel=document.getElementById('run-sel');
  if(!runs.length){sel.innerHTML='<div style="color:var(--muted);font-size:12px;padding:6px 0">სირბილი არ არის</div>';return;}
  sel.innerHTML=runs.map((r,i)=>{
    const d=new Date(r.date);
    return`<div class="sel-chip${i===animSelIdx?' active':''}" onclick="selAnimRun(${i})">${d.getDate()}.${d.getMonth()+1} — ${r.dist.toFixed(1)}კმ</div>`;
  }).join('');
}

function selAnimRun(i){
  animSelIdx=i;
  document.querySelectorAll('.sel-chip').forEach((c,j)=>c.classList.toggle('active',j===i));
  resetAnim();loadAnimRun();
}

function loadAnimRun(){
  [animLine,animDot,animGhost].forEach(l=>{if(l)animMap.removeLayer(l);});
  animLine=animDot=animGhost=null;
  const run=DB.runs()[animSelIdx];
  if(!run||!run.points||run.points.length<2)return;
  const coords=run.points.map(p=>[p.lat,p.lng]);
  animGhost=L.polyline(coords,{color:'rgba(255,255,255,0.08)',weight:4,lineCap:'round'}).addTo(animMap);
  L.circleMarker(coords[0],{radius:8,fillColor:'#f97316',fillOpacity:1,color:'#fff',weight:2}).addTo(animMap);
  L.circleMarker(coords[coords.length-1],{radius:8,fillColor:'#ff4757',fillOpacity:1,color:'#fff',weight:2}).addTo(animMap);
  animLine=L.polyline([],{color:'#f97316',weight:5,opacity:0.95,lineCap:'round'}).addTo(animMap);
  const dotIc=L.divIcon({
    html:`<div style="width:18px;height:18px;background:#fff;border-radius:50%;border:3px solid #f97316;box-shadow:0 0 14px rgba(249,115,22,1)"></div>`,
    iconSize:[18,18],iconAnchor:[9,9],className:''
  });
  animDot=L.marker(coords[0],{icon:dotIc}).addTo(animMap);
  animMap.fitBounds(animGhost.getBounds(),{padding:[50,50]});
}

function playAnim(){
  const run=DB.runs()[animSelIdx];
  if(!run||!run.points||run.points.length<2){toast('სირბილი არ არის');return;}
  resetAnim();loadAnimRun();
  const coords=run.points.map(p=>[p.lat,p.lng]);
  let idx=0;
  const interval=Math.max(10,90-animSpeed*9);
  function step(){
    if(idx>=coords.length){document.getElementById('ap-fill').style.width='100%';toast('✅ ანიმაცია დასრულდა!');return;}
    if(animLine)animLine.addLatLng(coords[idx]);
    if(animDot)animDot.setLatLng(coords[idx]);
    document.getElementById('ap-fill').style.width=((idx/coords.length)*100)+'%';
    idx++;animTimer=setTimeout(step,interval);
  }
  step();
}

function resetAnim(){
  clearTimeout(animTimer);
  document.getElementById('ap-fill').style.width='0%';
  [animLine,animDot,animGhost].forEach(l=>{if(l){animMap.removeLayer(l);}});
  animLine=animDot=animGhost=null;
  if(DB.runs().length)loadAnimRun();
}

function setSp(el,s){
  animSpeed=s;
  document.querySelectorAll('.sp').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
}
