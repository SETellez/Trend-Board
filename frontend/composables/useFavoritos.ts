const STORAGE_KEY = 'trend-board-favoritos'

export interface FavoritoItem {
  city: string
  temperature: number
  feelsLike: number
  condition: string
  description: string
  humidity: number
  outfit: string[]
  savedAt: string
}

export const useFavoritos = () => {
  const favoritos = useState<FavoritoItem[]>('favoritos', () => [])

  const load = () => {
    if (import.meta.client) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        favoritos.value = raw ? JSON.parse(raw) : []
      } catch {
        favoritos.value = []
      }
    }
  }

  const persist = () => {
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritos.value))
    }
  }

  const addFavorito = (weather: Omit<FavoritoItem, 'savedAt'>) => {
    load()
    const already = favoritos.value.some((f) => f.city === weather.city)
    if (!already) {
      favoritos.value = [
        { ...weather, savedAt: new Date().toISOString() },
        ...favoritos.value,
      ]
      persist()
    }
  }

  const removeFavorito = (city: string) => {
    favoritos.value = favoritos.value.filter((f) => f.city !== city)
    persist()
  }

  const clearAll = () => {
    favoritos.value = []
    persist()
  }

  return { favoritos, load, addFavorito, removeFavorito, clearAll }
}
