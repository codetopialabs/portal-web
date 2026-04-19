import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data
    // API format: { data, errors: { fieldName: ["msg"] }, meta }
    const errors = data?.errors
    if (errors && typeof errors === 'object') {
      const firstKey = Object.keys(errors)[0]
      const firstMsg = errors[firstKey]
      const msg = Array.isArray(firstMsg) ? firstMsg[0] : firstMsg
      if (msg) return Promise.reject(new Error(String(msg)))
    }
    const message =
      data?.message ||
      data?.detail ||
      data?.error ||
      (Array.isArray(data?.non_field_errors) ? data.non_field_errors[0] : undefined) ||
      (typeof data === 'string' ? data : undefined) ||
      error.message ||
      'An unexpected error occurred'
    return Promise.reject(new Error(message))
  }
)

export default axiosInstance
