import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import {
  createTicket,
  getCustomerTickets,
  getTicketDetails,
  addMessage,
  updateTicketStatus,
  submitFeedback
} from '../controllers/supportTicket.controller.js';

const router = express.Router();

// Customer routes
router.post('/', auth, createTicket);
router.get('/', auth, getCustomerTickets);
router.get('/:ticketId', auth, getTicketDetails);
router.post('/:ticketId/message', auth, addMessage);
router.post('/:ticketId/feedback', auth, submitFeedback);

// Admin routes
router.put('/:ticketId/status', auth, authorize(['admin']), updateTicketStatus);

export default router; 