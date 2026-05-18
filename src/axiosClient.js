import axios from 'axios'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    'Accept': 'application/json',
  }
})

let csrftokenInitialized = false

async function ensureCsrfCookie(){
  await axiosClient.get('/sanctum/csrf-cookie')
}


axiosClient.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toLowerCase()
  if(['post', 'put', 'patch', 'delete'].includes(method)){
    if (!csrftokenInitialized) {
      await ensureCsrfCookie()
      csrftokenInitialized = true
    }
  }
  return config
})

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const message = error?.response?.data?.message || ''

    // If CSRF token mismatch (Laravel typically returns 419) or message mentions CSRF,
    // attempt to refresh the CSRF cookie once and retry the original request.
    const config = error.config || {}
    if (!config._retry && (status === 419 || /csrf/i.test(message))) {
      config._retry = true
      csrftokenInitialized = false
      return ensureCsrfCookie()
        .then(() => axiosClient(config))
        .catch(() => Promise.reject(error))
    }

    return Promise.reject(error)
  }
)


export default axiosClient
