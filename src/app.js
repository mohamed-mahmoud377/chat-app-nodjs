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

module.exports=app