import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './main.css'
import router from './router'
import { useAppStore } from '@/stores/appStore'
import { useFavoritesStore } from '@/stores/favoritesStore'
import VueFeather from 'vue-feather'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.component("VueFeather", VueFeather);




const appStore = useAppStore()
appStore.init()

const favStore = useFavoritesStore()
favStore.init()

app.mount('#app')
