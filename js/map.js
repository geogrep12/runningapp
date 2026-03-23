let mainMap, userMark, routeLayer, trackLayer, curPos;
let targetDist = 5;
let overlayOpen = true;
let selectedRouteCoords = null;
let routeLayers = [];

function initMap() {
  mainMap = L.map('map', { zoomControl: false, attributionControl: false });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(mainMap);
  mainMap.setView([41.871, 41.994], 14);
  navigator.geolocation && navigator.geolocation.getCurrentPosition(
    p => { curPos=[p.coords.latitude,p.coords.longitude]; mainMap.setView(curPos,16); placeUserDot(curPos); loadWeather(curPos[0],curPos[1]); },
    () => loadWeather(41.871,41.994)
  );
}

function placeUserDot(ll) {
  const ic = L.divIcon({ html:`<div style="width:18px;height:18px;background:#f97316;border-radius:50%;border:3px solid white;box-shadow:0 0 0 6px rgba(249,115,22,0.2)"></div>`, iconSize:[18,18], iconAnchor:[9,9], className:'' });
  if (userMark) userMark.setLatLng(ll);
  else userMark = L.marker(ll,{icon:ic,zIndexOffset:1000}).addTo(mainMap);
}

function toggleOverlay() {
  overlayOpen=!overlayOpen;
  document.getElementById('overlay-body').style.display=overlayOpen?'block':'none';
  document.getElementById('collapse-btn').classList.toggle('up',overlayOpen);
}

function selDist(el,d) {
  document.querySelectorAll('.dc').forEach(c=>c.classList.remove('active'));
  el.classList.add('active'); targetDist=d;
  document.getElementById('custom-wrap').style.display='none';
}

function openCustom() {
  document.querySelectorAll('.dc').forEach(c=>c.classList.remove('active'));
  document.querySelector('.dc.custom').classList.add('active');
  document.getElementById('custom-wrap').style.display='block';
  document.getElementById('custom-inp').focus();
  document.getElementById('custom-inp').oninput=function(){const v=parseFloat(this.value);if(v>=1&&v<=50)targetDist=v;};
}

function buildWaypoints(center,km,variant) {
  const R=(km*1000)/(2*Math.PI);
  const configs=[
    {pts:5,offset:0,jitter:0.08},
    {pts:6,offset:Math.PI/5,jitter:0.22},
    {pts:4,offset:Math.PI/2.5,jitter:0.14},
  ];
  const cfg=configs[variant];
  const wps=[[center[1],center[0]]];
  for(let i=1;i<=cfg.pts;i++){
    const a=cfg.offset+(i/cfg.pts)*2*Math.PI;
    const j=0.88+Math.random()*cfg.jitter*2;
    const r=R*j;
    const lat=center[0]+(r/111320)*Math.sin(a);
    const lng=center[1]+(r/(111320*Math.cos(center[0]*Math.PI/180)))*Math.cos(a);
    wps.push([lng,lat]);
  }
  wps.push([center[1],center[0]]);
  return wps;
}

async function fetchORS(waypoints) {
  const res=await fetch('https://api.openrouteservice.org/v2/directions/foot-walking/geojson',{
    method:'POST',
    headers:{'Authorization':ORS_KEY,'Content-Type':'application/json','Accept':'application/json'},
    body:JSON.stringify({coordinates:waypoints}),
  });
  if(!res.ok)throw new Error('ORS '+res.status);
  return res.json();
}

const V_META=[
  {icon:'🌿',name:'მარშრუტი A',diff:'easy',diffL:'მარტივი'},
  {icon:'🏙',name:'მარშრუტი B',diff:'medium',diffL:'საშუალო'},
  {icon:'⛰',name:'მარშრუტი C',diff:'hard',diffL:'სხვა მიმართულება'},
];
const R_COLORS=['#00e5a0','#f97316','#00b8ff'];

