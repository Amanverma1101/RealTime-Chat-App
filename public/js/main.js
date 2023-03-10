const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const participants = document.getElementById('participants');
const invite = document.getElementById('invite');

//getting username and room name from url
const { username,room } = Qs.parse(location.search,{
    ignoreQueryPrefix: true
});
// console.log(username,room);

const socket = io();

//join Chatroom
socket.emit('joinRoom',{ username,room });

//Get room and users
socket.on('roomUsers',({ room,users })=>{
    outputRoomName(room);
    outputUsers(users);
});
//message from server
socket.on('message',(message)=>{
    // console.log(message);
    outputMessage(message);

    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

chatForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    const msg = e.target.elements.msg.value;
    
    //displaying message to client side
    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add('right');
    // const user = formatMessage('You',msg);
    var time = new Date();
    time = time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    div.innerHTML = `
    <p class="meta">You <span>${time}</span></p>
	<p class="text">
    ${msg}
	</p>`;
    document.querySelector('.chat-messages').appendChild(div);

    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;


    //emitting message to server
    socket.emit('chatMessage',msg);
    
    // console.log(msg);

    //clear input field
    e.target.elements.msg.value='';
    e.target.elements.msg.focus();
});

//output message to dom
function outputMessage(message){
    console.log(message.username);
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `
    <p class="meta">${message.username} <span>${message.time}</span></p>
	<p class="text">
    ${message.text}
	</p>`;
    document.querySelector('.chat-messages').appendChild(div);
    if(message.username==="Bot"){
        div.classList.add('center');
    }
}


//add room name to dom
function outputRoomName(room){
    roomName.innerText = room;
    //putting text to clipborad 
    invite.addEventListener('click',()=>{
    navigator.clipboard.writeText(`You have to Invited for Chit-Chat at room : ${room}`);
    alert("Invite Message Copied to Clipboard");
});
}

//add users to dom
function outputUsers(users){
    participants.innerText = users.length;
    userList.innerHTML = `
      ${users.map(user => `<li>${user.username}</li>`).join(``)}
    `;
}

