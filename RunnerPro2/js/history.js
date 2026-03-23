function renderHist(){
  const runs=DB.runs(),list=document.getElementById('hist-list');
  document.getElementById('hist-count').textContent=runs.length?`სულ ${runs.length} სირბილი`:'';
  if(!runs.length){
    list.innerHTML=`<div class="empty"><div class="empty-ic">🏃</div><div class="empty-txt">სირბილი ჯერ არ ჩაწერილა.<br>დაიწყე პირველი სირბილი!</div></div>`;
    return;
  }
  list.innerHTML=runs.map(r=>{
    const d=new Date(r.date);
    return`<div class="run-card">
      <div class="rc-top">
        <div class="rc-date">${d.getDate()}.${d.getMonth()+1}.${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}</div>
        <div class="rc-dist">${r.dist.toFixed(2)} კმ</div>
      </div>
      <div class="rc-meta">
        <span class="rc-m">⏱ <b>${fmtT(r.duration)}</b></span>
        <span class="rc-m">⚡ <b>${fmtP(r.pace)}/კმ</b></span>
        ${r.calories?`<span class="rc-m">🔥 <b>${r.calories} კკალ</b></span>`:''}
      </div>
      <div class="rc-actions">
        <button class="btn-anim-h" onclick="openAnimFromHist('${r.id}')">▶ ანიმაცია</button>
        <button class="btn-del" onclick="delRunCard('${r.id}')">🗑</button>
      </div>
    </div>`;
  }).join('');
}

function delRunCard(id){
  if(!confirm('სირბილი წაიშალოს?'))return;
  DB.delRun(id);renderHist();toast('წაიშალა');
}

function openAnimFromHist(id){
  goPage('anim',document.querySelectorAll('.pnb')[2]);
  setTimeout(()=>{
    const idx=DB.runs().findIndex(r=>r.id===id);
    if(idx>=0){animSelIdx=idx;buildAnimSel();loadAnimRun();setTimeout(playAnim,300);}
  },400);
}
