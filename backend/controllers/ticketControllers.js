const Ticket = require("../models/Ticket");
const User = require("../models/user");
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
    const open = statusMap["Open"] || 0;
    const inProgress = statusMap["In Progress"] || 0;
    const resolved = statusMap["Resolved"] || 0;
    const closed = statusMap["Closed"] || 0;
    const unresolved = open + inProgress;

    res.json({
      total,
      open,
      inProgress,
      resolved,
      closed,
      unresolved,
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
      const isAssigned =
        ticket.assignedTo &&
        ticket.assignedTo.toString() === req.user._id.toString();

      if (!isAssigned) {
        return res.status(403).json({
          message: "Access denied. You can only update tickets assigned to you by an administrator.",
        });
      }

      // Agents are only allowed to update the status of the ticket
      if (body.status) {
        ticket.status = body.status;
      }
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

    // Only the customer who raised this ticket can submit rating/feedback
    if (req.user.role !== "customer" || ticket.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied. Only the customer who raised this ticket can submit feedback and rating." });
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

// @desc    Get Agent Performance metrics (Admin only)
// @route   GET /api/tickets/agent-performance
// @access  Private (Admin only)
const getAgentPerformance = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Only administrators have privilege to view agent performance analytics.",
      });
    }

    // Find all users who are registered as agents (or admins assigned tickets)
    const agents = await User.find({ role: { $in: ["agent", "admin"] } })
      .select("_id name email role createdAt")
      .sort({ role: 1, name: 1 });

    // Fetch all tickets to calculate metrics accurately
    const tickets = await Ticket.find({})
      .select("title category priority status assignedTo createdBy feedback createdAt updatedAt")
      .populate("createdBy", "name email");

    // Compute metrics per agent
    const agentStats = agents.map((agent) => {
      const agentIdStr = agent._id.toString();
      const assignedTickets = tickets.filter(
        (t) => t.assignedTo && t.assignedTo.toString() === agentIdStr
      );

      const totalAssigned = assignedTickets.length;
      const openCount = assignedTickets.filter((t) => t.status === "Open").length;
      const inProgressCount = assignedTickets.filter((t) => t.status === "In Progress").length;
      const resolvedCount = assignedTickets.filter((t) => t.status === "Resolved").length;
      const closedCount = assignedTickets.filter((t) => t.status === "Closed").length;
      const completedCount = resolvedCount + closedCount;

      const resolutionRate = totalAssigned > 0
        ? Math.round((completedCount / totalAssigned) * 100)
        : 0;

      // Customer feedback & ratings
      const ratedTickets = assignedTickets.filter((t) => t.feedback && t.feedback.rating);
      const totalRatings = ratedTickets.length;
      const sumRatings = ratedTickets.reduce((acc, t) => acc + Number(t.feedback.rating), 0);
      const avgRating = totalRatings > 0 ? parseFloat((sumRatings / totalRatings).toFixed(1)) : 0;

      // Customer reviews list
      const customerReviews = ratedTickets
        .map((t) => ({
          ticketId: t._id,
          ticketTitle: t.title,
          customerName: t.createdBy?.name || "Customer",
          customerEmail: t.createdBy?.email || "",
          rating: t.feedback.rating,
          comment: t.feedback.comment || "",
          createdAt: t.feedback.createdAt || t.updatedAt,
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const byPriority = {
        Urgent: assignedTickets.filter((t) => t.priority === "Urgent").length,
        High: assignedTickets.filter((t) => t.priority === "High").length,
        Medium: assignedTickets.filter((t) => t.priority === "Medium").length,
        Low: assignedTickets.filter((t) => t.priority === "Low").length,
      };

      return {
        _id: agent._id,
        name: agent.name,
        email: agent.email,
        role: agent.role,
        joinedAt: agent.createdAt,
        totalAssigned,
        openCount,
        inProgressCount,
        resolvedCount,
        closedCount,
        completedCount,
        resolutionRate,
        avgRating,
        totalRatings,
        customerReviews,
        byPriority,
      };
    });

    // Team summary metrics across all support agents
    const onlyAgents = agentStats.filter((a) => a.role === "agent");
    const totalAgents = onlyAgents.length;
    const totalAssignedTeam = agentStats.reduce((sum, a) => sum + a.totalAssigned, 0);
    const totalResolvedTeam = agentStats.reduce((sum, a) => sum + a.completedCount, 0);
    const overallTeamResolutionRate = totalAssignedTeam > 0
      ? Math.round((totalResolvedTeam / totalAssignedTeam) * 100)
      : 0;

    const totalTeamReviews = agentStats.reduce((sum, a) => sum + a.totalRatings, 0);
    const sumAllRatings = agentStats.reduce((sum, a) => sum + (a.avgRating * a.totalRatings), 0);
    const teamAvgRating = totalTeamReviews > 0
      ? parseFloat((sumAllRatings / totalTeamReviews).toFixed(1))
      : 5.0;

    res.json({
      summary: {
        totalAgents,
        totalAssignedTeam,
        totalResolvedTeam,
        overallTeamResolutionRate,
        teamAvgRating,
        totalTeamReviews,
      },
      agents: agentStats,
    });
  } catch (error) {
    console.error("Agent performance error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  getStats,
  getAgentPerformance,
  updateTicket,
  addComment,
  getTicketComments,
  submitFeedback,
  deleteTicket,
};
