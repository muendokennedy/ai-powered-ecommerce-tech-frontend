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
    return Promise.reject(error)
  }
)


export default axiosClient
