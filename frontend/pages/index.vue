<template>
  <div class="page" :class="themeClass">
    <!-- Ambient background layers -->
    <div class="bg-glow" />
    <div class="bg-noise" />

    <!-- Rain effect -->
    <div v-if="isRainy" class="rain-container" aria-hidden="true">
      <span v-for="i in 24" :key="i" class="raindrop" :style="raindropStyle(i)" />
    </div>

    <!-- Snowflake effect -->
    <div v-if="isSnowy" class="snow-container" aria-hidden="true">
      <span v-for="i in 18" :key="i" class="snowflake" :style="snowflakeStyle(i)">❄</span>
    </div>

    <!-- Navigation -->
    <nav class="nav">
      <div class="nav-brand">
        <span class="brand-trend">TREND</span>
        <span class="brand-sep">·</span>
        <span class="brand-board">BOARD</span>
      </div>
      <NuxtLink to="/favoritos" class="nav-favs">
        <span class="fav-icon">♡</span>
        <span>Mis Favoritos</span>
      </NuxtLink>
    </nav>

    <!-- Main content -->
    <main class="main">

      <!-- Hero headline -->
      <div class="hero">
        <p class="hero-eyebrow">CLIMA · ESTILO · TENDENCIAS</p>
        <h1 class="hero-title">
          Tu look perfecto<br />
          <em>según el clima</em>
        </h1>
        <p class="hero-sub">Ingresa tu ciudad y descubre el outfit ideal para hoy</p>
      </div>

      <!-- Search -->
      <form class="search-form" @submit.prevent="fetchWeather">
        <div class="search-box">
          <span class="search-icon">◎</span>
          <input
            v-model="cityInput"
            class="search-input"
            type="text"
            placeholder="Barcelona, Bogotá, Nueva York..."
            autocomplete="off"
            :disabled="loading"
            @keyup.enter="fetchWeather"
          />
          <button class="search-btn" type="submit" :disabled="loading || !cityInput.trim()">
            <span v-if="!loading">→</span>
            <span v-else class="spinner" />
          </button>
        </div>
        <Transition name="fade">
          <p v-if="error" class="error-msg">⚠ {{ error }}</p>
        </Transition>
      </form>

      <!-- Weather card -->
      <Transition name="rise">
        <div v-if="weatherData" class="card">

          <!-- Card top: city + temp -->
          <div class="card-header">
            <div class="card-location">
              <span class="card-weather-icon">{{ weatherIcon }}</span>
              <div class="card-location-text">
                <h2 class="card-city">{{ weatherData.city }}</h2>
                <p class="card-desc">{{ capitalize(weatherData.description) }}</p>
              </div>
            </div>
            <div class="card-temp-block">
              <span class="card-temp">{{ Math.round(weatherData.temperature) }}</span>
              <span class="card-temp-unit">°C</span>
            </div>
          </div>

          <!-- Meta row -->
          <div class="card-meta">
            <div class="meta-chip">
              <span class="meta-label">SENSACIÓN</span>
              <span class="meta-val">{{ Math.round(weatherData.feelsLike) }}°C</span>
            </div>
            <div class="meta-divider" />
            <div class="meta-chip">
              <span class="meta-label">HUMEDAD</span>
              <span class="meta-val">{{ weatherData.humidity }}%</span>
            </div>
            <div class="meta-divider" />
            <div class="meta-chip">
              <span class="meta-label">CONDICIÓN</span>
              <span class="meta-val">{{ weatherData.condition }}</span>
            </div>
          </div>

          <!-- Outfit divider -->
          <div class="section-divider">
            <span class="divider-line" />
            <span class="divider-label">✦ OUTFIT DEL DÍA ✦</span>
            <span class="divider-line" />
          </div>

          <!-- Outfit list -->
          <ul class="outfit-list">
            <li
              v-for="(item, idx) in weatherData.outfit"
              :key="idx"
              class="outfit-item"
              :style="{ animationDelay: `${idx * 60}ms` }"
            >
              <span class="outfit-bullet">{{ outfitEmoji(item) }}</span>
              <span class="outfit-text">{{ item }}</span>
            </li>
          </ul>

          <!-- Save button -->
          <button
            class="save-btn"
            :class="{ 'save-btn--saved': justSaved }"
            @click="saveToFavorites"
          >
            <Transition name="fade" mode="out-in">
              <span v-if="justSaved" key="saved">✓ &nbsp;Guardado en favoritos</span>
              <span v-else key="save">♡ &nbsp;Guardar outfit</span>
            </Transition>
          </button>

        </div>
      </Transition>

    </main>

    <!-- Footer -->
    <footer class="footer">
      <span>Powered by OpenWeatherMap · {{ currentYear }}</span>
    </footer>
  </div>
