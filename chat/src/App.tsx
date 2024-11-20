import { useEffect, useState } from 'react';
import style from './App.module.scss'
import logo from "./assets/logo.webp" ;
import {IconAdCircle, IconBrandTelegram, IconImageInPicture, IconMenu, IconPaperclip, IconPhone, IconPlusEqual} from '@tabler/icons-react';
import io from 'socket.io-client'
import { Message } from './model/message.model';

function App() {

  const socket = io('http://localhost:3000');


  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUsername , setUsername] = useState("");
  const [inputMessage , setInputMessage] = useState("");


  useEffect(()=> {
   socket.on("connect", ()=> {
     console.log("Connected to the server");
   })
   socket.on('newUserJoined', (username : string)=> {
    alert(`New user joined : ${username}`);
   })

    socket.on('userLeft', (username : string)=> {
      alert(`User left : ${username}`);
    })

   const handleMessage = (message: Message) => {
    console.log("Handling message");
    const name = getUsername()
    console.log(name)
    if (message.sender === name) {
      return;
    }

     
    handlecheck()
  
    setMessages((prevmsg) => [...prevmsg, message]);
    scollToBottom();
    console.log("Received message from server : ", message);
  };




   socket.on("messageReceived", handleMessage )

  },[currentUsername])

  useEffect(()=> {
   
   
    handlecheck()
 
   }, [messages])

   const handlecheck = ()=> {
    const lastMessage = messages[messages.length - 1];
    const beforeLastMessage = messages[messages.length - 2];


 
    if (lastMessage && beforeLastMessage && lastMessage.timestamp === beforeLastMessage.timestamp) {
      console.log("Duplicate message found, ignoring")
      // DELETE THE LAST MESSAGE
      messages.pop();
      scollToBottom();
      // RE-RENDER THE CHAT BOX
      setMessages([...messages]);


      return;
    } else {
      console.log("No duplicate message found")
    }
  }

  const register = (username : string)=> {
    if (username === "") {
      alert("Please enter a username");
      return;
     }
     localStorage.setItem("username", username);
    setUsername(username)
    if (!socket.connected)  {
      alert("You are not connected to the server");
    }

   socket.emit("registration", username);
   console.log("User registered successfully");
   alert("You are now connected to the server");

  }

  const getUsername = ()=> {
    return localStorage.getItem("username");
  }


 const sendMessage = ()=> {
  if (!inputMessage ||!currentUsername) { 
    alert("Please enter a message and a username");
    return;
  }
 
  console.log("Sending message : ", inputMessage);
  const message : Message = {
    sender : currentUsername ,
    content : inputMessage,
    timestamp : Date.now()
  }
  console.log("Sending message : ", message);


  socket.emit("message", message);

  
  setInputMessage("");
  setMessages((prevMsg)=>[...prevMsg, message]);
  console.log("Message sent successfully");
  scollToBottom()
 }


 

  const scollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth' // Optionnel : animation fluide
    });
   }


  return (

  
    <div className={style.chat}>

     <section className={style.topConatainer}>
       <div className={style.TopBar}>
        <div className={style.left}>
        <img src={logo}  width={40}/>

        <div className={style.wersap}>
     {  currentUsername === ""   ?  "Wersap" : currentUsername}

        </div>

        </div>

        <div className={style.right}>
        <IconMenu size={30} />


        </div>
        </div>     

       </section>

       <section className={style.MessageContainer}>
         
         <div className={style.messages}>

            { messages.map((msg , index)=> ( 
              
              <div  className={`${msg.sender === currentUsername ? style.selfMessage : ""} ${style.message}`}>
            <div className={style.sender}>
            {msg.sender}
            </div>

            <div className={style.messageContent}>
              {msg.content}

            </div>

            <div className={style.messagetime}>
              {messages[0].timestamp}
            </div>

          </div>))}

         </div>

       </section>
   
       <section className={style.inputContainer}>
       <div className={style.input}>

         <div className={style.inputIcon}>
           <IconPaperclip />
           
         </div>
         <div className={style.inputIcon}>
           <IconImageInPicture />
           
         </div>
         <input  value={inputMessage}
          onChange={(e)=> {
          setInputMessage(e.target.value);
         }} type="text" placeholder="Type a message..."/>
          <button onClick={()=> {
            sendMessage();
            scollToBottom();
          }}> <IconBrandTelegram  /></button>
          </div>

       </section>
   {currentUsername === "" && <Registration register={register}  />}

   
      
    </div>
  )
}

export default App


type props = {
  register: (username: string) => void
}
const Registration = ({register  } : props)=> {
  const [username, setUsername] = useState("");

  return (
    <section className={style.registration}>
          <div className={style.registrationContainer}>
            <div className={style.registrationIcon}>
              <IconPhone />
            </div>
            <div className={style.registrationText}>
              Enter your username to join the chat 😺😎   
            </div>

      <input onChange={(e)=> setUsername(e.target.value)} type="text" placeholder="Enter your username"/>
      <button onClick={()=> register(username)}>Register</button>
      </div >

    </section>
  )

}