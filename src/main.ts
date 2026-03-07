import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { vuetify } from './plugins/vuetify'
import '@mdi/font/css/materialdesignicons.css'
import 'vue3-toastify/dist/index.css'
import axios from 'axios'
import i18n from './plugins/i18n'

axios.defaults.baseURL = 'http://localhost'
const savedLocale = localStorage.getItem('user-locale') || 'fr'
axios.defaults.headers.common['Accept-Language'] = savedLocale

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(i18n)

app.mount('#app')
