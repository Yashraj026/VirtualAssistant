import genToken from '../config/token.js'
import User from '../models/user.model.js'
import dotenv from 'dotenv'
dotenv.config()
import bcrypt from 'bcryptjs'
import { log } from 'console'
// import uploadOnCloudinary from '../config/cloudinary.js'

// Sign_UP Function

export const signUP = async (req,res) => {
    try {
        const {name,email,password} = req.body

        // check wheter all details send by client or not
        if(!name || !email || !password){
            return res.status(400).json({message : "Send All Details"})
        }

        // checking existing Email 
        const existEmail = await User.findOne({email : email})
        if(existEmail) {
            return res.status(400).json({message : "Email Already Exist"})
        }
        // check password Size >= 6
        if(password.length < 6) {
            return res.status(400).json({message : "Password must be atleast 6 characters !"})
        }

        // hass the password using bcryptjs
        const hassedPassword = await bcrypt.hash(password,10)

        // createing new User 
        const user = await User.create({
                name,email,password : hassedPassword 
            }
        )
        // token generation
        let token;
        try {
            token = genToken(user._id)
        } catch (error) {
            console.log(error)         
        }
        res.cookie("token",token,{
            httpOnly : true,
            secure : true,
            sameSite : "none",
            maxAge : 7*24*60*60*1000
        })
        return res.status(201).json(user)

    } catch (error) {
        return res.status(500).json({message : "Internal Server Error"})
    }
}

// Log-In Function

export const logIN = async (req,res) => {
    try {
        const {email,password} = req.body

        // checking existing Email

        const user = await User.findOne({email : email})
        if(!user) {
            return res.status(400).json({message : "User Not Exist! Please SignUp First"})
        }

        // comparing the password 
        let match = await bcrypt.compare(password, user.password)
        if(!match) {
            return res.status(400).json({message : "Incorrect Password"})
        }

        // token generation
        let token;
        try {
            token = genToken(user._id)
        } catch (error) {
            console.log(error)         
        }
        res.cookie("token",token,{
            httpOnly : true,
            secure : false,
            sameSite : "strict",
            maxAge : 7*24*60*60*1000
        })


        return res.status(200).json(user)
        
    } catch (error) {
        return res.status(500).json({message : "Internal Server Error"})
    }
}

// Log-Out Function

export const logOUT = async (req,res) => {
    try {
        res.clearCookie("token")
        return res.status(200).json({message : "LogOut Successfully"})

    } catch (error) {
        return res.status(500).json({message : "Internal Server Error"})
    }
}
