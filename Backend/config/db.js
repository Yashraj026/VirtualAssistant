import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Database Connected")
        console.log("Database:", mongoose.connection.name);
        console.log("Host:", mongoose.connection.host);
    } catch (error) {
        console.log("DataBase Error : ",error);
        
    }
}
export default connectDB