<template>
  <div class="page">
    <div class="bg-glow" />

    <!-- Navigation -->
    <nav class="nav">
      <NuxtLink to="/" class="nav-back">
        <span>←</span>
        <span>Volver</span>
      </NuxtLink>
      <div class="nav-brand">
        <span class="brand-trend">TREND</span>
        <span class="brand-sep">·</span>
        <span class="brand-board">BOARD</span>
      </div>
      <div class="nav-spacer" />
    </nav>

    <!-- Header -->
    <header class="page-header">
      <p class="header-eyebrow">✦ COLECCIÓN PERSONAL ✦</p>
      <h1 class="page-title">Mis Favoritos</h1>
      <p class="page-sub">
        {{ favoritos.length > 0
          ? `${favoritos.length} outfit${favoritos.length === 1 ? '' : 's'} guardado${favoritos.length === 1 ? '' : 's'}`
          : 'Aún no tienes outfits guardados'
        }}
      </p>
    </header>

    <!-- Empty state -->
    <Transition name="fade">
      <div v-if="favoritos.length === 0" class="empty-state">
        <span class="empty-icon">☁</span>
        <p class="empty-title">Tu armario está vacío</p>
        <p class="empty-sub">Busca el clima de tu ciudad y guarda los outfits que más te gusten.</p>
        <NuxtLink to="/" class="empty-cta">Explorar outfits →</NuxtLink>
      </div>
    </Transition>

    <!-- Favorites grid -->
    <main v-if="favoritos.length > 0" class="grid">

      <!-- Clear all button -->
      <div class="grid-actions">
        <button class="clear-btn" @click="confirmClear = true">
          Limpiar todo
        </button>
      </div>

      <!-- Cards -->
      <TransitionGroup name="list" tag="div" class="cards-container">
        <article
          v-for="(fav, idx) in favoritos"
          :key="fav.city"
          class="fav-card"
          :class="cardTheme(fav)"
          :style="{ animationDelay: `${idx * 80}ms` }"
        >
          <!-- Card header -->
          <div class="fav-header">
            <div class="fav-location">
              <span class="fav-icon">{{ conditionIcon(fav.condition) }}</span>
              <div>
                <h2 class="fav-city">{{ fav.city }}</h2>
                <p class="fav-condition">{{ capitalize(fav.description) }}</p>
              </div>
            </div>
            <div class="fav-temp-block">
              <span class="fav-temp">{{ Math.round(fav.temperature) }}</span>
              <span class="fav-temp-unit">°C</span>
            </div>
          </div>

          <!-- Meta -->
          <div class="fav-meta">
            <span class="meta-pill">Sensación {{ Math.round(fav.feelsLike) }}°C</span>
            <span class="meta-pill">Humedad {{ fav.humidity }}%</span>
            <span class="meta-pill">{{ fav.condition }}</span>
          </div>

          <!-- Outfit -->
          <div class="fav-outfit-label">OUTFIT</div>
          <ul class="fav-outfit">
            <li v-for="item in fav.outfit" :key="item" class="fav-outfit-item">
              <span class="fav-bullet">{{ outfitEmoji(item) }}</span>
              <span>{{ item }}</span>
            </li>
          </ul>

          <!-- Footer: date + delete -->
          <div class="fav-footer">
            <span class="fav-date">Guardado el {{ formatDate(fav.savedAt) }}</span>
            <button
              class="delete-btn"
              title="Eliminar favorito"
              @click="handleRemove(fav.city)"
            >
              <span v-if="removingCity === fav.city">✓</span>
              <span v-else>✕ Eliminar</span>
            </button>
          </div>
        </article>
      </TransitionGroup>
    </main>

    <!-- Confirm clear modal -->
    <Transition name="fade">
      <div v-if="confirmClear" class="modal-overlay" @click.self="confirmClear = false">
        <div class="modal">
          <p class="modal-title">¿Eliminar todos los favoritos?</p>
          <p class="modal-sub">Esta acción no se puede deshacer.</p>
          <div class="modal-actions">
            <button class="modal-cancel" @click="confirmClear = false">Cancelar</button>
            <button class="modal-confirm" @click="handleClearAll">Eliminar todo</button>
          </div>
        </div>
      </div>
    </Transition>

    <footer class="footer">
      <span>TREND BOARD · Tu guía de moda según el clima</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useFavoritos } from '~/composables/useFavoritos'

const { favoritos, load, removeFavorito, clearAll } = useFavoritos()
const confirmClear = ref(false)
const removingCity = ref('')

onMounted(() => load())

