import express from 'express';
import { getPool, sql } from '../config/database.js';
import { authenticateAdmin } from './admin.js';

const router = express.Router();

// Get program settings (public - for frontend)
router.get('/program', async (req, res) => {
  try {
    const pool = getPool();

    const result = await pool.request()
      .query(`
        SELECT setting_key, setting_value
        FROM settings
        WHERE setting_key = 'program_end_date'
      `);

    if (result.recordset.length === 0) {
      // Default: 6 months from now
      const defaultEndDate = new Date();
      defaultEndDate.setMonth(defaultEndDate.getMonth() + 6);

      return res.status(200).json({
        program_end_date: defaultEndDate.toISOString()
      });
    }

    return res.status(200).json({
      program_end_date: result.recordset[0].setting_value
    });
  } catch (err) {
    console.error('Get program settings error:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Update program settings (admin only)
router.post('/program', authenticateAdmin, async (req, res) => {
  const { program_end_date } = req.body;

  if (!program_end_date) {
    return res.status(400).json({ message: 'program_end_date is required' });
  }

  try {
    const pool = getPool();

    // Check if setting exists
    const existing = await pool.request()
      .query(`SELECT * FROM settings WHERE setting_key = 'program_end_date'`);

    if (existing.recordset.length > 0) {
      // Update existing
      await pool.request()
        .input('value', sql.NVarChar, program_end_date)
        .input('updated_at', sql.DateTime, new Date())
        .query(`
          UPDATE settings
          SET setting_value = @value, updated_at = @updated_at
          WHERE setting_key = 'program_end_date'
        `);
    } else {
      // Insert new
      await pool.request()
        .input('key', sql.NVarChar, 'program_end_date')
        .input('value', sql.NVarChar, program_end_date)
        .input('created_at', sql.DateTime, new Date())
        .query(`
          INSERT INTO settings (setting_key, setting_value, created_at)
          VALUES (@key, @value, @created_at)
        `);
    }

    return res.status(200).json({
      message: 'Program end date updated successfully',
      program_end_date
    });
  } catch (err) {
    console.error('Update program settings error:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

export default router;
