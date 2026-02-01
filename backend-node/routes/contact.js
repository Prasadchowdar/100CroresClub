import express from 'express';
import { getPool, sql } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Submit contact message
router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required' });
  }

  try {
    const pool = getPool();
    const contactId = uuidv4();

    await pool.request()
      .input('id', sql.NVarChar, contactId)
      .input('name', sql.NVarChar, name)
      .input('email', sql.NVarChar, email)
      .input('message', sql.NVarChar, message)
      .input('status', sql.NVarChar, 'pending')
      .input('created_at', sql.DateTime, new Date())
      .query(`
        INSERT INTO contact_messages (id, name, email, message, status, created_at)
        VALUES (@id, @name, @email, @message, @status, @created_at)
      `);

    return res.status(200).json({
      success: true,
      message: "Thank you for your message! We'll get back to you soon."
    });
  } catch (err) {
    console.error('Contact error:', err);
    return res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

export default router;
