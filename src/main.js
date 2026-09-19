import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

const root = document.querySelector('#asteroid-bounce-root')

if (root && !root.dataset.asteroidBounceMounted) {
  root.dataset.asteroidBounceMounted = 'true'

  const app = createApp(App)
  app.mount(root)

  const handleSectionUnload = (event) => {
    if (event.target.contains(root)) {
      app.unmount()
      document.removeEventListener('shopify:section:unload', handleSectionUnload)
    }
  }

  document.addEventListener('shopify:section:unload', handleSectionUnload)
}
