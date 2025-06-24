import { Schema, model } from "mongoose";

const formData = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: 50
  },
  email: {
    type: String, // ✅ Fix: "email" is not a valid type
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const formModel = model("formData", formData);
export default formModel; // ✅ ES Module export
