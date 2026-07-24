import express from 'express'
import User from '../models/user.model.js'
import { logIN, logOUT, signUP } from '../controllers/auth.controller.js'

const authRouter = express.Router()

authRouter.post("/signup",signUP)
authRouter.post("/signin",logIN)
authRouter.get("/signout",logOUT)

export default authRouter