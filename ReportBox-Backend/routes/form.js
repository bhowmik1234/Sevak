import express from 'express';
import formData from '../models/formModel.js';

const router = express.Router();

//read
router.get('/ReportForm', async(req,res) => {
    try{
        const users  = await formData.find();
        res.status(200).json(users);
    }catch(err){
        res.status(500).json({
            message: err.message
        })
    }
})

//create
router.post('/ReportForm', async(req,res) => {
    try{
        const {name,email,phone,location,category,title,description,priority,mediaURL} = req.body;
        const newData = new formData({name,email,phone,location,category,title,description,priority,mediaURL})
        await newData.save();
        res.status(200).json({
            success:true,
            user: newData
        })
    }catch(err){
        res.status(500).json({
            message: err.message
        })
    }
})

export default router;
