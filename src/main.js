import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

pinia.use(({ store, options }) => {
	const persist = options.persist
	if (!persist) return

	const key = typeof persist === 'object' && persist.key ? persist.key : `pinia-${store.$id}`
	const storage = typeof persist === 'object' && persist.storage ? persist.storage : window.localStorage
	const paths = typeof persist === 'object' && Array.isArray(persist.paths) ? persist.paths : null

	try {
		const fromStorage = storage.getItem(key)
		if (fromStorage) {
			store.$patch(JSON.parse(fromStorage))
		}
	} catch (_) {}

	store.$subscribe(
		(_, state) => {
			try {
				const stateToPersist = paths
					? paths.reduce((acc, path) => {
							acc[path] = state[path]
							return acc
						}, {})
					: state

				storage.setItem(key, JSON.stringify(stateToPersist))
			} catch (_) {}
		},
		{ detached: true },
	)
})

app.use(pinia)
app.use(router)

app.mount('#app')
