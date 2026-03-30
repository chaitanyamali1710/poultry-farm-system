const express = require("express");
const Notification = require("../models/Notification");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const query = req.user.isAdmin
      ? { audience: "admin" }
      : {
          $or: [
            { audience: "user", recipient: req.user._id },
            { audience: "system", recipient: req.user._id }
          ]
        };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id/read", protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    const allowed =
      req.user.isAdmin ||
      (notification.recipient && notification.recipient.toString() === req.user._id.toString());

    if (!allowed) {
      return res.status(403).json({ message: "Access denied" });
    }

    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
