const socket = io()
let user
const chatBox = document.getElementById("chatBox")

Swal.fire({
    title: "identify yourself", 
    input: "text",
    text: "write ur name and start chating!", 
    inputValidator: (value) => {
        return !value && "Need a name to chat"
    }, 
    allowOutsideClick: false,
}).then( result => {
    user = result.value
})


chatBox.addEventListener("keyup", (event) => {
    if(event.key === "Enter") {
        if(chatBox.value.trim().length > 0) {
            socket.emit("message", {user: user, message: chatBox.value})
            chatBox.value = ""
        }
    }
})

socket.on("message", data => {
    let log = document.getElementById("messagesLogs")
    let messages = ""

    data.forEach( message => {
        messages = messages + `${message.user} dice: ${message.message} <br>`
    })

    log.innerHTML = messages
})