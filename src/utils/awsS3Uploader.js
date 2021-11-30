import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();
const credentials = {
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_ID,
};
AWS.config.update(credentials);
const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

export const uploadFile = async (id, file) => {
  const { createReadStream } = file;
  const fileStream = createReadStream();

  const uploadParams = {
    Bucket: process.env.BUCKET_NAME,
    Key: "img_" + id,
    Body: fileStream,
  };
  const res = await s3.upload(uploadParams).promise();
  return res.Location;
};
