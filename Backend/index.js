import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"])
import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import connectDB from './config/db.js'
import cors from 'cors'
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js"
import cookieParser from "cookie-parser";
import geminiResponse from "./gemini.js";


const app = express()
const port = process.env.PORT || 8080
app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
app.use(express.json())
app.use('/api/auth',authRouter)
app.use('/api/user',userRouter)
app.get("/", async (req, res) => {
  try {
    const prompt = req.query.prompt;
    const output = await geminiResponse(prompt);

    if (!output) {
      return res.status(500).json({ error: "No output from Gemini" });
    }

    res.json({ response: output });
  } catch (err) {
    console.error("Error in / route:", err);
    res.status(500).json({ error: "Server error" });
  }
});


connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
});