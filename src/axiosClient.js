import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const axiosClient = axios.create({
  baseURL,
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
  }
})


async function ensureCsrfCookie(){
  await axiosClient.get('/sanctum/csrf-cookie')
}

function readCookie(name){
  const match = document.cookie.split(';').map(s=>s.trim()).find(c=>c.startsWith(name + '='))
  if(!match) return ''
  try { return decodeURIComponent(match.split('=')[1]) } catch { return '' }
}

axiosClient.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toLowerCase()
  if(['post', 'put', 'patch', 'delete'].includes(method)){
    if (!readCookie('XSRF-TOKEN')) {
      await ensureCsrfCookie()
    }
    const xsrfToken = readCookie('XSRF-TOKEN')
    if (xsrfToken) {
      config.headers['X-XSRF-TOKEN'] = xsrfToken
    }
  }
  return config
})

// axiosClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if(error.response && error.response.status === 422){

//       const validation = error.response.data?.errors || {}

//       return Promise.reject({...error,validation})
//     }
//     return Promise.reject(error)
//   }
// )


export default axiosClient