const handleRemove = (city: string) => {
  removingCity.value = city
  setTimeout(() => {
    removeFavorito(city)
    removingCity.value = ''
  }, 350)
}

const handleClearAll = () => {
  clearAll()
  confirmClear.value = false
}

const conditionIcon = (condition: string) => {
  const map: Record<string, string> = {
    clear: '☀️', clouds: '☁️', rain: '🌧️', drizzle: '🌦️',
    thunderstorm: '⛈️', snow: '❄️', mist: '🌫️', fog: '🌫️',
    haze: '🌫️',
  }
  return map[condition?.toLowerCase()] ?? '🌡️'
}

const cardTheme = (fav: { condition: string; temperature: number }) => {
  const cond = fav.condition?.toLowerCase()
  if (cond === 'clear') return 'card-sunny'
  if (['rain', 'drizzle', 'thunderstorm'].includes(cond)) return 'card-rainy'
  if (cond === 'clouds') return 'card-cloudy'
  if (cond === 'snow') return 'card-snow'
  if (fav.temperature < 10) return 'card-cold'
  return ''
}

const outfitEmoji = (item: string) => {
  const t = item.toLowerCase()
  if (t.match(/zapatos|botas|tenis|sandalias/)) return '👟'
  if (t.match(/abrigo|chaqueta|impermeable|parka/)) return '🧥'
  if (t.match(/camiseta|top|suéter|buzo|camisa/)) return '👕'
  if (t.match(/pantalón|jean|short|falda/)) return '👖'
  if (t.match(/bufanda|gorro|guantes|sombrero/)) return '🧣'
  if (t.match(/paraguas/)) return '☂️'
  if (t.match(/protector/)) return '🧴'
  return '✦'
}

const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('es-CO', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch {
    return iso
  }
}
</script>

<style scoped>
/* ─── Variables ───────────────────────────────────────────── */
.page {
  --accent: #c9a84c;
  --accent-dim: rgba(201, 168, 76, 0.15);
  --accent-glow: rgba(201, 168, 76, 0.07);
  --bg: #080604;
  --card-bg: rgba(14, 11, 7, 0.90);
  --card-border: rgba(201, 168, 76, 0.10);
  --text-primary: #f0ece4;
  --text-secondary: #8a8070;
  --text-muted: #504840;

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: radial-gradient(ellipse at 50% 0%, #1a1510 0%, #080604 60%);
  position: relative;
  overflow-x: hidden;
}

.bg-glow {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse 60% 30% at 50% -5%, var(--accent-glow), transparent 70%);
  z-index: 0;
}

/* ─── Nav ─────────────────────────────────────────────────── */
.nav {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28px 48px;
}

.nav-back {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-secondary);
  transition: color 0.25s ease;
}

.nav-back:hover { color: var(--accent); }

.nav-brand {
  font-family: 'Playfair Display', serif;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.25em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-trend { color: var(--text-primary); }
.brand-sep, .brand-board { color: var(--accent); }
.nav-spacer { width: 80px; }

/* ─── Header ──────────────────────────────────────────────── */
.page-header {
  position: relative;
  z-index: 5;
  text-align: center;
  padding: 16px 24px 48px;
}

.header-eyebrow {
  font-size: 0.62rem;
  letter-spacing: 0.3em;
  color: var(--accent);
  text-transform: uppercase;
  margin-bottom: 16px;
}

.page-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.page-sub {
  font-size: 0.82rem;
  color: var(--text-secondary);
  letter-spacing: 0.04em;
}

/* ─── Empty state ─────────────────────────────────────────── */
.empty-state {
  position: relative;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 64px 24px;
  text-align: center;
}

.empty-icon {
  font-size: 3.5rem;
  opacity: 0.3;
  display: block;
  margin-bottom: 8px;
}

.empty-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.4rem;
  color: var(--text-primary);
  font-weight: 600;
}

.empty-sub {
  font-size: 0.85rem;
  color: var(--text-secondary);
  max-width: 320px;
  line-height: 1.6;
}

.empty-cta {
  margin-top: 8px;
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent);
  border-bottom: 1px solid var(--accent-dim);
  padding-bottom: 2px;
  transition: opacity 0.2s ease;
}

.empty-cta:hover { opacity: 0.7; }

/* ─── Grid ────────────────────────────────────────────────── */
.grid {
  position: relative;
  z-index: 5;
  flex: 1;
  padding: 0 40px 80px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.grid-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;
}

.clear-btn {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.08);
  color: var(--text-muted);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 8px 16px;
  border-radius: 2px;
  transition: border-color 0.2s, color 0.2s;
}

