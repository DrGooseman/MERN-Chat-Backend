module.exports = function(server, socketList) {
  const io = require("socket.io")(server);

  io.sockets.on("connection", function(socket) {
    const username = socket.handshake.query["username"];

    socket.username = username;

    console.log("connection " + socket.username);

    socketList[username] = socket.id;

    socket.on("disconnect", function() {
      console.log("disconnect " + socket.username);
      socketList[socket.username] = undefined;
    });
  });

  return io;
};