</template>

<script setup>
import { useFavoritos } from '~/composables/useFavoritos'

const cityInput = ref('')
const weatherData = ref(null)
const loading = ref(false)
const error = ref('')
const justSaved = ref(false)

const { addFavorito } = useFavoritos()

const currentYear = new Date().getFullYear()

const fetchWeather = async () => {
  const city = cityInput.value.trim()
  if (!city) return
  loading.value = true
  error.value = ''
  weatherData.value = null

  try {
    const data = await $fetch(
      `https://trend-board-production.up.railway.app/weather?city=${encodeURIComponent(city)}`
    )
    weatherData.value = data
  } catch (err) {
    const msg = err?.data?.message
    if (msg) {
      error.value = msg
    } else if (err?.status === 404) {
      error.value = `Ciudad "${city}" no encontrada. Intenta con otro nombre.`
    } else {
      error.value = 'No se pudo conectar con el servidor. ¿Está corriendo el backend?'
    }
  } finally {
    loading.value = false
  }
}

const weatherIcon = computed(() => {
  if (!weatherData.value) return ''
  const map = {
    clear: '☀️',
    clouds: '☁️',
    rain: '🌧️',
    drizzle: '🌦️',
    thunderstorm: '⛈️',
    snow: '❄️',
    mist: '🌫️',
    fog: '🌫️',
    haze: '🌫️',
    smoke: '🌫️',
    dust: '🌫️',
    sand: '🌫️',
    ash: '🌫️',
    squall: '💨',
    tornado: '🌪️',
  }
  return map[weatherData.value.condition?.toLowerCase()] ?? '🌡️'
})

const themeClass = computed(() => {
  if (!weatherData.value) return 'theme-default'
  const cond = weatherData.value.condition?.toLowerCase()
  if (cond === 'clear') return 'theme-sunny'
  if (['rain', 'drizzle', 'thunderstorm'].includes(cond)) return 'theme-rainy'
  if (cond === 'clouds') return 'theme-cloudy'
  if (['snow'].includes(cond)) return 'theme-snow'
  if (weatherData.value.temperature < 10) return 'theme-cold'
  return 'theme-default'
})

const isRainy = computed(() => {
  const cond = weatherData.value?.condition?.toLowerCase()
  return ['rain', 'drizzle', 'thunderstorm'].includes(cond)
})

const isSnowy = computed(() => weatherData.value?.condition?.toLowerCase() === 'snow')

const raindropStyle = (i) => ({
  left: `${(i * 4.17) % 100}%`,
  animationDelay: `${((i * 0.27) % 1.8).toFixed(2)}s`,
  animationDuration: `${(0.7 + (i * 0.09) % 0.6).toFixed(2)}s`,
  height: `${14 + (i % 5) * 4}px`,
})

const snowflakeStyle = (i) => ({
  left: `${(i * 5.6) % 100}%`,
  animationDelay: `${((i * 0.4) % 4).toFixed(2)}s`,
  animationDuration: `${(3 + (i * 0.3) % 3).toFixed(2)}s`,
  fontSize: `${10 + (i % 4) * 4}px`,
  opacity: (0.3 + (i % 5) * 0.1).toFixed(1),
})

const outfitEmoji = (item) => {
  const t = item.toLowerCase()
  if (t.match(/zapatos|botas|tenis|sandalias|calzado/)) return '👟'
  if (t.match(/abrigo|chaqueta|impermeable|parka|sobretodo/)) return '🧥'
  if (t.match(/camiseta|top|suéter|buzo|sueter|camisa|blusa/)) return '👕'
  if (t.match(/pantalón|jean|short|shorts|falda|pantalon/)) return '👖'
  if (t.match(/bufanda|gorro|guantes|sombrero|gorra/)) return '🧣'
  if (t.match(/paraguas|lluvia/)) return '☂️'
  if (t.match(/protector|solar/)) return '🧴'
  if (t.match(/térmico|termico|termal/)) return '🌡️'
  return '✦'
}

const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''

const saveToFavorites = () => {
  if (!weatherData.value || justSaved.value) return
  addFavorito({ ...weatherData.value })
  justSaved.value = true
  setTimeout(() => { justSaved.value = false }, 2800)
}
</script>

