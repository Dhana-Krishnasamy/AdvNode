const requireLogin = require("../middlewares/requireLogin");
const AWS = require("aws-sdk");
const uuid = require("uuid/v1");
const keys = require("../config/keys");

const s3 = new AWS.S3({
  accessKeyId: keys.accessKeyId,
  secretAccessKey: keys.secretAccessKey,
  region: "eu-west-2"
});
module.exports = app => {
  app.get("/api/upload", requireLogin, (req, res) => {
    var fileType = req.query.type;
    var params = {
      Bucket: "my-blog-bucket-ci",
      Key: `${req.user.id}/${uuid()}.jpeg`,
      ContentType: fileType
    };
    s3.getSignedUrl("putObject", params, function(err, url) {
      res.send({ key: params.Key, url });
    });
  });
};