.clear-btn:hover {
  border-color: #e07070;
  color: #e07070;
}

.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

/* ─── Favorite card ───────────────────────────────────────── */
.fav-card {
  --card-accent: #c9a84c;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 2px;
  padding: 28px;
  backdrop-filter: blur(20px);
  box-shadow: 0 16px 48px rgba(0,0,0,0.5);
  animation: cardIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.fav-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 24px 64px rgba(0,0,0,0.6);
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Card themes */
.card-sunny  { --card-accent: #f0c040; --card-border: rgba(240,192,64,0.15); }
.card-rainy  { --card-accent: #7eb8d4; --card-border: rgba(126,184,212,0.12); }
.card-cloudy { --card-accent: #9ab0c0; --card-border: rgba(154,176,192,0.12); }
.card-snow   { --card-accent: #b8d4f0; --card-border: rgba(184,212,240,0.12); }
.card-cold   { --card-accent: #8899cc; --card-border: rgba(136,153,204,0.12); }

.fav-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.fav-location {
  display: flex;
  align-items: center;
  gap: 12px;
}

.fav-icon { font-size: 1.8rem; line-height: 1; }

.fav-city {
  font-family: 'Playfair Display', serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.fav-condition {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--card-accent, var(--accent));
  margin-top: 3px;
}

.fav-temp-block {
  display: flex;
  align-items: flex-start;
}

.fav-temp {
  font-family: 'Playfair Display', serif;
  font-size: 2.8rem;
  font-weight: 400;
  color: var(--text-primary);
  line-height: 1;
  letter-spacing: -0.03em;
}

.fav-temp-unit {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-top: 6px;
}

/* Meta pills */
.fav-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.meta-pill {
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  padding: 4px 10px;
  border-radius: 20px;
}

/* Outfit */
.fav-outfit-label {
  font-size: 0.6rem;
  letter-spacing: 0.25em;
  color: var(--card-accent, var(--accent));
  text-transform: uppercase;
  font-weight: 600;
  border-top: 1px solid rgba(255,255,255,0.05);
  padding-top: 16px;
}

.fav-outfit {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.fav-outfit-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.82rem;
  color: var(--text-primary);
  line-height: 1.45;
}

.fav-bullet { flex-shrink: 0; }

/* Footer */
.fav-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-top: 1px solid rgba(255,255,255,0.04);
  padding-top: 14px;
  margin-top: 4px;
}

.fav-date {
  font-size: 0.67rem;
  color: var(--text-muted);
  letter-spacing: 0.05em;
}

.delete-btn {
  background: transparent;
  border: 1px solid rgba(224, 112, 112, 0.25);
  color: rgba(224, 112, 112, 0.6);
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 6px 12px;
  border-radius: 2px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.delete-btn:hover {
  background: rgba(224, 112, 112, 0.12);
  border-color: #e07070;
  color: #e07070;
}

/* ─── Modal ───────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(6px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.modal {
  background: #111009;
  border: 1px solid var(--card-border);
  border-radius: 4px;
  padding: 36px;
  max-width: 380px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem;
  color: var(--text-primary);
  font-weight: 600;
}

.modal-sub {
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 8px;
}

.modal-cancel {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.1);
  color: var(--text-secondary);
  padding: 10px 24px;
  font-size: 0.8rem;
  border-radius: 2px;
  transition: all 0.2s;
}

.modal-cancel:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.modal-confirm {
  background: rgba(224, 112, 112, 0.15);
  border: 1px solid #e07070;
  color: #e07070;
  padding: 10px 24px;
  font-size: 0.8rem;
  border-radius: 2px;
  transition: all 0.2s;
}

.modal-confirm:hover {
  background: #e07070;
  color: #fff;
}

/* ─── Footer ──────────────────────────────────────────────── */
.footer {
  position: relative;
  z-index: 5;
  text-align: center;
  padding: 24px;
  font-size: 0.66rem;
  color: var(--text-muted);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border-top: 1px solid rgba(255,255,255,0.04);
}

/* ─── Transitions ─────────────────────────────────────────── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.list-enter-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.list-leave-active { transition: all 0.3s ease; }
.list-enter-from   { opacity: 0; transform: translateY(16px); }
.list-leave-to     { opacity: 0; transform: translateX(-20px); }
.list-move         { transition: transform 0.4s ease; }

/* ─── Responsive ──────────────────────────────────────────── */
@media (max-width: 768px) {
  .nav { padding: 20px 24px; }
  .grid { padding: 0 16px 60px; }
  .cards-container { grid-template-columns: 1fr; }
  .nav-spacer { width: 60px; }
}
</style>
