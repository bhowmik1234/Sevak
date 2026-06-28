import { Schema, model } from "mongoose";

const formData = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: 50
  },
  email: {
    type: String, 
    required: true
  },
  phone: {
    type: Number,
    maxlength: 10
  },
  location: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    required: true
  },
  mediaURL: {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "resolved"],
    default: "pending"
  },
  // Public, human-friendly id citizens use to track their report's status.
  trackingId: {
    type: String,
    unique: true,
    index: true
  },
  // Append-only timeline of status changes shown on the tracking page.
  statusHistory: [
    {
      status: {
        type: String,
        enum: ["pending", "in-progress", "resolved"]
      },
      note: { type: String },
      changedAt: { type: Date, default: Date.now }
    }
  ],
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const formModel = model("formData", formData);
export default formModel; 
