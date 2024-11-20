
  // import express
  import express from 'express'; 
  import {Server} from 'socket.io'
  import { createServer } from 'http'; 
  import { Message } from './model/model.js';
  // init express as app
  const app = express();
  // create http server
  const server = createServer(app);
  // create socket.io instance
  const io = new Server(server , {
    cors : {
      origin: '*',
      methods: ['GET', 'POST'],
    }
  });

  const globalRoom = "global-room"

  io.on('connection', (socket)=> {
    console.log("client connected", socket.id);

     socket.on("registration", (username : string )=> {
      console.log(`User ${username} has joined the chat`);
      socket.join(globalRoom);
      console.log(`User ${username} has joined the global room`);
      io.to(globalRoom).emit("newUserJoined", username);
     })

     socket.on('message', (message : Message)=> {
      console.log(`User ${message.sender} has sent a message: ${message.content}`);
      io.to(globalRoom).emit('messageReceived', message);
     })
     socket.on('disconnect', ()=> {
      console.log("client disconnected", socket.id);
      io.to(globalRoom).emit("userLeft", socket.id);
     })

     socket.on("error", (error : any)=> {
      console.error(error);
     })

  })
 


  // express as app will listen to your localhost at PORT 3000
  server.listen(3000, "0.0.0.0" , () => {
  console.log('Server is running on http://localhost:3000');
  });


