const path = require('path')
const express = require('express')
const http = require('http')
const socket = require('socket.io')
const formatMessage = require('./components/message')
const app = express()
const server = http.createServer(app)
const io = socket(server)
const botName = 'Bot Chat'
const mongoose = require('mongoose')
const {userJoin, currentUser, userLeft, getRoomUsers} = require('./components/users')
const History = require('./models/historyChat')
app.use(express.static(path.join(__dirname, 'public')))
const now = require('moment')


//Kết nối mongoose
mongoose.connect('mongodb+srv://dntan761:Daonhattan123@atlascluster.ggym4m3.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true})
    .then(()=>{
        console.log('connected')
    }).catch(e => console.log(e))
    
 



//Khi user kết nối
io.on('connection', socket => {

    socket.on('userJoin', ({username ,room}) => {
        const user = userJoin(socket.id, username,room) 
        socket.join(user.room)
        History.find({room:user.room}).then((result) => {
            socket.emit('outputMessage',result)
        })
        //Thông báo lần đầu khi kết nối vào
        socket.emit('message',formatMessage(botName,`Welcome ${user.username} joined the chat`));
    
        //Thông báo có user khác kết nối
        socket.broadcast.to(user.room).emit('otherUserJoined',formatMessage(botName,`${user.username} joined the chat`));
        
        //Lấy danh sách user đang online trong phòng 
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })
     

    // Chat của user
    socket.on('chatMessage', (msg) =>{
        const user = currentUser(socket.id)

        //Lưu dữ liệu vào database
       new History({
            username: user.username,
            time: now().format('h:mm a'),
            text:msg,
            room:user.room
        }).save()
        .then(() =>{
            io.to(user.room).emit('message',formatMessage(user.username, msg))
        })
    })

    //Người dùng ngắt kết nối
    socket.on('disconnect', () =>{
        const user = userLeft(socket.id)
        if(user){
            io.to(user.room).emit('userLeave',formatMessage(botName, `${user.username} has left the chat`));
        }
       
             //Lấy danh sách user đang online
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            }) 
        
       
    
    });

    
});

const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => {
    console.log(`Listening on port: http://localhost:${PORT}`)
})