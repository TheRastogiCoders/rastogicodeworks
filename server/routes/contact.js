import { Router } from 'express';

export const contactRouter = Router();

contactRouter.post('/', (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and message are required.',
      });
    }
    // In production: send email, save to DB, etc.
    console.log('Contact submission:', { name, email, phone, subject, message });
    res.status(200).json({
      success: true,
      message: 'Thank you! We will get back to you soon.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});
