import React from 'react'
import { useContext } from 'react'
import { useState } from 'react'
import { userDataContext } from '../context/UserContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { MdKeyboardBackspace } from "react-icons/md";

const Customize2 = () => {
    const navigate = useNavigate()
    const {serverUrl,userData,setUserData,frontendImage,setFrontendImage,backendImage,setBackendImage,selectedImage,setSelectedImage} = useContext(userDataContext)

    const [assistantName,setAssistantName] = useState(userData?.assistantName || "")
    const [loading ,setLoading] = useState(false)

    const handleUpdateAssistant = async () => {
        let formData = new FormData()
        formData.append("assistantName",assistantName)
        if(backendImage){
            formData.append("assistantImage",backendImage)
        }
        else{
            formData.append("imageUrl",selectedImage)
        }

        try {
            setLoading(true)
            const result = await axios.post(`${serverUrl}/api/user/update`,formData,{withCredentials:true})

            console.log(result.data)
            setUserData(result.data)
            navigate("/")
            
        } catch (error) {
            console.log(error)
        }
        finally {
            setLoading(false) 
        }
    }
    
  return (
        <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] 
        flex justify-center items-center flex-col p-[20px] relative'>
            <MdKeyboardBackspace className='absolute top-[30px] left-[30px] text-white w-[25px] h-[25px] cursor-pointer' onClick={()=>navigate("/customize")}/>

            <h1 className='text-white text-[30px] mb-[30px] text-center'>Enter Your <span className='text-blue-300'>Assistant Name</span></h1>

            <input type="text" placeholder='eg. Nova'
            className='w-full max-w-[600px] h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-400 px-[20px] py-[10px] rounded-full text-[18px]'
            value={assistantName}
            onChange={(e)=>setAssistantName(e.target.value)}/>

            {assistantName && <button className='min-w-[300px] h-[60px] mt-[30px] text-black font-semibold bg-white cursor-pointer rounded-full text-[19px]'disabled={loading}
            onClick={()=>handleUpdateAssistant()}
            >{!loading ? "Finally Create Your Assistant" : "Loading..."}</button> }

            

        </div>
    )
}

export default Customize2