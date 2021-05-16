const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

const formatMessage = require('./utils/messages');

const { 
    UserJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
} = require('./utils/users');
const app = express();
const server = http.createServer(app);
const io = socketio(server);

//Set static Folder...
app.use(express.static(path.join(__dirname,'html_css')));

const botName = "Admin Chat-BOT";

//Runs when Client connects..
io.on('connection',socket  =>{
    socket.on('joinRoom',({username,room})=>{
    
        const user = UserJoin(socket.id,username,room);
        socket.join(user.room);
        //Welcome Current User..
        socket.emit('message',formatMessage(botName,'Welcome to chat app!!'));

        //Broadcast when user connects..

        socket.broadcast
            .to(user.room)
            .emit(
            'message',
            formatMessage(botName,`${user.username} has joined the client`)
            );
            //send users to rooom info
            io.to(user.room).emit('roomUsers',{
                room:user.room,
                users:getRoomUsers(user.room)
            });

 
});

   //Listen for ChatMessage...
    socket.on('ChatMessage',msg=>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg));

    });

    //Runs when user disconnects..
    socket.on("disconnect",()=>{
        const user = userLeave(socket.id);
        if (user){
            io.to(user.room)
            .emit('message',formatMessage(botName,`${user.username} has left the chat`));
        }
        //send users and room info
        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getRoomUsers(user.room)
        });
    });
});
const PORT  = 3000 || process.env.PORT;
server.listen(PORT,()=>console.log(`Server is running on port ${PORT}`));