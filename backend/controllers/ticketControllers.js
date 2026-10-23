const Ticket = require("../models/Ticket");
const { sendEmailNotification } = require("../utils/emailService");

// @desc    Create a new ticket
// @route   POST /api/tickets
// @access  Private (Customers only)
const createTicket = async (req, res) => {
  try {
    // Role check: Only customers have the privilege to create tickets
    if (req.user.role !== "customer") {
      return res.status(403).json({
        message: "Access denied. Only customers are permitted to create support tickets. Agents and administrators manage existing tickets.",
      });
    }

    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" });
    }
    const { title, description, category, priority } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Please provide both title and description" });
    }

    const ticketData = {
      title: title.trim(),
      description: description.trim(),
      category: category || "General",
      priority: priority || "Low",
      createdBy: req.user._id,
      comments: [],
    };

    // Handle file upload (Base64 data URI for 100% serverless persistence)
    if (req.file) {
      const base64Data = req.file.buffer.toString("base64");
      ticketData.attachment = {
        filename: req.file.originalname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: `data:${req.file.mimetype};base64,${base64Data}`,
      };
    }

    const ticket = await Ticket.create(ticketData);

    const populatedTicket = await ticket.populate("createdBy", "name email role");

    // Send email confirmation
    sendEmailNotification({
      to: req.user.email,
      subject: `Ticket Created: ${populatedTicket.title} (#${populatedTicket._id.toString().slice(-6).toUpperCase()})`,
      text: `Hello ${req.user.name},\n\nYour support ticket has been received:\n\nTitle: ${populatedTicket.title}\nCategory: ${populatedTicket.category}\nPriority: ${populatedTicket.priority}\n\nOur team is reviewing it.`,
    });

    res.status(201).json(populatedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tickets (Customer gets own, Agent gets assigned, Admin gets all)
// @route   GET /api/tickets
// @access  Private
const getTickets = async (req, res) => {
  try {
    let query = {};

    // Role-based visibility
    if (req.user.role === "customer") {
      query.createdBy = req.user._id;
    } else if (req.user.role === "agent") {
      query.assignedTo = req.user._id;
    }

    // Optional query filters
    if (req.query.status && req.query.status !== "All") {
      query.status = req.query.status;
    }
    if (req.query.priority && req.query.priority !== "All") {
      query.priority = req.query.priority;
    }
    if (req.query.category && req.query.category !== "All") {
      query.category = req.query.category;
    }
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Ticket.countDocuments(query);

    const tickets = await Ticket.find(query)
      .select("-attachment.url") // Exclude heavy base64 url from list queries to keep payload lightweight
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .populate("comments.sender", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get ticket stats
// @route   GET /api/tickets/stats
// @access  Private
const getStats = async (req, res) => {
  try {
    const matchStage = {};

    // Customer only sees their own ticket stats; Agent only sees assigned ticket stats
    if (req.user.role === "customer") {
      matchStage.createdBy = req.user._id;
    } else if (req.user.role === "agent") {
      matchStage.assignedTo = req.user._id;
    }

    const [statusCounts, byCategory, byPriority] = await Promise.all([
      Ticket.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      Ticket.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
      ]),
      Ticket.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: "$priority",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Build status count map
    const statusMap = {};
    statusCounts.forEach((s) => {
      statusMap[s._id] = s.count;
    });

    const total = (statusMap["Open"] || 0) + (statusMap["In Progress"] || 0) + (statusMap["Resolved"] || 0) + (statusMap["Closed"] || 0);

    res.json({
      total,
      open: statusMap["Open"] || 0,
      inProgress: statusMap["In Progress"] || 0,
      resolved: statusMap["Resolved"] || 0,
      closed: statusMap["Closed"] || 0,
      byCategory,
      byPriority,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single ticket by ID
// @route   GET /api/tickets/:id
// @access  Private
const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .populate("comments.sender", "name email role");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Customer can only view their own ticket
    if (req.user.role === "customer" && ticket.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view this ticket" });
    }
    // Agent can only view tickets assigned to them by admin
    if (req.user.role === "agent" && (!ticket.assignedTo || ticket.assignedTo._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: "Access denied. You can only view tickets assigned to you by an administrator." });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a ticket (Status, Assignee, Priority)
// @route   PUT /api/tickets/:id
// @access  Private
const updateTicket = async (req, res) => {
  try {
    const body = req.body || {};
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const oldStatus = ticket.status;
    // Customer can only edit details if ticket is still Open
    if (req.user.role === "customer") {
      if (body.status || body.priority || body.assignedTo !== undefined) {
        return res.status(403).json({ message: "Only Agents and Admins can update status, priority, or assignee" });
      }
      if (ticket.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized to modify this ticket" });
      }
      if (ticket.status !== "Open") {
        return res.status(400).json({ message: "Cannot edit ticket once it is in progress or resolved" });
      }
      ticket.title = body.title || ticket.title;
      ticket.description = body.description || ticket.description;
      ticket.category = body.category || ticket.category;
    } else if (req.user.role === "agent") {
      // Agent can ONLY update tickets assigned to them
      if (!ticket.assignedTo || ticket.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Access denied. You can only update tickets assigned to you." });
      }
      // Only Admin can assign/reassign tickets
      if (body.assignedTo !== undefined && body.assignedTo !== ticket.assignedTo.toString()) {
        return res.status(403).json({ message: "Only administrators can assign or reassign tickets." });
      }
      if (body.status) ticket.status = body.status;
      if (body.priority) ticket.priority = body.priority;
    } else {
      // Admin has full control (update status, priority, category, title, description, and assign agent)
      if (body.title) ticket.title = body.title;
      if (body.description) ticket.description = body.description;
      if (body.category) ticket.category = body.category;
      if (body.priority) ticket.priority = body.priority;
      if (body.status) ticket.status = body.status;
      if (body.assignedTo !== undefined) ticket.assignedTo = body.assignedTo || null;
    }

    const updated = await ticket.save();
    const populated = await updated.populate([
      { path: "createdBy", select: "name email role" },
      { path: "assignedTo", select: "name email role" },
      { path: "comments.sender", select: "name email role" },
    ]);

    if (body.status && body.status !== oldStatus && populated.createdBy?.email) {
      sendEmailNotification({
        to: populated.createdBy.email,
        subject: `Ticket Status Updated: ${populated.title} is now ${body.status}`,
        text: `Hello ${populated.createdBy.name},\n\nThe status of your ticket #${populated._id.toString().slice(-6).toUpperCase()} has been changed to "${body.status}".`,
      });
    }

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a message/comment to a ticket conversation
// @route   POST /api/tickets/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Comment message is required" });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Customers can only comment on their own tickets
    if (req.user.role === "customer" && ticket.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to reply to this ticket" });
    }
    // Agents can only comment on tickets assigned to them
    if (req.user.role === "agent" && (!ticket.assignedTo || ticket.assignedTo.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: "Access denied. You can only comment on tickets assigned to you." });
    }

    const comment = {
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      message: message.trim(),
      createdAt: new Date(),
    };

    ticket.comments.push(comment);

    // If an agent/admin replies and the ticket was Open, move to In Progress
    if (req.user.role !== "customer" && ticket.status === "Open") {
      ticket.status = "In Progress";
    }

    await ticket.save();

    const populated = await ticket.populate([
      { path: "createdBy", select: "name email role" },
      { path: "assignedTo", select: "name email role" },
      { path: "comments.sender", select: "name email role" },
    ]);

    // Send email notification on new comment
    if (populated.createdBy?.email) {
      sendEmailNotification({
        to: populated.createdBy.email,
        subject: `New response on ticket: ${populated.title}`,
        text: `New reply from ${comment.senderName} (${comment.senderRole}):\n\n"${comment.message}"`,
      });
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    List comments of a ticket
// @route   GET /api/tickets/:id/comments
// @access  Private (Owner / Agent / Admin)
const getTicketComments = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate("comments.sender", "name email role");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Customer can only view comments of their own ticket
    if (req.user.role === "customer" && ticket.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view comments for this ticket" });
    }

    res.json(ticket.comments || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a ticket
// @route   DELETE /api/tickets/:id
// @access  Private (Admin only)
const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized: Only administrators can delete tickets" });
    }

    await ticket.deleteOne();
    res.json({ message: "Ticket deleted successfully", ticketId: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit 5-star customer feedback on resolved/closed ticket
// @route   POST /api/tickets/:id/feedback
// @access  Private (Owner / Customer)
const submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body || {};
    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ message: "Please provide a rating between 1 and 5 stars" });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Only ticket creator can rate (or admin testing)
    if (ticket.createdBy.toString() !== req.user._id.toString() && req.user.role === "customer") {
      return res.status(403).json({ message: "Only the customer who raised this ticket can submit feedback" });
    }

    // Check if ticket is resolved or closed
    if (ticket.status !== "Resolved" && ticket.status !== "Closed") {
      return res.status(400).json({ message: "Feedback can only be submitted for Resolved or Closed tickets" });
    }

    ticket.feedback = {
      rating: Number(rating),
      comment: (comment || "").trim(),
      createdAt: new Date(),
    };

    await ticket.save();

    const populated = await ticket.populate([
      { path: "createdBy", select: "name email role" },
      { path: "assignedTo", select: "name email role" },
      { path: "comments.sender", select: "name email role" },
    ]);

    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  getStats,
  updateTicket,
  addComment,
  getTicketComments,
  submitFeedback,
  deleteTicket,
};
