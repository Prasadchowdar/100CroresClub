import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getPool, sql } from '../config/database.js';
import { authenticateAdmin } from './admin.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Create uploads directory if not exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max
  }
});

// Upload single file
router.post('/upload', authenticateAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const pool = getPool();
    const mediaId = uuidv4();
    const { title, description, category } = req.body;

    await pool.request()
      .input('id', sql.NVarChar, mediaId)
      .input('filename', sql.NVarChar, req.file.filename)
      .input('original_name', sql.NVarChar, req.file.originalname)
      .input('mimetype', sql.NVarChar, req.file.mimetype)
      .input('size', sql.BigInt, req.file.size)
      .input('path', sql.NVarChar, req.file.path)
      .input('title', sql.NVarChar, title || null)
      .input('description', sql.NVarChar, description || null)
      .input('category', sql.NVarChar, category || 'general')
      .input('uploaded_by', sql.NVarChar, req.admin.id)
      .input('created_at', sql.DateTime, new Date())
      .query(`
        INSERT INTO media (id, filename, original_name, mimetype, size, path, title, description, category, uploaded_by, created_at)
        VALUES (@id, @filename, @original_name, @mimetype, @size, @path, @title, @description, @category, @uploaded_by, @created_at)
      `);

    return res.status(201).json({
      message: 'File uploaded successfully',
      media: {
        id: mediaId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`
      }
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// Upload multiple files
router.post('/upload-multiple', authenticateAdmin, upload.array('files', 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  try {
    const pool = getPool();
    const { category } = req.body;
    const uploadedMedia = [];

    for (const file of req.files) {
      const mediaId = uuidv4();

      await pool.request()
        .input('id', sql.NVarChar, mediaId)
        .input('filename', sql.NVarChar, file.filename)
        .input('original_name', sql.NVarChar, file.originalname)
        .input('mimetype', sql.NVarChar, file.mimetype)
        .input('size', sql.BigInt, file.size)
        .input('path', sql.NVarChar, file.path)
        .input('category', sql.NVarChar, category || 'general')
        .input('uploaded_by', sql.NVarChar, req.admin.id)
        .input('created_at', sql.DateTime, new Date())
        .query(`
          INSERT INTO media (id, filename, original_name, mimetype, size, path, title, description, category, uploaded_by, created_at)
          VALUES (@id, @filename, @original_name, @mimetype, @size, @path, NULL, NULL, @category, @uploaded_by, @created_at)
        `);

      uploadedMedia.push({
        id: mediaId,
        filename: file.filename,
        originalName: file.originalname,
        url: `/uploads/${file.filename}`
      });
    }

    return res.status(201).json({
      message: `${uploadedMedia.length} files uploaded successfully`,
      media: uploadedMedia
    });
  } catch (err) {
    console.error('Upload multiple error:', err);
    return res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// Get all media
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const pool = getPool();
    const { category } = req.query;

    let result;
    if (category) {
      result = await pool.request()
        .input('category', sql.NVarChar, category)
        .query('SELECT * FROM media WHERE category = @category ORDER BY created_at DESC');
    } else {
      result = await pool.request()
        .query('SELECT * FROM media ORDER BY created_at DESC');
    }

    const media = result.recordset.map(m => ({
      ...m,
      url: `/uploads/${m.filename}`
    }));

    return res.status(200).json(media);
  } catch (err) {
    console.error('Get media error:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Get single media
router.get('/:id', async (req, res) => {
  try {
    const pool = getPool();

    const result = await pool.request()
      .input('id', sql.NVarChar, req.params.id)
      .query('SELECT * FROM media WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Media not found' });
    }

    const media = result.recordset[0];
    return res.status(200).json({
      ...media,
      url: `/uploads/${media.filename}`
    });
  } catch (err) {
    console.error('Get media error:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Delete media
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const pool = getPool();

    const result = await pool.request()
      .input('id', sql.NVarChar, req.params.id)
      .query('SELECT * FROM media WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Media not found' });
    }

    const media = result.recordset[0];

    // Delete file from disk
    if (fs.existsSync(media.path)) {
      fs.unlinkSync(media.path);
    }

    // Delete from database
    await pool.request()
      .input('id', sql.NVarChar, req.params.id)
      .query('DELETE FROM media WHERE id = @id');

    return res.status(200).json({ message: 'Media deleted successfully' });
  } catch (err) {
    console.error('Delete media error:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

export default router;
