const ORS_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6Ijk2N2I1OWZjYTAyYzRkODU4NmM1M2VmNGFmNGY3YjhjIiwiaCI6Im11cm11cjY0In0=';

const DB = {
  runs(){ return JSON.parse(localStorage.getItem('rp_runs')||'[]'); },
  saveRun(r){ const a=this.runs(); a.unshift(r); localStorage.setItem('rp_runs',JSON.stringify(a)); },
  delRun(id){ localStorage.setItem('rp_runs',JSON.stringify(this.runs().filter(r=>r.id!==id))); },
  weights(){ return JSON.parse(localStorage.getItem('rp_w')||'[]'); },
  saveW(w){ const a=this.weights(); a.push(w); localStorage.setItem('rp_w',JSON.stringify(a)); },
  delW(id){ localStorage.setItem('rp_w',JSON.stringify(this.weights().filter(w=>w.id!==id))); },
};
