function hav(a,b){
  const R=6371,dLat=(b[0]-a[0])*Math.PI/180,dLon=(b[1]-a[1])*Math.PI/180;
  const x=Math.sin(dLat/2)**2+Math.cos(a[0]*Math.PI/180)*Math.cos(b[0]*Math.PI/180)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
}
function fmtT(s){
  const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sc=s%60;
  if(h>0)return`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sc).padStart(2,'0')}`;
  return`${String(m).padStart(2,'0')}:${String(sc).padStart(2,'0')}`;
}
function fmtP(s){
  if(!s||!isFinite(s)||s<=0)return'--:--';
  return`${Math.floor(s/60)}:${String(Math.round(s%60)).padStart(2,'0')}`;
}
let _toastT;
function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('show');
  clearTimeout(_toastT);_toastT=setTimeout(()=>t.classList.remove('show'),3200);
}
function drawWeightChart(ws){
  const cv=document.getElementById('w-canvas');
  if(!cv)return;
  const ctx=cv.getContext('2d');
  const W=cv.offsetWidth||300,H=160;
  cv.width=W;cv.height=H;
  if(ws.length<2){return;}
  const vals=ws.map(w=>w.val);
  const mn=Math.min(...vals)-0.5,mx=Math.max(...vals)+0.5;
  const tx=i=>i/(vals.length-1)*(W-40)+20;
  const ty=v=>H-20-((v-mn)/(mx-mn))*(H-40);
  ctx.clearRect(0,0,W,H);
  // grid
  for(let i=0;i<5;i++){
    const y=20+i*(H-40)/4;
    ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);
    ctx.strokeStyle='rgba(255,255,255,0.04)';ctx.lineWidth=0.5;ctx.stroke();
    const v=(mn+(mx-mn)*(1-i/4)).toFixed(1);
    ctx.fillStyle='rgba(107,138,173,0.7)';ctx.font='10px DM Mono';ctx.textAlign='left';
    ctx.fillText(v,2,y-3);
  }
  // area
  const g=ctx.createLinearGradient(0,0,W,0);
  g.addColorStop(0,'rgba(249,115,22,0.3)');g.addColorStop(1,'rgba(0,200,255,0.3)');
  const ga=ctx.createLinearGradient(0,0,0,H);
  ga.addColorStop(0,'rgba(249,115,22,0.15)');ga.addColorStop(1,'rgba(0,200,255,0)');
  ctx.beginPath();ctx.moveTo(tx(0),ty(vals[0]));
  vals.forEach((v,i)=>{if(i)ctx.lineTo(tx(i),ty(v));});
  ctx.lineTo(tx(vals.length-1),H);ctx.lineTo(tx(0),H);ctx.closePath();
  ctx.fillStyle=ga;ctx.fill();
  // line
  ctx.beginPath();ctx.moveTo(tx(0),ty(vals[0]));
  vals.forEach((v,i)=>{if(i)ctx.lineTo(tx(i),ty(v));});
  ctx.strokeStyle=g;ctx.lineWidth=2.5;ctx.lineJoin='round';ctx.stroke();
  // dots
  vals.forEach((v,i)=>{
    const gd=ctx.createRadialGradient(tx(i),ty(v),0,tx(i),ty(v),5);
    gd.addColorStop(0,'#f97316');gd.addColorStop(1,'#00c8ff');
    ctx.beginPath();ctx.arc(tx(i),ty(v),4,0,Math.PI*2);
    ctx.fillStyle=gd;ctx.fill();
  });
}
