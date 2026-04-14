const express = require('express');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }
}));

// Multer for memory storage (for Vercel)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Auth middleware
function isAdmin(req, res, next) {
    if (req.session.isAdmin) return next();
    res.status(401).json({ error: 'Unauthorized' });
}

// Admin login
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        req.session.isAdmin = true;
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.post('/api/admin/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.get('/api/admin/check', (req, res) => {
    res.json({ isAdmin: !!req.session.isAdmin });
});

// ============= TOURS API =============
app.get('/api/tours', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tours ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.json([]);
    }
});

app.get('/api/tours/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tours WHERE id = $1', [req.params.id]);
        res.json(result.rows[0] || {});
    } catch (err) {
        res.json({});
    }
});

app.post('/api/tours', isAdmin, upload.single('image'), async (req, res) => {
    try {
        const { title, price, duration, description, itinerary } = req.body;
        let imageUrl = req.file ? 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg' : null;
        
        const result = await pool.query(
            'INSERT INTO tours (title, price, duration, image, description, itinerary) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [title, parseInt(price), duration, imageUrl, description, itinerary]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/tours/:id', isAdmin, async (req, res) => {
    try {
        const { title, price, duration, description, itinerary } = req.body;
        const result = await pool.query(
            'UPDATE tours SET title=$1, price=$2, duration=$3, description=$4, itinerary=$5 WHERE id=$6 RETURNING *',
            [title, parseInt(price), duration, description, itinerary, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/tours/:id', isAdmin, async (req, res) => {
    await pool.query('DELETE FROM tours WHERE id = $1', [req.params.id]);
    res.json({ success: true });
});

// ============= VILLAS API =============
app.get('/api/villas', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM villas ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.json([]);
    }
});

app.get('/api/villas/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM villas WHERE id = $1', [req.params.id]);
        res.json(result.rows[0] || {});
    } catch (err) {
        res.json({});
    }
});

app.post('/api/villas', isAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name, price, location, facilities, description } = req.body;
        let imageUrl = req.file ? 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg' : null;
        
        const result = await pool.query(
            'INSERT INTO villas (name, price, location, image, facilities, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, parseInt(price), location, imageUrl, facilities, description]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/villas/:id', isAdmin, async (req, res) => {
    try {
        const { name, price, location, facilities, description } = req.body;
        const result = await pool.query(
            'UPDATE villas SET name=$1, price=$2, location=$3, facilities=$4, description=$5 WHERE id=$6 RETURNING *',
            [name, parseInt(price), location, facilities, description, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/villas/:id', isAdmin, async (req, res) => {
    await pool.query('DELETE FROM villas WHERE id = $1', [req.params.id]);
    res.json({ success: true });
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});