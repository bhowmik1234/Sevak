import 'dotenv/config'; 
import express from 'express';
import connectDB from './db.js';
import cors from 'cors';
import form from './routes/form.js';
import otpRoutes from './routes/otp.js'; 

const app = express();
const PORT = 3000;

app.use(cors())

app.use(express.json());
connectDB(); 

app.use('/api',form); 


app.use('/api', otpRoutes);

app.get('/',(req,res) => {
    console.log("Route");
    res.send("hello");
})


app.listen(PORT,() =>{
    console.log("Server is running");
})