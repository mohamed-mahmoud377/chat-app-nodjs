
//setting up express app
const express = require("express")
const app = express();

const path = require("path")

//getting the views path
// the path that __dirname gives us is D:\Projects\node.js\node11-chat-app\src the is the path of the app file
//then the join this path with the views path within the project

// const viewsPath = path.join(__dirname,"../templates/views")

//getting the path for the public Dir
const  publicDir= path.join(__dirname,"../public")

//setting up the views for express app to know it
// app.set("views",viewsPath)
app.set("view engine","hbs")
//setting up the static files which is in the public dir
app.use(express.static(publicDir))
const http =require("http")
const server = http.createServer(app);
const socketio = require("socket.io")
const io = socketio(server)
const Filter = require("bad-words")
const {generateMessage,generateLocMessage}= require ("./utils/messages")
const {addUser,removeUser,getUserInRoom,getUser} =require("./utils/users")

// app.get("",(req,res)=>{
//     // res.render("index")
//     res.render("index")
// })
let count = 0 ;
io.on("connection",(socket)=>{
    console.log("new client has connected to the server")



    socket.on("join",({username,room},callback)=>{
        const {error, user}=addUser({id:socket.id,username,room})

        if (error){
            return  callback(error)
        }
        socket.join(user.room)
        socket.emit("message", generateMessage("Server","welcome !"))
        socket.broadcast.to(user.room).emit("message",  generateMessage(`${user.username} has joined`))
        io.to(user.room).emit("roomData",{
            room:user.room,
            users:getUserInRoom(user.room)
        })
        callback()

    })

    socket.on("sendMessage",(message,callback)=>{
        const user = getUser(socket.id)
        const filter =new Filter()
        filter.addWords("a7a","5wal","kosamk","kos omk")
        message= filter.clean(message)
        // if (filter.isProfane(message)){
        //     return callback("bad words are not allowed")
        // }
        io.to(user.room).emit("message",generateMessage(user.username,message))
        callback("send to server")


    })



    socket.on("sendLocation",(location,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit("locationMessage",generateLocMessage(user.username,`https://google.com/maps?q=${location.lat},${location.long}`))
        callback("sent to server")
    })

    socket.on("disconnect",()=>{
        const user = removeUser(socket.id)
        if (user){
            io.to(user.room).emit("message",generateMessage("Server",`${user.username} has left !`))
            io.to(user.room).emit("roomData",{
                room:user.room,
                users:getUserInRoom(user.room)
            })
        }
    })




    })


server.listen(process.env.PORT,()=>{
    console.log("server is up and running on port ",process.env.PORT );
})