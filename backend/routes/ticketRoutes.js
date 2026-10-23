const express = require("express");
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicketById,
  getStats,
  updateTicket,
  addComment,
  getTicketComments,
  submitFeedback,
  deleteTicket,
} = require("../controllers/ticketControllers");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

// All ticket routes require authentication
router.use(protect);

router.route("/")
  .post(upload.single("attachment"), createTicket)
  .get(getTickets);

// Stats route BEFORE /:id to avoid route conflict
router.get("/stats", getStats);

router.route("/:id")
  .get(getTicketById)
  .put(updateTicket)
  .patch(updateTicket)
  .delete(deleteTicket);

router.route("/:id/comments")
  .post(addComment)
  .get(getTicketComments);

router.post("/:id/feedback", submitFeedback);

module.exports = router;
