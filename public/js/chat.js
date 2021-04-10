const socket = io()

const $input = document.querySelector("#inputMessage")
const $messageFrom = document.querySelector("#messageForm")
const $button_sendLoc = document.querySelector("#send-loc")
const $button_sendMsg = document.querySelector("#send")
const $messages= document.querySelector("#messages")


//templates
const messageTemplate=document.querySelector("#message-template").innerHTML
const locMessageTemplate=document.querySelector("#locMessageTemplate").innerHTML
const sidebarTemplate= document.querySelector("#sidebar-template").innerHTML

//options
const {username, room}= Qs.parse(location.search,{ignoreQueryPrefix:true})
const autoScroll= ()=>{
    //new message element
    const $newMessage = $messages.lastElementChild

    // height of the message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight= $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of message container
        const containerHeight = $messages.scrollHeight

    //how far have i scrolled

    const scrollOffset= $messages.scrollTop+visibleHeight


    if(containerHeight-newMessageHeight<=scrollOffset){
        $messages.scrollTop= $messages.scrollHeight
    }
}

socket.on("locationMessage",(loc)=>{
    console.log(loc);
    const html = Mustache.render(locMessageTemplate,{
        loc: loc.url,
        createdAt:moment(loc.createdAt).format("h:mm a"),
        username:loc.username
    })
    $messages.insertAdjacentHTML("beforeend",html)

})

socket.on("message",(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        message:message.text,
        username:message.username,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML("beforeend",html)
    // autoScroll()
})
$messageFrom.addEventListener("click",(e)=>{
    e.preventDefault()

    const message= $input.value
    if (message!==''){
        $button_sendMsg.setAttribute("disabled","disabled")
        socket.emit("sendMessage", message,(serverMessage)=>{
            $button_sendMsg.removeAttribute("disabled")
            $input.value = ''
            // $input.focus()

            if (serverMessage){
                console.log(serverMessage)
            }

        })

    }

})

$button_sendLoc.addEventListener("click",()=>{
    if (!navigator.geolocation){
        return alert("Geolocation is not supported by your browser.")
    }
    $button_sendLoc.setAttribute("disabled","disabled")

    navigator.geolocation.getCurrentPosition(position => {
        // console.log(position)
        socket.emit("sendLocation",{lat:position.coords.latitude,
        long:position.coords.longitude},(serverMessage)=>{
            $button_sendLoc.removeAttribute("disabled")
            if(serverMessage){
                console.log(serverMessage)
            }


        })
    })
})

socket.emit("join",{username,room},(error)=>{
    if (error){
        alert(error)
        location.href='/'
    }
})

socket.on("roomData",({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{room,users})
    document.querySelector("#sidebar").innerHTML = html
})