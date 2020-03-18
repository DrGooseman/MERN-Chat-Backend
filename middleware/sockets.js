module.exports = function(server, socketList) {
  const io = require("socket.io")(server);

  io.sockets.on("connection", function(socket) {
    const username = socket.handshake.query["username"];

    socket.username = username;

    socketList[username] = socket.id;

    socket.on("disconnect", function() {
      socketList[socket.username] = undefined;
    });
  });

  return io;
};
