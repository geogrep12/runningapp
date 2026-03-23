let tracking=false,startTime,elSec=0,timerInt,watchId,trackPts=[];
let lastKmAlert=0;

function toggleRun(){tracking?stopRun():startRun();}

function startRun(){
  if(!curPos){navigator.geolocation.getCurrentPosition(p=>{curPos=[p.coords.latitude,p.coords.longitude];startRun();},()=>toast('GPS ვერ მოიძებნა'));return;}
  tracking=true;trackPts=[curPos];startTime=Date.now();elSec=0;lastKmAlert=0;
  document.getElementById('run-btn').className='btn-main-run stop';
  document.getElementById('run-btn-icon').textContent='⏹';
  document.getElementById('run-btn-text').textContent='გაჩერება';
  document.getElementById('route-overlay').style.display='none';
  if(trackLayer)mainMap.removeLayer(trackLayer);
  trackLayer=L.polyline([curPos],{color:'#00c8ff',weight:6,opacity:0.95,lineCap:'round'}).addTo(mainMap);
  timerInt=setInterval(tickRun,1000);
  watchId=navigator.geolocation.watchPosition(
    p=>{
      const np=[p.coords.latitude,p.coords.longitude];
      if(trackPts.length&&hav(trackPts[trackPts.length-1],np)<0.004)return;
      curPos=np;trackPts.push(np);placeUserDot(np);
      mainMap.panTo(np,{animate:true,duration:0.5});
      if(trackLayer)trackLayer.addLatLng(np);
    },
    err=>console.warn(err),{enableHighAccuracy:true,maximumAge:2000,timeout:10000}
  );
  toast('🏃 სირბილი დაიწყო!');
}

function tickRun(){
  elSec++;
  const d=calcDist();
  const pct=Math.min(100,(d/targetDist)*100);
  document.getElementById('r-dist').textContent=d.toFixed(2);
  document.getElementById('r-time').textContent=fmtT(elSec);
  document.getElementById('r-pace').textContent=d>0.05?fmtP(elSec/d):'--:--';
  document.getElementById('r-cal').textContent=Math.round(d*70*1.036);
  document.getElementById('prog').style.width=pct+'%';
  document.getElementById('prog-dot').style.left=pct+'%';
  // km milestone alert
  const km=Math.floor(d);
  if(km>0&&km>lastKmAlert){lastKmAlert=km;showKmPopup(km);}
  if(d>=targetDist&&d<targetDist+0.05)showKmPopup('🎉 მიზანი!',true);
}

function showKmPopup(km,isGoal=false){
  let el=document.getElementById('km-popup');
  if(!el){
    el=document.createElement('div');
    el.id='km-popup';
    el.className='km-popup';
    el.innerHTML='<div class="km-popup-icon" id="kpi"></div><div class="km-popup-text" id="kpt"></div>';
    document.body.appendChild(el);
  }
  document.getElementById('kpi').textContent=isGoal?'🏆':'🔔';
  document.getElementById('kpt').textContent=isGoal?km:`${km} კმ გავირბინე!`;
  el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'),2500);
  // Vibrate if available
  navigator.vibrate&&navigator.vibrate([200,100,200]);
}

function calcDist(){let d=0;for(let i=1;i<trackPts.length;i++)d+=hav(trackPts[i-1],trackPts[i]);return d;}

function stopRun(){
  tracking=false;clearInterval(timerInt);
  if(watchId!=null){navigator.geolocation.clearWatch(watchId);watchId=null;}
  document.getElementById('run-btn').className='btn-main-run go';
  document.getElementById('run-btn-icon').textContent='▶';
  document.getElementById('run-btn-text').textContent='სირბილის დაწყება';
  document.getElementById('route-overlay').style.display='block';
  const d=calcDist();
  if(d<0.05){toast('ძალიან მოკლე');resetRunUI();return;}
  const run={id:Date.now().toString(),date:new Date().toISOString(),dist:+d.toFixed(3),duration:elSec,pace:elSec/d,points:trackPts.map(p=>({lat:p[0],lng:p[1]})),calories:Math.round(d*70*1.036)};
  DB.saveRun(run);
  checkBadges(run);
  toast(`✅ ${d.toFixed(2)} კმ • ${fmtT(elSec)}`);
  resetRunUI();trackPts=[];
}

function resetRunUI(){
  ['r-dist','r-time','r-pace','r-cal'].forEach((id,i)=>document.getElementById(id).textContent=['0.00','00:00','--:--','0'][i]);
  document.getElementById('prog').style.width='0%';
  document.getElementById('prog-dot').style.left='0%';
}
