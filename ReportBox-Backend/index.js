import express from 'express'
import 'dotenv/config'
import connectDB from './db.js'
import form from './routes/form.js';
import cors  from 'cors';

const app = express();
const PORT = 3000;

app.use(cors())

app.use(express.json());
connectDB(); 

app.use('/api',form); 

app.get('/',(req,res) => {
    console.log("Route");
    res.send("hello");
})


app.listen(PORT,() =>{
    console.log("Server is running");
})