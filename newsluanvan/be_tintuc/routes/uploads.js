// routes/upload.js
import express from 'express';
const router = express.Router();

router.post('/', (req, res) => {
  // Xử lý upload
  res.json({ message: 'Upload thành công!' });
});

export default router;
