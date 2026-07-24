import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()
const genToken =  (userId) => {
    let token = jwt.sign({userId},process.env.JWT_SECRET,{expiresIn : '10d'})
    return token
}
export default genToken