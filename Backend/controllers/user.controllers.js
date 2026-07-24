import User from '../models/user.model.js'
import uploadOnCloudinary from '../config/cloudinary.js'
import geminiResponse from '../gemini.js'
import moment from 'moment'


export const getCurrentUser = async (req,res) =>{
    try {
        const userId = req.userId
        const user = await User.findById(userId).select("-password")
        if(!user){
            return res.status(400).json({messsage: "user not found"})
        }

        return res.status(200).json(user)
    } catch (error) {
        return res.status(400).json({messsage: "get current user error"})
    }
}

export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, imageUrl } = req.body
    let assistantImage

    if (req.file) {
      // Multer saved the file locally
      assistantImage = await uploadOnCloudinary(req.file.path)
    } else if (imageUrl) {
      // Pre‑selected image case
      assistantImage = imageUrl
    } else {
      return res.status(400).json({ message: "No image provided" })
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { assistantName, assistantImage },
      { new: true }
    ).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    return res.status(200).json(user)
  } catch (error) {
    console.error("Update Assistant Error:", error)
    return res.status(500).json({ message: "Update Assistant Error" })
  }
}


export const askToAssistant = async (req,res) => {
  try {
    const {command} = req.body
    const user = await User.findById(req.userId)
    user.history.push(command)
    user.save()
    const userName = user.name
    const assistantName = user.assistantName
    const result = await geminiResponse(command,assistantName,userName)
    const jsonMatch = result.match(/{[\s\S]*}/)

    if(!jsonMatch){
      return res.status(400).json({message:"Sorry, I cant understand"})
    }
    const gemResult = JSON.parse(jsonMatch[0])
    const type = gemResult.type

    switch(type){
      case 'get_date' : 
        return res.json({
          type,
          userinput : gemResult.userinput,
          response : `Current date is ${moment().format("YYYY-MM-DD")}`

        });
      case 'get_time' : 
        return res.json({
          type,
          userinput : gemResult.userinput,
          response : `Current time is ${moment().format("hh:mm A")}`

        });
      case 'get_day' : 
        return res.json({
          type,
          userinput : gemResult.userinput,
          response : `Current day is ${moment().format("dddd")}`

        });
      case 'get_month' : 
        return res.json({
          type,
          userinput : gemResult.userinput,
          response : `Current month is ${moment().format("MMMM")}`
        });


      case 'google_search' :
      case 'youtube_search':
      case 'youtube_play' :
      case 'general' :
      case 'calculator_open' :
      case 'instagram_open' :
      case 'facebook_open' :
      case 'weather-show' :
        return res.json({
            type,
            userinput : gemResult.userinput,
            response : gemResult.response,
          });

      default : 
      return res.status(400).json({response : "I didn't understand that command"})


    }
  } catch (error) {
      return res.status(500).json({response : "Ask Assistant Error"})
    
  }
}