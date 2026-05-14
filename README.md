# Trend Board — Historias de Usuario

**Asignatura:** Laboratorio de Software
**Universidad:** Universidad Tecnológica de Pereira
**Repositorio:** https://github.com/SETellez/Trend-Board

---

## HU-1 — Consultar outfit según el clima

**Como** usuario,
**quiero** ingresar el nombre de una ciudad y ver el clima actual junto con una sugerencia de outfit,
**para** saber cómo vestirme apropiadamente según las condiciones del tiempo ese día.

### Criterios de aceptación

- El usuario puede ingresar el nombre de cualquier ciudad en el buscador.
- El sistema muestra la temperatura actual, sensación térmica, humedad y condición climática.
- El sistema sugiere un outfit compuesto por prendas específicas (camiseta, pantalón, calzado, accesorio) según la temperatura y condición.
- El outfit varía dependiendo del rango de temperatura:
  - **Frío:** < 10 °C
  - **Fresco:** 10–17 °C
  - **Templado:** 18–24 °C
  - **Cálido:** > 24 °C
- Si la ciudad no existe o hay un error de red, se muestra un mensaje de error claro al usuario.

### Rama de desarrollo

```
feature/HU-1-outfit-clima
```

---

## HU-2 — Guardar outfits favoritos

**Como** usuario,
**quiero** guardar los outfits que me gustaron y consultarlos después,
**para** tener un tablero personal de inspiración sin necesidad de registrarme.

### Criterios de aceptación

- El usuario puede guardar un outfit con el botón **"Guardar Outfit"** desde la card de resultados.
- Los outfits guardados persisten en el dispositivo (`localStorage`) sin necesidad de cuenta ni login.
- La página **"Mis Favoritos"** muestra todos los outfits guardados con ciudad, temperatura, condición y prendas sugeridas.
- El usuario puede eliminar cualquier favorito de la lista.
- Si no hay favoritos guardados, se muestra un mensaje indicándolo.

### Rama de desarrollo

```
feature/HU-2-favoritos
```
