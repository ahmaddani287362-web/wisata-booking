// Global variables
let currentUserType = 'user';

// Helper function untuk fetch dengan loading
async function fetchAPI(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

// Format currency
function formatPrice(price) {
    return new Intl.NumberFormat('id-ID').format(price);
}

// Show alert
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${type}`;
    alertDiv.textContent = message;
    document.body.prepend(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
}

// Check admin status
async function checkAdminStatus() {
    try {
        const response = await fetch('/api/admin/check');
        const data = await response.json();
        return data.isAdmin;
    } catch {
        return false;
    }
}

// Admin login
async function adminLogin(username, password) {
    const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    return response.ok;
}

// Admin logout
async function adminLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin.html';
}