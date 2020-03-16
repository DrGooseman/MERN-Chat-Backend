const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});

function deleteFile(key) {
  var params = { Bucket: process.env.AWS_BUCKET_NAME, Key: key };

  s3.deleteObject(params, function(err, data) {
    if (err) console.log("couldnt delete");
  });
}

module.exports = deleteFile;
