const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Helper function to handle database queries
const executeQuery = async (query, params = []) => {
  try {
    const result = await pool.query(query, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// GET /api/data/exhibitions
router.get('/exhibitions', async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM exhibitions ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exhibitions' });
  }
});

// POST /api/data/exhibitions
router.post('/exhibitions', authMiddleware, async (req, res) => {
  try {
    const { id, title, dateRange, description, imageUrl, category } = req.body;
    await executeQuery(
      'INSERT INTO exhibitions (id, title, date_range, description, image_url, category) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, date_range = EXCLUDED.date_range, description = EXCLUDED.description, image_url = EXCLUDED.image_url, category = EXCLUDED.category',
      [id, title, dateRange, description, imageUrl, category]
    );
    res.json({ message: 'Exhibition saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving exhibition' });
  }
});

// GET /api/data/artworks
router.get('/artworks', async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM artworks ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching artworks' });
  }
});

// GET /api/data/collectables
router.get('/collectables', async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM collectables ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching collectables' });
  }
});

// POST /api/data/collectables
router.post('/collectables', authMiddleware, async (req, res) => {
  try {
    const { id, name, price, category, imageUrl, description, inStock } = req.body;
    await executeQuery(
      'INSERT INTO collectables (id, name, price, category, image_url, description, in_stock) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, category = EXCLUDED.category, image_url = EXCLUDED.image_url, description = EXCLUDED.description, in_stock = EXCLUDED.in_stock',
      [id, name, price, category, imageUrl, description, inStock]
    );
    res.json({ message: 'Collectable saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving collectable' });
  }
});

// DELETE /api/data/collectables/:id
router.delete('/collectables/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await executeQuery('DELETE FROM collectables WHERE id = $1', [id]);
    res.json({ message: 'Collectable deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting collectable' });
  }
});

// GET /api/data/events
router.get('/events', async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM events ORDER BY date DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// GET /api/data/bookings
router.get('/bookings', async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM bookings ORDER BY timestamp DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

// POST /api/data/bookings
router.post('/bookings', async (req, res) => {
  try {
    const { id, customerName, email, date, tickets, totalAmount, timestamp, status } = req.body;
    await executeQuery(
      'INSERT INTO bookings (id, customer_name, email, date, tickets, total_amount, timestamp, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO UPDATE SET customer_name = EXCLUDED.customer_name, email = EXCLUDED.email, date = EXCLUDED.date, tickets = EXCLUDED.tickets, total_amount = EXCLUDED.total_amount, timestamp = EXCLUDED.timestamp, status = EXCLUDED.status',
      [id, customerName, email, date, JSON.stringify(tickets), totalAmount, timestamp, status]
    );
    res.json({ message: 'Booking saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving booking' });
  }
});

// GET /api/data/shop-orders
router.get('/shop-orders', async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM shop_orders ORDER BY timestamp DESC');
    // Parse JSON fields
    const orders = result.rows.map(order => ({
      ...order,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
    }));
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shop orders' });
  }
});

// POST /api/data/shop-orders
router.post('/shop-orders', async (req, res) => {
  try {
    const { id, customerName, email, items, totalAmount, timestamp, status, payment_status, payment_message, payment_time, payment_session_id } = req.body;
    await executeQuery(
      'INSERT INTO shop_orders (id, customer_name, email, items, total_amount, timestamp, status, payment_status, payment_message, payment_time, payment_session_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (id) DO UPDATE SET customer_name = EXCLUDED.customer_name, email = EXCLUDED.email, items = EXCLUDED.items, total_amount = EXCLUDED.total_amount, timestamp = EXCLUDED.timestamp, status = EXCLUDED.status, payment_status = EXCLUDED.payment_status, payment_message = EXCLUDED.payment_message, payment_time = EXCLUDED.payment_time, payment_session_id = EXCLUDED.payment_session_id',
      [id, customerName, email, JSON.stringify(items), totalAmount, timestamp, status, payment_status, payment_message, payment_time, payment_session_id]
    );
    res.json({ message: 'Shop order saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving shop order' });
  }
});

// PATCH /api/data/shop-orders/:id/status
router.patch('/shop-orders/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await executeQuery('UPDATE shop_orders SET status = $1 WHERE id = $2', [status, id]);
    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status' });
  }
});

// GET /api/data/gallery-images
router.get('/gallery-images', async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM gallery_images ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gallery images' });
  }
});

// POST /api/data/gallery-images
router.post('/gallery-images', authMiddleware, async (req, res) => {
  try {
    const { id, imageUrl, title, description } = req.body;
    await executeQuery(
      'INSERT INTO gallery_images (id, image_url, title, description) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET image_url = EXCLUDED.image_url, title = EXCLUDED.title, description = EXCLUDED.description',
      [id, imageUrl, title, description]
    );
    res.json({ message: 'Gallery image saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving gallery image' });
  }
});

// DELETE /api/data/gallery-images/:id
router.delete('/gallery-images/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await executeQuery('DELETE FROM gallery_images WHERE id = $1', [id]);
    res.json({ message: 'Gallery image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting gallery image' });
  }
});

// GET /api/data/press-releases
router.get('/press-releases', async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM press_releases ORDER BY date DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching press releases' });
  }
});

// POST /api/data/press-releases
router.post('/press-releases', authMiddleware, async (req, res) => {
  try {
    const { id, title, date, summary, url, fileName } = req.body;
    await executeQuery(
      'INSERT INTO press_releases (id, title, date, summary, url, file_name) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, date = EXCLUDED.date, summary = EXCLUDED.summary, url = EXCLUDED.url, file_name = EXCLUDED.file_name',
      [id, title, date, summary, url, fileName]
    );
    res.json({ message: 'Press release saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving press release' });
  }
});

module.exports = router;