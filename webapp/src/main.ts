import { createApp } from 'vue'
import 'uno.css'
import './style.css'

import { createPinia } from 'pinia'
import App from './NewApp.vue'

createApp(App)
  .use(createPinia())
  .mount('#app')
