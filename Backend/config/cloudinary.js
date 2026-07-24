import { v2 as cloudinary } from 'cloudinary'
import { log } from 'console'
import dotenv from 'dotenv'
dotenv.config()
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
})
// filePath is that image that come from frontend 
// fs is used to delete the file from local server as it is uploaded on cloudinary 
const uploadOnCloudinary = async (filePath) => {
    try {
        if(!filePath){
            return null
        }
        const res = await cloudinary.uploader.upload(filePath)
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
        return res.secure_url

        
    } catch (error) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
        console.log(error)
    }
}
export default uploadOnCloudinary
