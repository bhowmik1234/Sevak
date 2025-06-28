import express from 'express';
import formData from '../models/formModel.js';

const router = express.Router();

// GET all reports
router.get('/ReportForm', async (req, res) => {
  try {
    const users = await formData.find();
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

// POST new report
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
      latitude,   
      longitude   
    } = req.body;

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
      latitude,    
      longitude    
    });

    await newData.save();

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully.',
      data: newData,
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

export default router;
