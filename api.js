const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE    = 'https://api.openweathermap.org/data/2.5';
const GEO    = 'https://api.openweathermap.org/geo/1.0';
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}
export function iconEmoji(iconCode = '') {
  const map = {
    '01d': '☀️',  '01n': '🌙',
    '02d': '⛅',  '02n': '🌤️',
    '03d': '☁️',  '03n': '☁️',
    '04d': '☁️',  '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️',  '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️',
  };
  return map[iconCode] ?? '🌡️';
}
export function fmtTime(unix, tz = 0) {
  const d = new Date((unix + tz) * 1000);
  return d.toUTCString().slice(17, 22).replace(/^0/, '')
    .replace(/(\d+):(\d+)/, (_, h, m) => {
      const hh = +h;
      const ampm = hh >= 12 ? 'PM' : 'AM';
      return `${hh % 12 || 12}:${m} ${ampm}`;
    });
}
export function fmtDateTime(unix, tz = 0) {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const d = new Date((unix + tz) * 1000);
  const day = days[d.getUTCDay()];
  return `${day}, ${fmtTime(unix, tz)}`;
}
export function fmtDay(unix, tz = 0) {
  const now = new Date();
  const d   = new Date((unix + tz) * 1000);
  const todayUTC = now.getUTCDate();
  const dUTC     = d.getUTCDate();
  if (dUTC === todayUTC) return 'Today';
  return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getUTCDay()];
}
export function aqiLabel(aqi) {
  return ['','Good','Fair','Moderate','Poor','Very Poor'][aqi] ?? 'N/A';
}
export function windDir(deg) {
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(deg / 45) % 8];
}
export function getUserCoords() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lon: coords.longitude }),
      (err) => reject(err),
      { timeout: 10_000 }
    );
  });
}
export async function fetchCurrentWeather(lat, lon) {
  return fetchJSON(`${BASE}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
}
export async function fetchForecast(lat, lon) {
  return fetchJSON(`${BASE}/forecast?lat=${lat}&lon=${lon}&units=metric&cnt=40&appid=${API_KEY}`);
}
export async function fetchAirQuality(lat, lon) {
  return fetchJSON(`${BASE}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
}
export async function fetchUVIndex(lat, lon) {
  return fetchJSON(`${BASE}/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
}
export async function fetchCityWeather(cityName) {
  return fetchJSON(`${BASE}/weather?q=${encodeURIComponent(cityName)}&units=metric&appid=${API_KEY}`);
}
export async function geocodeCity(cityName) {
  const results = await fetchJSON(`${GEO}/direct?q=${encodeURIComponent(cityName)}&limit=5&appid=${API_KEY}`);
  return results;
}
