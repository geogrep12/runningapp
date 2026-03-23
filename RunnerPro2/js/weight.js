function addWeight(){
  const v=parseFloat(document.getElementById('w-inp').value);
  if(!v||v<30||v>300){toast('სწორი წონა შეიყვანე (30–300)');return;}
  DB.saveW({id:Date.now().toString(),date:new Date().toISOString(),val:v});
  document.getElementById('w-inp').value='';
  renderWeight();toast('✅ წონა შენახულია');
}

function renderWeight(){
  const ws=DB.weights();
  if(ws.length){
    const last=ws[ws.length-1].val;
    document.getElementById('w-cur').textContent=last.toFixed(1);
    if(ws.length>1){
      const diff=+(last-ws[0].val).toFixed(1);
      const el=document.getElementById('w-diff');
      el.textContent=(diff>0?'▲ +':diff<0?'▼ ':'')+diff+' კგ საწყისიდან';
      el.className='w-diff '+(diff<0?'down':diff>0?'up':'');
    }
  } else {
    document.getElementById('w-cur').textContent='--';
    document.getElementById('w-diff').textContent='';
  }
  setTimeout(()=>drawWeightChart(ws),50);
  const log=document.getElementById('w-log-list');
  if(!ws.length){log.innerHTML='<div style="color:var(--muted);font-size:12px;padding:6px 0">ჩანაწერი არ არის</div>';return;}
  log.innerHTML=[...ws].reverse().slice(0,20).map(w=>{
    const d=new Date(w.date);
    return`<div class="w-entry"><span class="w-entry-date">${d.getDate()}.${d.getMonth()+1}.${d.getFullYear()}</span><span class="w-entry-val">${w.val.toFixed(1)} კგ</span><button class="btn-wdel" onclick="delW('${w.id}')">✕</button></div>`;
  }).join('');
}

function delW(id){DB.delW(id);renderWeight();}
