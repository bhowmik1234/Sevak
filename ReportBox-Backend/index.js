import 'dotenv/config';
import express from 'express';
import connectDB from './db.js';
import cors from 'cors';
import form from './routes/form.js';
import otpRoutes from './routes/otp.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Restrict CORS to the configured frontend when set; otherwise allow all (dev).
const corsOptions = process.env.FRONTEND_URL
  ? { origin: process.env.FRONTEND_URL }
  : {};
app.use(cors(corsOptions));

app.use(express.json());
connectDB();

app.use('/api', form);
app.use('/api', otpRoutes);
app.use('/api', adminRoutes);

app.get('/', (req, res) => {
  res.send('hello');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
