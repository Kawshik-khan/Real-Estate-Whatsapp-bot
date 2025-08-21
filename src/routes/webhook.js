import express from 'express';
import { validateWebhook, handleIncomingMessage } from '../controllers/messageController.js';
import { validateMetaWebhook } from '../middleware/validation.js';

const router = express.Router();

// Meta (GET) verification endpoint
router.get('/', validateWebhook);

// Meta (POST) incoming messages
router.post('/', validateMetaWebhook, handleIncomingMessage);

export default router;


