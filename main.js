import {
  getUserCoords,
  fetchCurrentWeather,
  fetchForecast,
  fetchAirQuality,
  fetchUVIndex,
  fetchCityWeather,
  geocodeCity,
  iconEmoji,
  fmtTime,
  fmtDateTime,
  fmtDay,
  aqiLabel,
  windDir,
} from './api.js';
let currentCoords = null;
const PRESET_CITIES = [
  'Montreal', 'São Paulo', 'New York', 'Tokyo', 'London', 'Dubai'
];
function showLoading() {
  const el = document.getElementById('loading-overlay');
  if (el) el.style.display = 'flex';
}
function hideLoading() {
  const el = document.getElementById('loading-overlay');
  if (el) el.style.display = 'none';
}
function showError(msg) {
  const el = document.getElementById('error-toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('visible');
  setTimeout(() => el.classList.remove('visible'), 4000);
}
function renderCurrentWeather(data) {
  const tz = data.timezone ?? 0;
  setText('city-name', data.name + (data.sys?.country ? `, ${data.sys.country}` : ''));
  setText('current-time', new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }));
  setText('temp-display', `${Math.round(data.main.temp)}°`);
  setText('condition-label', capitalize(data.weather[0]?.description ?? ''));
  setText('high-low',
    `H:${Math.round(data.main.temp_max)}°  L:${Math.round(data.main.temp_min)}°`
  );
  updateHeroIcon(data.weather[0]?.icon ?? '01n');
  setText('wind-value', `${Math.round(data.wind?.speed ?? 0)} m/s`);
  setText('wind-sub', `${windDir(data.wind?.deg ?? 0)} direction`);
  const sr = fmtTime(data.sys?.sunrise ?? 0, tz);
  const ss = fmtTime(data.sys?.sunset  ?? 0, tz);
  setText('sunrise-value', sr);
  setText('sunrise-sub',   `Sunset: ${ss}`);
}
function updateHeroIcon(iconCode) {
  // Empty space maintained for padding, no icon or emoji injected.
}
function renderHourlyForecast(forecastData) {
  const container = document.getElementById('hourly-list');
  if (!container || !forecastData?.list) return;
  const items = forecastData.list.slice(0, 8);
  const tz = forecastData.city?.timezone ?? 0;
  container.innerHTML = items.map((item, i) => {
    const label = i === 0 ? 'Now' : fmtTime(item.dt, tz);
    const emoji = iconEmoji(item.weather[0]?.icon);
    const temp  = `${Math.round(item.main.temp)}°`;
    return `
      <div class="h-capsule ${i === 0 ? 'active' : ''}" role="button" tabindex="0" aria-label="${label}, ${temp}">
        <span class="h-time">${label}</span>
        <span class="h-icon">${emoji}</span>
        <span class="h-temp">${temp}</span>
      </div>`;
  }).join('');
  container.querySelectorAll('.h-capsule').forEach(cap => {
    cap.addEventListener('click', () => {
      container.querySelectorAll('.h-capsule').forEach(c => c.classList.remove('active'));
      cap.classList.add('active');
    });
  });
}
function renderWeeklyForecast(forecastData) {
  const container = document.getElementById('weekly-list');
  if (!container || !forecastData?.list) return;
  const tz = forecastData.city?.timezone ?? 0;
  const days = {};
  for (const item of forecastData.list) {
    const d = new Date((item.dt + tz) * 1000);
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
    if (!days[key]) days[key] = [];
    days[key].push(item);
  }
  const dayEntries = Object.values(days).slice(0, 7).map(entries => {
    const noon = entries.reduce((prev, cur) => {
      const d = new Date((cur.dt + tz) * 1000);
      return Math.abs(d.getUTCHours() - 12) < Math.abs(new Date((prev.dt + tz) * 1000).getUTCHours() - 12) ? cur : prev;
    });
    return {
      label: fmtDay(noon.dt, tz),
      icon:  iconEmoji(noon.weather[0]?.icon),
      low:   Math.round(Math.min(...entries.map(e => e.main.temp_min))),
      high:  Math.round(Math.max(...entries.map(e => e.main.temp_max))),
    };
  });
  const allLow  = Math.min(...dayEntries.map(d => d.low));
  const allHigh = Math.max(...dayEntries.map(d => d.high));
  const range   = allHigh - allLow || 1;
  container.innerHTML = dayEntries.map(({ label, icon, low, high }) => {
    const fillPct   = Math.round(((high - allLow) / range) * 70);
    const offsetPct = Math.round(((low  - allLow) / range) * 20);
    return `
      <div class="w-row">
        <span class="w-day">${label}</span>
        <span class="w-icon">${icon}</span>
        <div class="temp-bar-wrap">
          <span class="t-low">${low}°</span>
          <div class="bar-track">
            <div class="bar-fill" style="width:${fillPct}%;margin-left:${offsetPct}%"></div>
          </div>
          <span class="t-high">${high}°</span>
        </div>
      </div>`;
  }).join('');
}
function renderAirQuality(aqData) {
  const aqi   = aqData?.list?.[0]?.main?.aqi ?? 1;
  const label = aqiLabel(aqi);
  const pct   = ((aqi - 1) / 4) * 90 + 5;
  setText('aq-index-text', `${aqi} — ${label} Health Risk`);
  setText('aq-badge-text', label);
  const thumb = document.getElementById('aq-thumb');
  if (thumb) thumb.style.left = `${pct}%`;
}
function compassSVG(deg, speedKph) {
  const ticks = Array.from({ length: 36 }, (_, i) => {
    const a = (i * 10 - 90) * Math.PI / 180;
    const isMajor = i % 9 === 0;
    const r1 = isMajor ? 40 : 46;
    const r2 = 52;
    const x1 = (60 + r1 * Math.cos(a)).toFixed(1);
    const y1 = (60 + r1 * Math.sin(a)).toFixed(1);
    const x2 = (60 + r2 * Math.cos(a)).toFixed(1);
    const y2 = (60 + r2 * Math.sin(a)).toFixed(1);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(255,255,255,${isMajor ? 0.5 : 0.15})" stroke-width="${isMajor ? 1.5 : 0.8}"/>`;
  }).join('');
  return `
  <svg class="compass-svg" viewBox="0 0 120 120" aria-label="Wind compass">
    <circle cx="60" cy="60" r="53" fill="rgba(0,0,0,0.25)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
    ${ticks}
    <text x="60" y="13" text-anchor="middle" font-size="10" fill="white" font-weight="700" font-family="Inter,sans-serif">N</text>
    <text x="109" y="64" text-anchor="middle" font-size="10" fill="rgba(255,255,255,0.5)" font-family="Inter,sans-serif">E</text>
    <text x="60" y="113" text-anchor="middle" font-size="10" fill="rgba(255,255,255,0.5)" font-family="Inter,sans-serif">S</text>
    <text x="11" y="64" text-anchor="middle" font-size="10" fill="rgba(255,255,255,0.5)" font-family="Inter,sans-serif">W</text>
    <g transform="rotate(${deg}, 60, 60)">
      <polygon points="60,14 63.5,52 60,48 56.5,52" fill="white"/>
      <polygon points="60,106 63.5,68 60,72 56.5,68" fill="rgba(255,255,255,0.25)"/>
    </g>
    <circle cx="60" cy="60" r="19" fill="rgba(20,18,50,0.85)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
    <text x="60" y="57" text-anchor="middle" font-size="10" fill="white" font-weight="600" font-family="Inter,sans-serif">${speedKph}</text>
    <text x="60" y="68" text-anchor="middle" font-size="7.5" fill="rgba(255,255,255,0.55)" font-family="Inter,sans-serif">km/h</text>
  </svg>`;
}
function renderInfoGrid(currentData, aqData, uvData, forecastData) {
  const tz = currentData.timezone ?? 0;
  const sr = fmtTime(currentData.sys?.sunrise ?? 0, tz);
  const ss = fmtTime(currentData.sys?.sunset  ?? 0, tz);
  const uvRaw     = uvData?.value;
  const uv        = typeof uvRaw === 'number' ? Math.round(uvRaw * 10) / 10 : null;
  const uvDisplay = uv !== null ? String(Math.round(uv)) : '—';
  const uvLabel   = uv === null ? '—'
                  : uv <= 2    ? 'Low'
                  : uv <= 5    ? 'Moderate'
                  : uv <= 7    ? 'High'
                  : uv <= 10   ? 'Very High'
                  :              'Extreme';
  const uvPct = uv !== null ? Math.min((uv / 11) * 100, 100).toFixed(1) : 0;
  const nowUnix = Math.floor(Date.now() / 1000);
  const srUnix  = currentData.sys?.sunrise ?? 0;
  const ssUnix  = currentData.sys?.sunset  ?? 0;
  const dayLen  = ssUnix - srUnix || 1;
  const sunPct  = Math.max(0, Math.min(1, (nowUnix - srUnix) / dayLen));
  const arcFill = (sunPct * 145).toFixed(1);
  const arcAngle = Math.PI - sunPct * Math.PI;
  const sunX = (60 + 40 * Math.cos(arcAngle)).toFixed(1);
  const sunY = (46 - 36 * Math.sin(arcAngle)).toFixed(1);
  const windMs    = currentData.wind?.speed ?? 0;
  const windKph   = (windMs * 3.6).toFixed(1);
  const windDeg   = currentData.wind?.deg ?? 0;
  const rainNow = ((currentData.rain?.['1h'] ?? currentData.rain?.['3h']) ?? 0).toFixed(1);
  let rain24h = 0;
  if (forecastData?.list) {
    forecastData.list.slice(0, 8).forEach(item => { rain24h += (item.rain?.['3h'] ?? 0); });
  }
  const container = document.getElementById('info-grid');
  if (!container) return;
  container.innerHTML = `
    <!-- Sunrise -->
    <div class="info-tile tile-sunrise">
      <div class="tile-header"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> SUNRISE</div>
      <div class="tile-value">${sr}</div>
      <svg class="arc-svg" viewBox="0 0 120 55" fill="none">
        <defs>
          <linearGradient id="arcG" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FFD060"/>
            <stop offset="100%" stop-color="#FF6B6B"/>
          </linearGradient>
          <filter id="sunGlow"><feGaussianBlur stdDeviation="2" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
        </defs>
        <!-- baseline -->
        <line x1="8" y1="50" x2="112" y2="50" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
        <!-- full arc (dim) -->
        <path d="M8 50 Q60 6 112 50" stroke="rgba(255,255,255,0.12)" stroke-width="2" fill="none"/>
        <!-- filled arc (progress) -->
        <path d="M8 50 Q60 6 112 50" stroke="url(#arcG)" stroke-width="2" fill="none"
              stroke-dasharray="${arcFill} 200" stroke-dashoffset="0"/>
        <!-- sun dot -->
        <circle cx="${sunX}" cy="${sunY}" r="4.5" fill="white" filter="url(#sunGlow)"/>
        <circle cx="${sunX}" cy="${sunY}" r="2" fill="#FFD060"/>
      </svg>
      <div class="tile-sub">Sunset: ${ss}</div>
    </div>
    <!-- UV Index -->
    <div class="info-tile tile-uv">
      <div class="tile-header">☀️ UV INDEX</div>
      <div class="tile-value">${uvDisplay}</div>
      <div class="tile-sublabel">${uvLabel}</div>
      <div class="uv-bar-wrap">
        <div class="uv-bar-track">
          <div class="uv-dot" style="left:${uvPct}%"></div>
        </div>
      </div>
    </div>
    <!-- Rainfall -->
    <div class="info-tile tile-rain">
      <div class="tile-header">💧 RAINFALL</div>
      <div class="tile-value">${rainNow} mm</div>
      <div class="tile-sub">in last hour</div>
      <div class="tile-sub2">${rain24h.toFixed(1)} mm expected in<br>next 24h.</div>
    </div>
    <!-- Wind -->
    <div class="info-tile tile-wind">
      <div class="tile-header">💨 WIND</div>
      ${compassSVG(windDeg, windKph)}
    </div>
  `;
}
async function renderCityList(cities = PRESET_CITIES) {
  const container = document.getElementById('city-list');
  if (!container) return;
  container.innerHTML = cities.map(() => `
    <div class="city-card skeleton" style="background: rgba(40,38,80,0.6); min-height: 120px; border-radius: 28px;">
      <div class="skeleton-shimmer"></div>
    </div>`).join('');
  const results = await Promise.allSettled(cities.map(c => fetchCityWeather(c)));
  const cards = results.map((res, i) => {
    if (res.status === 'rejected') return null;
    const d = res.value;
    const emoji = iconEmoji(d.weather[0]?.icon ?? '01d');
    const gradient = weatherGradient(d.weather[0]?.id ?? 800, d.weather[0]?.icon ?? '01d');
    const tz = d.timezone ?? 0;
    return `
      <div class="city-card" data-city="${encodeURIComponent(d.name)}"
           style="background: ${gradient};"
           role="button" tabindex="0"
           aria-label="${d.name}, ${Math.round(d.main.temp)}°, ${d.weather[0]?.description}">
        <div class="city-card-info">
          <div class="city-card-name">${d.name}</div>
          <div class="city-card-time">${fmtDateTime(d.dt, tz)}</div>
          <div class="city-card-desc">${capitalize(d.weather[0]?.description ?? '')}</div>
        </div>
        <div class="city-card-temp">${Math.round(d.main.temp)}°</div>
        <div class="city-card-icon">${emoji}</div>
      </div>`;
  }).filter(Boolean);
  container.innerHTML = cards.join('');
  container.querySelectorAll('.city-card').forEach(card => {
    card.addEventListener('click', async () => {
      const cityName = decodeURIComponent(card.dataset.city);
      navigateTo('home');
      await loadWeatherForCity(cityName);
    });
  });
}
function weatherGradient(id, icon) {
  const n = icon.endsWith('n');
  if (id >= 200 && id < 300) return 'linear-gradient(135deg,#1a1a3c,#3c2a6e)';
  if (id >= 300 && id < 600) return 'linear-gradient(135deg,#1A3A5C,#2B7AB5)';
  if (id >= 600 && id < 700) return 'linear-gradient(135deg,#2c3e50,#4ca1af)';
  if (id >= 700 && id < 800) return 'linear-gradient(135deg,#3a3a4a,#7a7a8a)';
  if (id === 800) return n ? 'linear-gradient(135deg,#1A1A2E,#16213E)' : 'linear-gradient(135deg,#F4A261,#E76F51)';
  return n ? 'linear-gradient(135deg,#252545,#3C4470)' : 'linear-gradient(135deg,#4a6fa5,#6a9fd8)';
}
async function loadWeatherForCity(cityName) {
  showLoading();
  try {
    const geo = await geocodeCity(cityName);
    if (!geo.length) throw new Error(`City "${cityName}" not found`);
    const { lat, lon } = geo[0];
    await loadWeatherForCoords(lat, lon);
  } catch (err) {
    showError(err.message);
  } finally {
    hideLoading();
  }
}
async function loadWeatherForCoords(lat, lon) {
  currentCoords = { lat, lon };
  showLoading();
  try {
    const [current, forecast, aqi, uv] = await Promise.all([
      fetchCurrentWeather(lat, lon),
      fetchForecast(lat, lon),
      fetchAirQuality(lat, lon),
      fetchUVIndex(lat, lon).catch(() => null),
    ]);
    renderCurrentWeather(current);
    renderHourlyForecast(forecast);
    renderWeeklyForecast(forecast);
    renderAirQuality(aqi);
    renderInfoGrid(current, aqi, uv, forecast);
  } catch (err) {
    showError('Failed to load weather: ' + err.message);
  } finally {
    hideLoading();
  }
}
function navigateTo(screenName) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const screen = document.getElementById(`screen-${screenName}`);
  const nav    = document.getElementById(`nav-${screenName}`);
  if (screen) screen.classList.add('active');
  if (nav)    nav.classList.add('active');
}
function initTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const panelId = tab.getAttribute('aria-controls');
      document.querySelectorAll('.tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      document.getElementById(panelId)?.classList.add('active');
    });
  });
}
function initSearch() {
  const input = document.getElementById('city-search');
  if (!input) return;
  let timer = null;
  let currentQuery = '';
  input.addEventListener('input', async (e) => {
    const query = e.target.value.trim();
    currentQuery = query;
    clearTimeout(timer);
    if (query.length < 2) {
      renderCityList(PRESET_CITIES);
      return;
    }
    timer = setTimeout(async () => {
      const container = document.getElementById('city-list');
      if (!container) return;
      container.innerHTML = `<div class="search-loading">🔍 Searching for "${query}"...</div>`;
      try {
        const geoResults = await geocodeCity(query);
        if (!geoResults.length) {
          container.innerHTML = `<div class="search-loading">No cities found for "${query}"</div>`;
          return;
        }
        if (query !== currentQuery) return;
        const cityNames = [...new Set(geoResults.map(r => r.name))].slice(0, 5);
        await renderCityList(cityNames);
      } catch (err) {
        container.innerHTML = `<div class="search-loading">Error: ${err.message}</div>`;
      }
    }, 500);
  });
}
function initNav() {
  document.getElementById('nav-home')?.addEventListener('click', () => navigateTo('home'));
  document.getElementById('nav-list')?.addEventListener('click', async () => {
    navigateTo('list');
    await renderCityList(PRESET_CITIES);
  });
  document.getElementById('nav-fab')?.addEventListener('click', async () => {
    navigateTo('list');
    await renderCityList(PRESET_CITIES);
  });
  document.getElementById('nav-home')?.classList.add('active');
}
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
document.addEventListener('DOMContentLoaded', async () => {
  initTabs();
  initSearch();
  initNav();
  showLoading();
  try {
    const coords = await getUserCoords();
    await loadWeatherForCoords(coords.lat, coords.lon);
  } catch (err) {
    console.warn('Geolocation failed, falling back to Montreal:', err.message);
    showError('Location unavailable — showing Montreal');
    await loadWeatherForCoords(45.5017, -73.5673);
  }
});
