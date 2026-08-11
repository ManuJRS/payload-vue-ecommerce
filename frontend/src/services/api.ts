import axios from 'axios'

const baseURL = import.meta.env.VITE_PAYLOAD_API_URL

if (!baseURL) {
  console.warn('VITE_PAYLOAD_API_URL is not defined. API requests will fail.')
}

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.errors?.[0]?.message ||
      error.response?.data?.message ||
      error.message ||
      'Unexpected API error'

    return Promise.reject(new Error(message))
  },
)

export default api
