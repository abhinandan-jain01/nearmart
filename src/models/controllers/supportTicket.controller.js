import SupportTicket from '../models/supportTicket.model.js';
import notificationService from '../services/notification.service.js';

// Create a new support ticket
export const createTicket = async (req, res) => {
  try {
    const { subject, category, priority, message, orderId, retailerId } = req.body;
    const customerId = req.user._id;

    const ticket = new SupportTicket({
      customerId,
      retailerId,
      orderId,
      subject,
      category,
      priority,
      messages: [{
        senderId: customerId,
        senderType: 'Customer',
        message
      }]
    });

    await ticket.save();

    // Send notification to support team
    await notificationService.sendNotification({
      userId: 'support-team', // This should be replaced with actual support team ID
      userType: 'Support',
      type: 'new_ticket',
      title: 'New Support Ticket',
      message: `New ticket created: ${subject}`,
      data: { ticketId: ticket._id }
    });

    res.status(201).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all tickets for a customer
export const getCustomerTickets = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { customerId };
    if (status) query.status = status;

    const tickets = await SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('retailerId', 'name')
      .populate('orderId', 'orderNumber');

    const total = await SupportTicket.countDocuments(query);

    res.json({
      success: true,
      data: tickets,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get ticket details
export const getTicketDetails = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.ticketId)
      .populate('customerId', 'name email')
      .populate('retailerId', 'name')
      .populate('orderId', 'orderNumber')
      .populate('assignedTo', 'name');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && 
        ticket.customerId._id.toString() !== req.user._id.toString() &&
        (!ticket.retailerId || ticket.retailerId._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this ticket'
      });
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Add message to ticket
export const addMessage = async (req, res) => {
  try {
    const { message, attachments } = req.body;
    const ticket = await SupportTicket.findById(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && 
        ticket.customerId.toString() !== req.user._id.toString() &&
        (!ticket.retailerId || ticket.retailerId.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to add message to this ticket'
      });
    }

    const newMessage = {
      senderId: req.user._id,
      senderType: req.user.role === 'admin' ? 'Support' : req.user.role === 'retailer' ? 'Retailer' : 'Customer',
      message,
      attachments
    };

    ticket.messages.push(newMessage);
    await ticket.save();

    // Send notification to other participants
    const notificationRecipients = [ticket.customerId];
    if (ticket.retailerId) notificationRecipients.push(ticket.retailerId);
    if (ticket.assignedTo) notificationRecipients.push(ticket.assignedTo);

    for (const recipient of notificationRecipients) {
      if (recipient.toString() !== req.user._id.toString()) {
        await notificationService.sendNotification({
          userId: recipient,
          userType: recipient === ticket.customerId ? 'Customer' : 'Retailer',
          type: 'ticket_message',
          title: 'New Message in Support Ticket',
          message: `New message in ticket: ${ticket.subject}`,
          data: { ticketId: ticket._id }
        });
      }
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update ticket status
export const updateTicketStatus = async (req, res) => {
  try {
    const { status, resolution } = req.body;
    const ticket = await SupportTicket.findById(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Only admin or assigned support staff can update status
    if (req.user.role !== 'admin' && 
        (!ticket.assignedTo || ticket.assignedTo.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update ticket status'
      });
    }

    ticket.status = status;
    if (status === 'resolved') {
      ticket.resolution = resolution;
      ticket.resolvedAt = new Date();
    } else if (status === 'closed') {
      ticket.closedAt = new Date();
    }

    await ticket.save();

    // Send notification to customer
    await notificationService.sendNotification({
      userId: ticket.customerId,
      userType: 'Customer',
      type: 'ticket_status_update',
      title: 'Support Ticket Status Updated',
      message: `Your ticket "${ticket.subject}" has been ${status}`,
      data: { ticketId: ticket._id }
    });

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Submit customer satisfaction feedback
export const submitFeedback = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const ticket = await SupportTicket.findById(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Only customer can submit feedback
    if (ticket.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to submit feedback for this ticket'
      });
    }

    ticket.customerSatisfaction = {
      rating,
      feedback
    };

    await ticket.save();

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}; 