<style scoped>
/* ─── Theme variables ─────────────────────────────────────── */
.page {
  --accent: #c9a84c;
  --accent-dim: rgba(201, 168, 76, 0.18);
  --accent-glow: rgba(201, 168, 76, 0.08);
  --bg-start: #1a1510;
  --bg-end: #080604;
  --card-bg: rgba(12, 9, 5, 0.88);
  --card-border: rgba(201, 168, 76, 0.12);
  --text-primary: #f0ece4;
  --text-secondary: #8a8070;
  --text-muted: #504840;
}

.theme-sunny {
  --accent: #f0c040;
  --accent-dim: rgba(240, 192, 64, 0.18);
  --accent-glow: rgba(240, 192, 64, 0.06);
  --bg-start: #2a1c08;
  --bg-end: #0e0905;
}

.theme-rainy {
  --accent: #7eb8d4;
  --accent-dim: rgba(126, 184, 212, 0.15);
  --accent-glow: rgba(126, 184, 212, 0.06);
  --bg-start: #0c1828;
  --bg-end: #060c18;
}

.theme-cloudy {
  --accent: #9ab0c0;
  --accent-dim: rgba(154, 176, 192, 0.15);
  --accent-glow: rgba(154, 176, 192, 0.05);
  --bg-start: #161c24;
  --bg-end: #080c10;
}

.theme-snow {
  --accent: #b8d4f0;
  --accent-dim: rgba(184, 212, 240, 0.15);
  --accent-glow: rgba(184, 212, 240, 0.06);
  --bg-start: #0e1428;
  --bg-end: #060810;
}

.theme-cold {
  --accent: #8899cc;
  --accent-dim: rgba(136, 153, 204, 0.15);
  --accent-glow: rgba(136, 153, 204, 0.06);
  --bg-start: #0c1020;
  --bg-end: #06080e;
}

/* ─── Page shell ──────────────────────────────────────────── */
.page {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background: radial-gradient(ellipse at 30% 0%, var(--bg-start) 0%, var(--bg-end) 70%);
  transition: background 1s ease, --accent 1s ease;
  display: flex;
  flex-direction: column;
}

.bg-glow {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 60% 40% at 50% -10%, var(--accent-glow), transparent 70%);
  z-index: 0;
  transition: background 1s ease;
}

.bg-noise {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 180px;
}

/* ─── Weather effects ─────────────────────────────────────── */
.rain-container,
.snow-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.raindrop {
  position: absolute;
  top: -20px;
  width: 1.5px;
  background: linear-gradient(to bottom, transparent, var(--accent));
  opacity: 0.25;
  border-radius: 2px;
  animation: rain linear infinite;
}

@keyframes rain {
  to { transform: translateY(110vh) translateX(-8px); }
}

.snowflake {
  position: absolute;
  top: -30px;
  color: var(--accent);
  animation: snow linear infinite;
}

@keyframes snow {
  to { transform: translateY(110vh) translateX(20px); }
}

/* ─── Navigation ──────────────────────────────────────────── */
.nav {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28px 48px;
}

.nav-brand {
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.25em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-trend { color: var(--text-primary); }
.brand-sep { color: var(--accent); font-size: 1rem; }
.brand-board { color: var(--accent); }

.nav-favs {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-secondary);
  transition: color 0.25s ease;
  padding: 8px 0;
}

.nav-favs:hover { color: var(--accent); }
.fav-icon { font-size: 1rem; }

/* ─── Main layout ─────────────────────────────────────────── */
.main {
  position: relative;
  z-index: 5;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 24px 80px;
  gap: 40px;
}

/* ─── Hero ────────────────────────────────────────────────── */
.hero {
  text-align: center;
  max-width: 560px;
}

.hero-eyebrow {
  font-size: 0.7rem;
  letter-spacing: 0.3em;
  color: var(--accent);
  text-transform: uppercase;
  margin-bottom: 20px;
  font-weight: 500;
}

.hero-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2.4rem, 6vw, 3.6rem);
  font-weight: 700;
  line-height: 1.15;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.hero-title em {
  font-style: italic;
  color: var(--accent);
}

.hero-sub {
  font-size: 0.88rem;
  color: var(--text-secondary);
  letter-spacing: 0.03em;
  line-height: 1.6;
}

/* ─── Search ──────────────────────────────────────────────── */
.search-form {
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.search-box {
  width: 100%;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
  overflow: hidden;
}

.search-box:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-dim);
}

.search-icon {
  padding: 0 16px;
  color: var(--text-muted);
  font-size: 1.1rem;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  padding: 18px 8px;
  font-size: 0.95rem;
  color: var(--text-primary);
  letter-spacing: 0.02em;
}