async function findRoutes() {
  if(!curPos){
    toast('📍 GPS ველოდებით...');
    navigator.geolocation.getCurrentPosition(p=>{curPos=[p.coords.latitude,p.coords.longitude];mainMap.setView(curPos,16);placeUserDot(curPos);findRoutes();},()=>toast('⚠️ GPS ვერ მოიძებნა'));
    return;
  }
  const btn=document.getElementById('btn-route');
  btn.disabled=true;
  btn.innerHTML='<div class="loading-row"><div class="spin"></div>3 მარშრუტი...</div>';
  document.getElementById('route-variants').style.display='none';
  routeLayers.forEach(l=>mainMap.removeLayer(l)); routeLayers=[];
  if(routeLayer){mainMap.removeLayer(routeLayer);routeLayer=null;}
  selectedRouteCoords=null;
  const results=[];
  for(let i=0;i<3;i++){
    try{
      const wps=buildWaypoints(curPos,targetDist,i);
      const data=await fetchORS(wps);
      const feat=data.features[0];
      const coords=feat.geometry.coordinates.map(c=>[c[1],c[0]]);
      const dist=(feat.properties.summary.distance/1000).toFixed(2);
      const dur=Math.round(feat.properties.summary.duration/60);
      results.push({coords,dist,dur,idx:i});
    }catch(e){console.warn('route'+i,e);}
  }
  if(!results.length){toast('❌ მარშრუტი ვერ მოიძებნა');btn.disabled=false;btn.innerHTML='<span class="btn-icon">📍</span> 3 მარშრუტის პოვნა';return;}
  results.forEach((r,i)=>{
    const l=L.polyline(r.coords,{color:R_COLORS[i],weight:4,opacity:0.35,lineCap:'round'}).addTo(mainMap);
    routeLayers.push(l);
  });
  const all=results.flatMap(r=>r.coords);
  mainMap.fitBounds(L.polyline(all).getBounds(),{padding:[60,60]});
  window._routeResults=results;
  document.getElementById('rv-list').innerHTML=results.map((r,i)=>{
    const m=V_META[i];
    return`<div class="rv-card" id="rv-${i}" onclick="selectRoute(${i})">
      <div class="rv-icon">${m.icon}</div>
      <div class="rv-info"><div class="rv-name">${m.name}</div><div class="rv-meta"><b>${r.dist} კმ</b> · ⏱ ~${r.dur} წთ</div></div>
      <div class="rv-badge ${m.diff}">${m.diffL}</div>
    </div>`;
  }).join('');
  document.getElementById('route-variants').style.display='block';
  document.getElementById('route-status').textContent='3 მარშრუტი ნაპოვნია';
  btn.disabled=false; btn.innerHTML='<span class="btn-icon">🔄</span> განახლება';
  toast('✅ 3 მარშრუტი — აირჩიე!');
}

function selectRoute(i) {
  document.querySelectorAll('.rv-card').forEach((c,j)=>c.classList.toggle('selected',j===i));
  routeLayers.forEach((l,j)=>l.setStyle({opacity:j===i?1:0.12,weight:j===i?6:3}));
  const r=window._routeResults[i];
  selectedRouteCoords=r.coords;
  mainMap.fitBounds(L.polyline(r.coords).getBounds(),{padding:[60,60]});
  const startIc=L.divIcon({html:`<div style="background:white;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:13px;box-shadow:0 2px 8px rgba(0,0,0,0.5);border:2px solid ${R_COLORS[i]}">🏁</div>`,iconSize:[22,22],iconAnchor:[11,11],className:''});
  if(window._startMark)mainMap.removeLayer(window._startMark);
  window._startMark=L.marker(r.coords[0],{icon:startIc}).addTo(mainMap);
  document.getElementById('route-status').textContent=`${V_META[i].name} — ${r.dist} კმ`;
  toast(`✓ ${V_META[i].name} არჩეულია!`);
}
