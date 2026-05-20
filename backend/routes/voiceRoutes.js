const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/authMiddleware');
const { processVoice, transcribeAudio } = require('../services/OpenAIService');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({ dest: uploadsDir });

router.post('/transcribe', protect, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No audio file provided.' });
    }

    const transcription = await transcribeAudio(req.file.path);
    await fs.promises.unlink(req.file.path).catch(() => {});

    res.json({ success: true, data: { text: transcription } });
  } catch (error) {
    console.error('Transcription error:', error);
    if (req.file?.path) {
      await fs.promises.unlink(req.file.path).catch(() => {});
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/respond', protect, async (req, res) => {
  try {
    const { message, language } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const parsed = await processVoice(message, language);
    res.json({ success: true, data: parsed });
  } catch (error) {
    console.error('Respond error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
