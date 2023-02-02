const socket = io();
const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const listUser = document.getElementById("users");
const notify = document.getElementById("notify");
const roomName = document.getElementById("room-name");

//Lấy tên user thông qua URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
socket.emit("userJoin", { username, room });

//Hiển thị thông báo khi user tham gia chat
socket.on("otherUserJoined", (msg) => {
  notifyUser(msg);
  setTimeout(function () {
    notify.style.display = "none";
  }, 3000);
});
//Hiển thị thông báo khi user rời chat
socket.on("userLeave", (msg) => {
  notifyUser(msg);
  setTimeout(function () {
    notify.style.display = "none";
  }, 3000);
});

socket.on("roomUsers", ({ room, users }) => {
  outputRooms(room);
  outputUsers(users);
});
socket.on("message", (message) => {
  appendMsg(message);
  //Scroll tin nhắn cuối cùng
  chatMessages.scrollTop = chatMessages.scrollHeight;
});
socket.on("outputMessage", (message) => {
  if (message.length > 0) {
    message.forEach((data) => {
      appendMsg(data);
    });
  }
  //Scroll tin nhắn cuối cùng
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  //Lấy nội dung tin nhắn
  const msg = e.target.elements.msg.value;
  //Emit message người dùng nhập lên server
  socket.emit("chatMessage", msg);

  //Xóa input người dùng nhập và focus
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

function appendMsg(message) {
  var div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
      ${message.text}
    </p> `;
  document.querySelector(".chat-messages").appendChild(div);
}

//User in room
function outputUsers(users) {
  listUser.innerHTML = `
        ${users
          .map(
            (user) =>
              `<div style ="width: 100%"><img src="img/user.png" style="max-height: 20px"> ${user.username}</div>`
          )
          .join("")}
    `;
}

//Name of room
function outputRooms(room) {
  roomName.innerText = room;
}

function notifyUser(message) {
  var div = document.querySelector(".notify");
  div.innerHTML = `<p>${message.text}</p>`;
  div.style.display = "block";
}
