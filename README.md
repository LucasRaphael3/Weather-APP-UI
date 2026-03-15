# Weather App 🌤️

A stunning, premium weather application built with Vanilla JavaScript, HTML, and CSS. The UI is heavily inspired by modern macOS/iOS glassmorphism design trends and features smooth micro-animations, dynamic sunrise/sunset tracking, and live weather data.

![Weather App Preview](/public/bg-night.png) *(Preview background)*

## ✨ Features
* **Beautiful UI**: Deep indigo gradients, glassmorphic frosted cards, parallax stars, and soft glows.
* **Live Geolocation**: Automatically asks for the user's location to immediately display their local weather.
* **OpenWeather API Integration**: 
  * Current conditions (Temperature, High/Low, Condition string)
  * Hourly Forecast (Next 24 hours in scrolling capsules)
  * 5-Day Weekly Forecast (with dynamic High/Low range bars)
  * Live Air Quality Index (AQI slider)
  * Dynamic UV Index gradient bar
  * Wind Compass (SVG rose that rotates to the precise current wind direction)
  * Sunrise/Sunset tracking arc
* **City Search**: Debounced live search to look up the weather for any given city worldwide.

## 🛠 Tech Stack
* **Vite** — Extremely fast development build tool.
* **Vanilla HTML5 & CSS3** — No CSS frameworks (like Tailwind or Bootstrap). Uses advanced CSS features like CSS Variables, `backdrop-filter: blur`, flexbox/grid, and native keyframe animations.
* **Vanilla JavaScript (ES6+)** — No React or Vue. Employs modern features like async/await, `Promise.allSettled()`, and native DOM manipulation.

## 🚀 Getting Started

### 1. Requirements
* Node.js installed

### 2. Clone and Install
```bash
git clone https://github.com/your-username/weather-app.git
cd weather-app
npm install
```

### 3. API Key setup
This project uses the free **OpenWeatherMap API**. 
1. Get a free API key at [OpenWeatherMap](https://openweathermap.org/)
2. Create a file named `.env` in the root of the project.
3. Add your API key using the Vite prefix:
```env
VITE_OPENWEATHER_API_KEY=your_api_key_here
```

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

## 📂 Project Structure
* `index.html` - The single-page application structure. Contains SVGs and ID hooks for JS.
* `style.css` - All styling, variables, resets, and keyframe animations.
* `main.js` - Application logic including DOM updates, search debounce, and component rendering.
* `api.js` - Service layer handling all fetch requests to the OpenWeather endpoints.
* `/public` - Static assets including the hero icon and background imagery.

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).
