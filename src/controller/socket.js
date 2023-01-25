const modelChat = require("../model/message");

module.exports = (io, socket) => {
  socket.on("ping", (data) => {
    socket.emit("ping-response", data);
  });
  // buat join room private chat
  socket.on("join-room", (data) => {
    const { id, username, number, password } = data;
    socket.join(id);
  });

  // ngirim pm
  socket.on("send-message", (data) => {
    modelChat
      .create(data)
      .then(async () => {
        const listChats = await modelChat.getMessage(
          data.sender_id,
          data.receiver_id
        );
        io.to(data.receiver_id).emit("newMessage", listChats.rows);
      })
      .catch((err) => {
        console.log("error send message");
        console.log(err);
      });
  });

  //get histori chat
  socket.on("chat-history", async (data) => {
    try {
      console.log(data);
      const listChats = await modelChat.getMessage(
        data.sender_id,
        data.receiver_id
      );
      io.to(data.sender_id).emit("newMessage", listChats.rows);
    } catch (err) {
      console.log("Error chat-history");
      console.log(err);
    }
  });
};
