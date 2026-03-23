const BADGES_DEF=[
  {id:'first',icon:'🥇',name:'პირველი სირბილი',desc:'1 სირბილი',check:runs=>runs.length>=1},
  {id:'km5',icon:'⭐',name:'5 კმ',desc:'5+ კმ ერთ სირბილში',check:runs=>runs.some(r=>r.dist>=5)},
  {id:'km10',icon:'🌟',name:'10 კმ',desc:'10+ კმ ერთ სირბილში',check:runs=>runs.some(r=>r.dist>=10)},
  {id:'runs5',icon:'🔥',name:'5 სირბილი',desc:'სულ 5 სირბილი',check:runs=>runs.length>=5},
  {id:'runs10',icon:'💪',name:'10 სირბილი',desc:'სულ 10 სირბილი',check:runs=>runs.length>=10},
  {id:'total50',icon:'🚀',name:'50 კმ',desc:'სულ 50+ კმ',check:runs=>runs.reduce((s,r)=>s+r.dist,0)>=50},
  {id:'streak3',icon:'📅',name:'3 დღე',desc:'3 დღე ზედიზედ',check:runs=>{
    const days=new Set(runs.map(r=>new Date(r.date).toDateString()));
    let s=0;const d=new Date();
    while(days.has(d.toDateString())){s++;d.setDate(d.getDate()-1);}
    return s>=3;
  }},
  {id:'pace6',icon:'⚡',name:'სწრაფი',desc:'6:00 წთ/კმ-ზე ნაკლები',check:runs=>runs.some(r=>r.pace>0&&r.pace<360)},
  {id:'early',icon:'🌅',name:'მზის ამოსვლა',desc:'6:00 საათამდე სირბილი',check:runs=>runs.some(r=>new Date(r.date).getHours()<6)},
];

function checkBadges(newRun){
  const runs=DB.runs();
  const earned=JSON.parse(localStorage.getItem('rp_badges')||'[]');
  BADGES_DEF.forEach(b=>{
    if(!earned.includes(b.id)&&b.check(runs)){
      earned.push(b.id);
      setTimeout(()=>toast(`🏆 მიღწევა: ${b.name}!`),1000);
    }
  });
  localStorage.setItem('rp_badges',JSON.stringify(earned));
}

function renderStats(){
  const runs=DB.runs();
  const td=runs.reduce((s,r)=>s+r.dist,0);
  const bd=runs.length?Math.max(...runs.map(r=>r.dist)):0;
  const bp=runs.length?Math.min(...runs.map(r=>r.pace).filter(p=>p>0)):0;
  document.getElementById('st-dist').textContent=td.toFixed(1);
  document.getElementById('st-runs').textContent=runs.length;
  document.getElementById('st-best').textContent=bd.toFixed(1);
  document.getElementById('st-pace').textContent=bp>0?fmtP(bp):'--:--';
  let streak=0;const days=new Set(runs.map(r=>new Date(r.date).toDateString()));
  const dd=new Date();while(days.has(dd.toDateString())){streak++;dd.setDate(dd.getDate()-1);}
  document.getElementById('st-streak').textContent=streak;
  // Weekly bars
  const now=new Date();
  const dn=['კვი','ორშ','სამ','ოთხ','ხუთ','პარ','შაბ'];
  const wd=Array(7).fill(0).map((_,i)=>{
    const day=new Date(now);day.setDate(now.getDate()-(6-i));
    const dist=runs.filter(r=>new Date(r.date).toDateString()===day.toDateString()).reduce((s,r)=>s+r.dist,0);
    return{dist:+dist.toFixed(2),label:dn[day.getDay()],today:i===6};
  });
  const mx=Math.max(...wd.map(d=>d.dist),1);
  document.getElementById('week-bars').innerHTML=wd.map(d=>`<div class="bar-col"><div class="bar${d.today?' today':''}" style="height:${Math.max(2,(d.dist/mx)*64)}px" title="${d.dist}კმ"></div><div class="bar-lbl">${d.label}</div></div>`).join('');
  // Goal
  const goal=parseInt(localStorage.getItem('rp_goal')||'0');
  const weekDist=wd.reduce((s,d)=>s+d.dist,0);
  document.getElementById('goal-done').textContent=weekDist.toFixed(1);
  document.getElementById('goal-target').textContent=goal||'--';
  if(goal>0){
    const pct=Math.min(100,(weekDist/goal)*100);
    document.getElementById('goal-bar').style.width=pct+'%';
    document.getElementById('goal-pct').textContent=Math.round(pct)+'%';
  }
  // Badges
  const earned=JSON.parse(localStorage.getItem('rp_badges')||'[]');
  document.getElementById('badges-grid').innerHTML=BADGES_DEF.map(b=>{
    const ok=earned.includes(b.id)||b.check(runs);
    return`<div class="badge ${ok?'earned':'locked'}"><div class="badge-icon">${b.icon}</div><div class="badge-name">${b.name}</div><div class="badge-desc">${b.desc}</div></div>`;
  }).join('');
}

function setGoal(){
  const v=parseInt(document.getElementById('goal-inp').value);
  if(!v||v<1){toast('სწორი მიზანი შეიყვანე');return;}
  localStorage.setItem('rp_goal',v);
  document.getElementById('goal-inp').value='';
  renderStats();
  toast(`🎯 მიზანი: კვირაში ${v} კმ`);
}
