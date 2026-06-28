import express from 'express';
import crypto from 'crypto';
import formData from '../models/formModel.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

const ALLOWED_STATUSES = ['pending', 'in-progress', 'resolved'];

// Human-friendly public id, e.g. "SVK-3F9A2C7B1D".
const generateTrackingId = () =>
  `SVK-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;

// GET all reports (admin only)
router.get('/ReportForm', adminAuth, async (req, res) => {
  try {
    const users = await formData.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'Report data fetched successfully.',
      data: users,
      statusCode: 200
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report data.',
      errors: { exception: err.message },
      statusCode: 500
    });
  }
});

// POST new report (public — citizens submit)
router.post('/ReportForm', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      location,
      category,
      title,
      description,
      priority,
      mediaURL,
      mediaURLs,
      latitude,
      longitude
    } = req.body;

    // Basic required-field validation
    const missing = ['name', 'email', 'location', 'category', 'title', 'description']
      .filter((field) => !req.body[field]);
    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields.',
        errors: { fields: missing },
        statusCode: 400
      });
    }

    const newData = new formData({
      name,
      email,
      phone,
      location,
      category,
      title,
      description,
      priority,
      mediaURL,
      mediaURLs: Array.isArray(mediaURLs) ? mediaURLs : [],
      latitude,
      longitude,
      trackingId: generateTrackingId(),
      statusHistory: [{ status: 'pending', note: 'Report received.' }]
    });

    // Regenerate the tracking id on the rare chance of a unique-index collision.
    let attempts = 0;
    while (attempts < 3) {
      try {
        await newData.save();
        break;
      } catch (saveErr) {
        if (saveErr.code === 11000 && saveErr.keyPattern?.trackingId && attempts < 2) {
          newData.trackingId = generateTrackingId();
          attempts += 1;
          continue;
        }
        throw saveErr;
      }
    }

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully.',
      data: newData,
      trackingId: newData.trackingId,
      statusCode: 201
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit report.',
      errors: { exception: err.message },
      statusCode: 500
    });
  }
});

// GET a single report's status by public tracking id (citizen-facing, no auth)
router.get('/ReportForm/track/:trackingId', async (req, res) => {
  try {
    const report = await formData
      .findOne({ trackingId: req.params.trackingId.trim() })
      .select('trackingId title category status statusHistory createdAt location');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'No report found for that tracking ID.',
        errors: { trackingId: 'Unknown tracking ID.' },
        statusCode: 404
      });
    }

    res.status(200).json({
      success: true,
      message: 'Report status fetched successfully.',
      data: report,
      statusCode: 200
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report status.',
      errors: { exception: err.message },
      statusCode: 500
    });
  }
});

// PATCH report status (admin only)
router.patch('/ReportForm/:id', adminAuth, async (req, res) => {
  try {
    const { status, note } = req.body;

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value.',
        errors: { status: `Status must be one of: ${ALLOWED_STATUSES.join(', ')}` },
        statusCode: 400
      });
    }

    const updated = await formData.findByIdAndUpdate(
      req.params.id,
      {
        status,
        $push: {
          statusHistory: { status, note: note || `Status changed to ${status}.` }
        }
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.',
        errors: { id: 'No report with the given id.' },
        statusCode: 404
      });
    }

    res.status(200).json({
      success: true,
      message: 'Report status updated successfully.',
      data: updated,
      statusCode: 200
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update report status.',
      errors: { exception: err.message },
      statusCode: 500
    });
  }
});

export default router;
