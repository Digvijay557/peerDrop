const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contact: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

// Prevent duplicate contact entries for the same owner
contactSchema.index({ owner: 1, contact: 1 }, { unique: true });

const Contact = mongoose.model("Contact", contactSchema);

module.exports = { Contact };