.search-input::placeholder { color: var(--text-muted); }
.search-input:disabled { opacity: 0.5; }

.search-btn {
  background: var(--accent);
  border: none;
  padding: 0 24px;
  height: 58px;
  font-size: 1.3rem;
  color: #0a0806;
  font-weight: 700;
  transition: background 0.2s ease, opacity 0.2s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-btn:hover:not(:disabled) { background: var(--text-primary); }
.search-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0,0,0,0.3);
  border-top-color: #0a0806;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.error-msg {
  font-size: 0.8rem;
  color: #e07070;
  letter-spacing: 0.03em;
  text-align: center;
}

/* ─── Weather card ────────────────────────────────────────── */
.card {
  width: 100%;
  max-width: 520px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 2px;
  padding: 36px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow:
    0 32px 80px rgba(0,0,0,0.6),
    inset 0 1px 0 rgba(255,255,255,0.04);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.card-location {
  display: flex;
  align-items: center;
  gap: 14px;
}

.card-weather-icon {
  font-size: 2.2rem;
  line-height: 1;
  filter: drop-shadow(0 2px 8px var(--accent-dim));
}

.card-city {
  font-family: 'Playfair Display', serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.card-desc {
  font-size: 0.78rem;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-top: 4px;
}

.card-temp-block {
  display: flex;
  align-items: flex-start;
  flex-shrink: 0;
}

.card-temp {
  font-family: 'Playfair Display', serif;
  font-size: 3.8rem;
  font-weight: 400;
  color: var(--text-primary);
  line-height: 1;
  letter-spacing: -0.03em;
}

.card-temp-unit {
  font-size: 1.4rem;
  color: var(--text-secondary);
  margin-top: 8px;
  font-weight: 300;
}

/* Meta row */
.card-meta {
  display: flex;
  align-items: center;
  gap: 0;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 2px;
  padding: 14px 20px;
  margin-bottom: 28px;
}

.meta-chip {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.meta-label {
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  color: var(--text-muted);
  text-transform: uppercase;
}

.meta-val {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--accent);
  letter-spacing: 0.05em;
}

.meta-divider {
  width: 1px;
  height: 28px;
  background: rgba(255,255,255,0.06);
}

/* Divider */
.section-divider {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--card-border), transparent);
}

.divider-label {
  font-size: 0.62rem;
  letter-spacing: 0.25em;
  color: var(--accent);
  text-transform: uppercase;
  white-space: nowrap;
  font-weight: 600;
}

/* Outfit list */
.outfit-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 28px;
}

.outfit-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 10px 14px;
  background: rgba(255,255,255,0.02);
  border-left: 2px solid var(--accent-dim);
  border-radius: 0 2px 2px 0;
  animation: slideIn 0.4s ease both;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.outfit-item:hover {
  background: rgba(255,255,255,0.04);
  border-color: var(--accent);
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
}

.outfit-bullet {
  font-size: 1rem;
  flex-shrink: 0;
  margin-top: 1px;
}

.outfit-text {
  font-size: 0.88rem;
  color: var(--text-primary);
  line-height: 1.5;
  letter-spacing: 0.01em;
}

/* Save button */
.save-btn {
  width: 100%;
  padding: 16px;
  background: transparent;
  border: 1px solid var(--accent);
  color: var(--accent);
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  border-radius: 2px;
  transition: background 0.25s ease, color 0.25s ease, transform 0.1s ease;
}

.save-btn:hover {
  background: var(--accent);
  color: #0a0806;
}

.save-btn:active { transform: scale(0.99); }

.save-btn--saved {
  background: var(--accent-dim);
  color: var(--accent);
  border-color: var(--accent);
  pointer-events: none;
}

/* ─── Footer ──────────────────────────────────────────────── */
.footer {
  position: relative;
  z-index: 5;
  text-align: center;
  padding: 24px;
  font-size: 0.68rem;
  color: var(--text-muted);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-top: 1px solid rgba(255,255,255,0.04);
}

/* ─── Transitions ─────────────────────────────────────────── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.rise-enter-active {
  transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.rise-enter-from { opacity: 0; transform: translateY(24px); }

/* ─── Responsive ──────────────────────────────────────────── */
@media (max-width: 600px) {
  .nav { padding: 20px 24px; }
  .card { padding: 24px 20px; }
  .card-temp { font-size: 2.8rem; }
  .hero-title { font-size: 2rem; }
  .card-meta { flex-direction: column; gap: 12px; }
  .meta-divider { width: 40px; height: 1px; }
}
</style>
