import React from 'react'
import { useContext } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useState } from 'react'
import { useRef } from 'react'
import userImg from '../assets/user.gif'
import aiImg from '../assets/Ai.gif'
import { RxCross2 } from "react-icons/rx";
import { CgMenuRight } from "react-icons/cg";

const Home = () => {
  const {serverUrl,userData,setUserData,frontendImage,setFrontendImage,backendImage,setBackendImage,selectedImage,setSelectedImage,getGeminiResponse} = useContext(userDataContext)

  let navigate = useNavigate()
  const [listening, setListening] = useState(false)
  const [userText,setUserText] = useState("")
  const [aiText,setAiText] = useState("")
  const [ham,setHam] = useState(false)
  const isSpeakingRef = useRef(false)
  const recognitionRef = useRef(null)
  const isRecognizingRef = useRef(false)
  const synth = window.speechSynthesis

  const handleLogOut = async ()=>{
    try {
      const result = await axios.post(`${serverUrl}/api/auth/logout`,{withCredentials:true})
      setUserData(null)
      navigate("/signin")

    } catch (error) {
      setUserData(null)
      console.log(error)
      
    }
  }

  const startRecognition = () => {
    if(!isSpeakingRef.current && !isRecognizingRef.current){
      try {
        recognitionRef.current?.start()
        setListening(true)
      } catch (error) {
        if(!error.message.includes("start")){
          console.log("Recognition error :" ,error);
          
        }
      }
    }
  }

  const speak = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN"
    const voices = window.speechSynthesis.getVoices()
    const hindiVoice = voices.find(v => v.lang == "hi-IN")
    if(hindiVoice){
      utterance.voice = hindiVoice
    }


    isSpeakingRef.current = true
    utterance.onend = ()=>{
      setAiText("")
      isSpeakingRef.current = false
      setTimeout(()=>{
        startRecognition()
      },800)
      
    }
    synth.cancel()
    synth.speak(utterance);
  }

  const handleCommand = (data) => {
    const { type, userinput, response } = data;
    speak(response);

    if (type === "google_search") {
      const query = encodeURIComponent(userinput);
      window.open(`https://www.google.com/search?q=${query}`, "_blank");
    }

    if (type === "youtube_search") {
      const query = encodeURIComponent(userinput);
      window.open(`https://www.youtube.com/results?search_query=${query}`, "_blank");
    }

    if (type === "youtube_play") {
      const query = encodeURIComponent(userinput);
      window.open(`https://www.youtube.com/results?search_query=${query}`, "_blank");
    }

    if (type === "calculator_open") {
      window.open("https://www.google.com/search?q=calculator", "_blank");
    }

    if (type === "instagram_open") {
      window.open("https://www.instagram.com", "_blank");
    }

    if (type === "facebook_open") {
      window.open("https://www.facebook.com", "_blank");
    }

    if (type === "weather-show") {
      const query = encodeURIComponent(userinput || "weather");
      window.open(`https://www.google.com/search?q=${query}`, "_blank");
    }
    
  };

  const greetUser = (userData) => {
      if (!userData?.name) return;

      const greeting = new SpeechSynthesisUtterance(
        `Hello ${userData.name}, what can I help you with?`
      );

      greeting.lang = 'hi-IN'; // or 'en-US' if you want English
      greeting.onend = () => {
        startTimeout(); // resume listening after speech ends
      };

    window.speechSynthesis.speak(greeting);
  };

  useEffect(() => {
    if (userData?.name) {
      greetUser(userData);
    }
  }, [userData]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognitionRef.current = recognition

    let isMounted = true

    const startTimeout = setTimeout(()=>{
      if(isMounted && !isSpeakingRef.current && !isRecognizingRef.current){
        try {
          recognition.start()
          console.log("Recognition request to start");
        } catch (error) {
          if(error.name != "InvalidStateError"){
            console.log("Start Error : ",error)
          }
        }
      }
    },1000)


    recognition.onstart=()=>{
      console.log("recognition started")
      isRecognizingRef.current = true
      setListening(true)
      
    }

    recognition.onend=()=>{
      isRecognizingRef.current = false
      setListening(false)

      if(isMounted && !isSpeakingRef.current){
        setTimeout(()=>{
          if(isMounted){
            try {
              recognition.start()
              console.log("Recognition started");
            } catch (error) {
              if(error.name != "InvalidStateError"){
                console.log("Start Error : ",error)
              }
            }
          }
        },1000)
      }
    }

    recognition.onerror=(event)=>{
      console.warn("Recognition error : ",event.error)
      isRecognizingRef.current = false
      setListening(false)
      if(event.error != "aborted" && !isSpeakingRef.current && isMounted){
        setTimeout(()=>{
          if(isMounted){
            try {
              recognition.start()
              console.log("Recognition started");
            } catch (error) {
              if(error.name != "InvalidStateError"){
                console.log("Start Error : ",error)
              }
            }
          }
        },1000)
      }
    }
    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      console.log("Transcript:", transcript);
      if(transcript.toLowerCase().includes(userData.assistantName.toLowerCase())){
        setAiText("")
        setUserText(transcript)
        recognition.stop()
        isRecognizingRef.current = false
        setListening(false)
        const data = await getGeminiResponse(transcript)
        console.log(data)
        // speak(data.response)
        handleCommand(data)
        setAiText(data.response)
        setUserText("")
      }
    };

    // window.speechSynthesis.onvoiceschanged = () => {
    //   const greeting = new SpeechSynthesisUtterance(
    //     `Hello ${userData.name}, what can I help you with?`
    //   );
    //   greeting.lang = 'hi-IN';   // Hindi voice
    //   greeting.onend = () => {
    //     startTimeout();          // restart listening after speech ends
    //   };
    //   window.speechSynthesis.speak(greeting);
    // };


    return ()=>{
      isMounted = false
      recognition.stop()
      setListening(false)
      isRecognizingRef.current = false
      clearTimeout(startTimeout)
    }
  },[])


  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023d] 
      flex justify-center items-center flex-col gap-[15px] overflow-x-hidden'>

        <CgMenuRight className='lg:hidden absolute text-white top-[20px] right-[20px] w-[25px] h-[25px]'
        onClick={()=>setHam(true)}/>

        <div className={`fixed top-0 left-0 lg:hidden w-full h-full bg-[#00000053] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start
        transform ${ham ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 ease-in-out`}>

          <RxCross2 className='lg:hidden absolute text-white top-[20px] right-[20px] w-[25px] h-[25px]'
          onClick={()=>setHam(false)}/>

          <button
            className='min-w-[150px] h-[60px]  text-black  font-semibold bg-white cursor-pointer rounded-full text-[19px]' onClick={handleLogOut}
            >Log Out</button>
          <button
            className='min-w-[150px] h-[60px] text-black font-semibold  bg-white cursor-pointer rounded-full text-[19px] px-[20px] py-[10px] ' onClick={()=>navigate("/customize")}
            >Customize Your Assistant</button>

            <div className='w-full h-[2px] bg-gray-400'></div>
            <h1 className='text-white text-[19px] font-semibold'>History</h1>

            <div className="w-full h-[400px] overflow-y-auto flex flex-col gap-[20px] scrollbar-hide">
              {userData?.history && userData.history.length > 0 ? (
                userData.history.map((his, idx) => (
                  <span 
                    key={idx} 
                    className="text-gray-300 text-[18px] break-words"
                  >
                    {his}
                  </span>
                ))
              ) : (
                <span>No history available</span>
              )}
            </div>



        </div>



        <button
            className='min-w-[150px] h-[60px] mt-[30px] text-black absolute hidden lg:block top-[20px] right-[20px] font-semibold bg-white cursor-pointer rounded-full text-[19px]' onClick={handleLogOut}
            >Log Out</button>
        <button
            className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold absolute hidden lg:block top-[100px] right-[20px] bg-white cursor-pointer rounded-full text-[19px] px-[20px] py-[10px] ' onClick={()=>navigate("/customize")}
            >Customize Your Assistant</button>


        <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'>
          <img src={userData?.assistantImage} alt="" className='h-full object-cover' />
        </div>

        <h1 className='text-white text-[18px] font-semibold'>I'm {userData?.assistantName}</h1>
        {!aiText && <img src={userImg} alt="" className='w-[200px]'/>}
        { aiText && <img src={aiImg} alt="" className='w-[200px]'/>}
        

        <h1 className='text-white text-[18px] font-semibold text-wrap'>{userText? userText : aiText? aiText : null}</h1>
    </div>
  )
}
export default Home
