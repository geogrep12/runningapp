function goPage(id, btn) {
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  document.querySelectorAll('.pnb').forEach(b => b.classList.remove('active'));
  document.getElementById('pg-' + id).style.display = 'flex';
  btn.classList.add('active');
  switch(id) {
    case 'run': setTimeout(() => mainMap && mainMap.invalidateSize(), 100); break;
    case 'hist': renderHist(); break;
    case 'anim': initAnimPage(); break;
    case 'weight': renderWeight(); break;
    case 'stats': renderStats(); break;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Splash → main
  setTimeout(() => {
    const splash = document.getElementById('splash');
    splash.style.transition = 'opacity 0.6s';
    splash.style.opacity = '0';
    setTimeout(() => {
      splash.style.display = 'none';
      document.getElementById('pg-run').style.display = 'flex';
      initMap();
    }, 600);
  }, 2000);

  // Weight enter key
  const wi = document.getElementById('w-inp');
  if (wi) wi.addEventListener('keydown', e => { if (e.key === 'Enter') addWeight(); });
});
