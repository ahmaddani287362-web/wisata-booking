// config.js - Konfigurasi API Backend
// Ganti dengan URL Render.com Anda setelah deploy backend
const API_BASE_URL = 'https://wisata-backend.onrender.com';

// Endpoints
const API_ENDPOINTS = {
    tours: `${API_BASE_URL}/api/tours`,
    activities: `${API_BASE_URL}/api/activities`,
    villas: `${API_BASE_URL}/api/villas`,
    contacts: `${API_BASE_URL}/api/contacts`,
    adminLogin: `${API_BASE_URL}/api/admin/login`,
    adminCheck: `${API_BASE_URL}/api/admin/check`,
};