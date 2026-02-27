import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
    timeout: 8000,
    headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('zb_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// Handle 401 by clearing auth and redirecting to login
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('zb_token')
            localStorage.removeItem('zb_user')
            window.location.href = '/login'
        }
        return Promise.reject(err)
    }
)

// ── Auth ──────────────────────────────────────────────────────────────────
export const login = (credentials) => api.post('/auth/login', credentials)

// ── Devices ───────────────────────────────────────────────────────────────
export const getDevices = (search = '') =>
    api.get('/devices', { params: search ? { search } : {} })

export const getSerialSuggestions = (prefix) =>
    api.get('/devices/suggestions', { params: { prefix } })

export const registerDevice = (data) => api.post('/devices', data)

export const updateDevice = (id, data) => api.put(`/devices/${id}`, data)

export const deleteDevice = (id) => api.delete(`/devices/${id}`)

export const approveExit = (id) => api.post(`/devices/${id}/verify`)

export const manualVerification = (id) => api.post(`/devices/${id}/manual-verification`)

// ── Activity Logs ─────────────────────────────────────────────────────
export const getActivityLogs = (limit = 100) =>
    api.get('/activity-logs', { params: { limit } })

export default api
