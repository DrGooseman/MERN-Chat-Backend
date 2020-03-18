const express = require("express");
const app = express();

const port = process.env.PORT || 5000;
const server = app.listen(port, () =>
  console.log(`Listening on port ${port}...`)
);

const socketList = {};
const io = require("./middleware/sockets")(server, socketList);

require("dotenv").config();
const fileDownload = require("./middleware/file-download");
const HttpError = require("./models/http-error");

app.use("/uploads/images/:key", fileDownload);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested_With, Content-Type, Accept, Authorization, _id"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

require("./routes")(app, io, socketList);
require("./db")();

app.use((req, res, next) => {
  next(new HttpError("Could not find this route.", 404));
});

app.use((error, req, res, next) => {
  if (res.file)
    fs.unlink(req.file.path, err => {
      console.log(err);
    });

  if (res.headerSent) return next(error);
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

module.exports = server;
