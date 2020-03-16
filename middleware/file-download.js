const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});

const fileDownload = (req, res, next) => {
  var params = { Bucket: process.env.AWS_BUCKET_NAME, Key: req.params.key };
  //   console.log("file key " + req.params.key);
  s3.getObject(params, function(err, data) {
    if (err) return console.log("err");
    //const contentType = data.headers["content-type"];
    //  console.log(data);
    //  res.writeHead(200, { "Content-Type": "image/jpeg" });
    res.write(data.Body, "binary");
    res.end(null, "binary");
  });
};

module.exports = fileDownload;
