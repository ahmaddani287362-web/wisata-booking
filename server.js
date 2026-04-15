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
    secret: 'premium-wisata-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }
}));

// Multer memory storage
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
        res.json(result.rows[0] || null);
    } catch (err) {
        res.json(null);
    }
});

app.post('/api/tours', isAdmin, async (req, res) => {
    try {
        const { title, price, duration, imageUrl, description, itinerary } = req.body;
        const finalImageUrl = imageUrl || 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg';
        const result = await pool.query(
            'INSERT INTO tours (title, price, duration, image, description, itinerary) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [title, parseInt(price), duration, finalImageUrl, description, itinerary]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/tours/:id', isAdmin, async (req, res) => {
    try {
        const { title, price, duration, imageUrl, description, itinerary } = req.body;
        const result = await pool.query(
            'UPDATE tours SET title=$1, price=$2, duration=$3, image=$4, description=$5, itinerary=$6 WHERE id=$7 RETURNING *',
            [title, parseInt(price), duration, imageUrl, description, itinerary, req.params.id]
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

// ============= ACTIVITIES API =============
app.get('/api/activities', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM activities ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.json([]);
    }
});

app.get('/api/activities/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM activities WHERE id = $1', [req.params.id]);
        res.json(result.rows[0] || null);
    } catch (err) {
        res.json(null);
    }
});

app.post('/api/activities', isAdmin, async (req, res) => {
    try {
        const { title, price, duration, imageUrl, description, included, highlights, whatToBring, additionalInfo, terms } = req.body;
        const finalImageUrl = imageUrl || 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg';
        const result = await pool.query(
            'INSERT INTO activities (title, price, duration, image, description, included, highlights, whatToBring, additionalInfo, terms) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [title, parseInt(price), duration, finalImageUrl, description, included, highlights, whatToBring, additionalInfo, terms]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/activities/:id', isAdmin, async (req, res) => {
    try {
        const { title, price, duration, imageUrl, description, included, highlights, whatToBring, additionalInfo, terms } = req.body;
        const result = await pool.query(
            'UPDATE activities SET title=$1, price=$2, duration=$3, image=$4, description=$5, included=$6, highlights=$7, whatToBring=$8, additionalInfo=$9, terms=$10 WHERE id=$11 RETURNING *',
            [title, parseInt(price), duration, imageUrl, description, included, highlights, whatToBring, additionalInfo, terms, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/activities/:id', isAdmin, async (req, res) => {
    await pool.query('DELETE FROM activities WHERE id = $1', [req.params.id]);
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
        res.json(result.rows[0] || null);
    } catch (err) {
        res.json(null);
    }
});

app.post('/api/villas', isAdmin, async (req, res) => {
    try {
        const { name, price, location, imageUrl, facilities, description } = req.body;
        const finalImageUrl = imageUrl || 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg';
        const result = await pool.query(
            'INSERT INTO villas (name, price, location, image, facilities, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, parseInt(price), location, finalImageUrl, facilities, description]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/villas/:id', isAdmin, async (req, res) => {
    try {
        const { name, price, location, imageUrl, facilities, description } = req.body;
        const result = await pool.query(
            'UPDATE villas SET name=$1, price=$2, location=$3, image=$4, facilities=$5, description=$6 WHERE id=$7 RETURNING *',
            [name, parseInt(price), location, imageUrl, facilities, description, req.params.id]
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

// ============= CONTACT API =============
app.get('/api/contacts', isAdmin, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.json([]);
    }
});

app.post('/api/contacts', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        const result = await pool.query(
            'INSERT INTO contacts (name, email, phone, message) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, phone, message]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/contacts/:id', isAdmin, async (req, res) => {
    await pool.query('DELETE FROM contacts WHERE id = $1', [req.params.id]);
    res.json({ success: true });
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});