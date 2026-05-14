/**
 * map-picker.js — Location picker component
 *
 * Renders a Leaflet map inside a container, lets the user click to drop a pin,
 * and emits the chosen lat/lng back to the parent form.
 *
 * Usage:
 *   import { initMapPicker } from '../components/map-picker.js'
 *
 *   const picker = initMapPicker({
 *     containerId: 'mapPickerContainer',
 *     onSelect: ({ lat, lng, address }) => {
 *       // write to hidden inputs, etc.
 *     },
 *     initialLat: 42.96,
 *     initialLng: -85.66,
 *     zoom: 10,
 *   })
 *
 *   picker.setLatLng(lat, lng)   // programmatically move marker
 *   picker.getLatLng()           // → { lat, lng } | null
 *   picker.destroy()             // clean up
 *
 * Dependencies:
 *   Leaflet CSS + JS loaded in the host page:
 *     <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9/dist/leaflet.css"/>
 *     <script src="https://unpkg.com/leaflet@1.9/dist/leaflet.js"></script>
 *
 * Reverse-geocoding uses the free Nominatim API.
 */

export function initMapPicker({
  containerId = 'mapPickerContainer',
  onSelect    = () => {},
  initialLat  = 44.0,
  initialLng  = -84.5,
  zoom        = 7,
} = {}) {

  const container = document.getElementById(containerId)
  if (!container) {
    console.warn(`map-picker: container #${containerId} not found`)
    return null
  }

  if (typeof L === 'undefined') {
    container.innerHTML = '<p style="padding:1rem;color:#5a6370">Map unavailable — Leaflet not loaded.</p>'
    return null
  }

  // Set min height so map is visible
  if (!container.style.height) container.style.height = '320px'

  const map = L.map(containerId).setView([initialLat, initialLng], zoom)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map)

  let marker = null

  async function reverseGeocode(lat, lng) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    }
  }

  map.on('click', async (e) => {
    const { lat, lng } = e.latlng

    if (marker) {
      marker.setLatLng([lat, lng])
    } else {
      marker = L.marker([lat, lng]).addTo(map)
    }

    const address = await reverseGeocode(lat, lng)
    marker.bindPopup(address).openPopup()
    onSelect({ lat, lng, address })
  })

  return {
    setLatLng(lat, lng) {
      if (marker) {
        marker.setLatLng([lat, lng])
      } else {
        marker = L.marker([lat, lng]).addTo(map)
      }
      map.setView([lat, lng], zoom)
    },
    getLatLng() {
      if (!marker) return null
      const { lat, lng } = marker.getLatLng()
      return { lat, lng }
    },
    destroy() {
      map.remove()
    },
  }
}
