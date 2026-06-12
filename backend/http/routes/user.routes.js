import express from 'express'
import { ensureConversation, getFriends, getMessages, searchUsers } from '../controllers/user.controller.js';
const router = express.Router();

router.get('/friends',getFriends)
router.get('/messages',getMessages);
router.get('/search', searchUsers);
router.post('/conversation/ensure', ensureConversation);

export default router;
