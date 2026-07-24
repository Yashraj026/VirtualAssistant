import axios from "axios";

export default async function geminiResponse(command, assistantName, userName) {
  const prompt = `You are a virtual assistant named ${assistantName} created by ${userName}.
You are not Google. You will now behave like a voice-enabled assistant.

Your task is to understand the user's natural language input and respond with a JSON object like this:

{
  "type": "general" | "google_search" | "youtube_search" | "youtube_play" |
          "get_time" | "get_date" | "get_day" | "get_month" |
          "calculator_open" | "instagram_open" | "facebook_open" |
          "weather-show",

  "userinput": "<original user input>"
               {only remove your name from userinput if exists}
               and agar kisi ne google ya youtube pe kuch search karne ko bola hai
               to userInput me only bo search baala text jaye,

  "response": "<a short spoken response to read out loud to the user>"
}

Instructions:
- "type": determine the intent of the user.
- "userinput": original sentence the user spoke.
- "response": A short voice-friendly reply. e.g., "Sure, playing it now",
  "Here's what I found", "Today is Tuesday", etc.

Type meanings:
- "general": if it's a factual or informational question. aur agar koi aisa question puchta hai jiska answer tumko pata hai usko v general category me rakho aur short answer dena 
- "google_search": if user wants to search something on Google.
- "youtube_search": if user wants to search something on YouTube.
- "youtube_play": if user wants to directly play a video or song.
- "calculator_open": if user wants to open a calculator.
- "instagram_open": if user wants to open instagram.
- "facebook_open": if user wants to open facebook.
- "weather-show": if user wants to know weather.
- "get_time": if user asks for current time.
- "get_date": if user asks for today's date.
- "get_day": if user asks what day it is.
- "get_month": if user asks for the current month.

Important:
- Use "${userName}" agar koi puche tumhe kisne banaya.
- Only respond with the JSON object, nothing else.

now your userInput- ${command}
`;

  
  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY, // safer: use .env
        },
      }
    );

    // Safely extract the text
    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log(text);
    
    return text;
  } catch (error) {
    if (error.response?.status === 503) {
      console.error("Gemini is overloaded. Try again in a few seconds.");
    } else {
      console.error("Gemini API Error:", error.response?.data || error.message);
    }
    return null;
  }
}



