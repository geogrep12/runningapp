async function loadWeather(lat, lng) {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weathercode,windspeed_10m,relativehumidity_2m&timezone=auto`
    );
    const data = await res.json();
    const c = data.current;
    const temp = Math.round(c.temperature_2m);
    const wind = Math.round(c.windspeed_10m);
    const hum = c.relativehumidity_2m;
    const icon = weatherIcon(c.weathercode);
    const feel = runningFeel(temp, c.weathercode);

    document.getElementById('ws-inner').innerHTML = `
      <span style="font-size:18px">${icon}</span>
      <span class="ws-temp">${temp}°C</span>
      <span class="ws-desc">${feel}</span>
      <span class="ws-extra">💨 ${wind}კმ/სთ · 💧 ${hum}%</span>
    `;
  } catch (e) {
    document.getElementById('ws-inner').innerHTML = `<span style="color:var(--muted);font-size:11px">ამინდი ხელმიუწვდომელია</span>`;
  }
}

function weatherIcon(code) {
  if (code === 0) return '☀️';
  if (code <= 2) return '⛅';
  if (code <= 48) return '☁️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦️';
  return '⛈️';
}

function runningFeel(temp, code) {
  if (code >= 61) return 'წვიმს — ფრთხილად';
  if (code >= 80) return 'ძლიერი წვიმა';
  if (temp < 0) return 'ძალიან ცივა';
  if (temp < 8) return 'ცივა — ჩაიცვი';
  if (temp < 15) return 'კარგი ამინდი';
  if (temp < 22) return 'იდეალური სირბილი ✓';
  if (temp < 28) return 'თბილა';
  return 'ძალიან ცხელა — წყალი';
}
