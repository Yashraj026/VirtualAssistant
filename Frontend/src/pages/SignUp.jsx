import React, { useContext, useState } from 'react'
import bg from '../assets/bg-image.png'
import { IoEye } from "react-icons/io5";
import { IoEyeOff } from "react-icons/io5";
import { useNavigate } from 'react-router-dom'
import { userDataContext } from '../context/UserContext';
import axios from 'axios'

const SignUp = () => {
    const [showPassword, setShowPassword] = useState(false)
    let navigate = useNavigate()
    const {serverUrl,userData,setUserData} = useContext(userDataContext)
    const [name,setName] = useState("")
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const [err,setErr] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSignUp = async (e) => {
        e.preventDefault()
        setErr("")
        setLoading(true)

        try {
            let result = await axios.post(serverUrl + "/api/auth/signup",{
                name,email,password
            },{withCredentials:true})

            setUserData(result.data)
            setLoading(false)
            navigate("/customize")
            
        } catch (error) {
            console.log(error);
            setUserData(null)
            setLoading(false)
            setErr(error.response.data.message)
            
        }
    }






  return (
    <div className='w-full h-[100vh] bg-cover flex justify-center items-center' 
    style={{backgroundImage:`url(${bg})`,backgroundPosition: "center"}}>

        <form className='w-[90%] h-[600px] max-w-[500px] bg-[#00000069] backdrop-blur
        shadow-lg shadow-black flex flex-col justify-center items-center gap-[20px] px-[20px]' onSubmit={handleSignUp}>
            <h1 className='text-white text-[30px] font-semibold mb-[30px]'>Register to <span
            className='text-blue-400'>Virtual Assistant</span></h1>

            {/* Name Input */}

            <input type="text" placeholder='Enter your name'
            className='w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-400 px-[20px] py-[10px] rounded-full text-[18px]'
            value={name}
            required
            onChange={(e)=>setName(e.target.value)}
            />

            {/* Email Input */}

            <input type="email" placeholder='Email'
            className='w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-400 px-[20px] py-[10px] rounded-full text-[18px]'
            value={email}
            required
            onChange={(e)=>setEmail(e.target.value)}
            />

            {/* Password Input */}

            <div className='w-full h-[60px] border-2 border-white bg-transparent text-white rounded-full text-[18px] relative'>
                <input type={showPassword ? "text" : "password"} placeholder='Password'
                className='w-full h-full outline-none rounded-full bg-transparent px-[20px] py-[10px] placeholder-gray-400'
                required
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
            />
                {!showPassword && <IoEye className='absolute top-[17px] right-[20px] h-[25px] w-[25px] text-white cursor-pointer' onClick={()=>setShowPassword(true)}/>}
                {showPassword && <IoEyeOff className='absolute top-[17px] right-[20px] h-[25px] w-[25px] text-white cursor-pointer' onClick={()=>setShowPassword(false)}/>}
            </div>

            {err.length > 0  && <p className='text-red-500 text-[17px]'>
                *{err}
                </p>}
            {/* SUbmit  */}
            <button
            className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold bg-white rounded-full text-[19px]' disabled = {loading}
            >{loading ? "Loading..." : "Sign Up"}</button>

            <p className='text-white text-[18px] cursor-pointer'>Already have an acoount ? <span className='text-[#0ed3e1] cursor-pointer' onClick={()=>navigate("/signin")} >Sign In</span></p>
        </form>
        
    </div>
  )
}

export default SignUp