const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const region = process.env.AWS_REGION || "ap-south-1";

const s3Client = new S3Client({ region });

async function uploadDocumentToS3(file) {
  const bucket = process.env.S3_BUCKET;

  if (!bucket) {
    return {
      uploaded: false,
      s3Ready: false,
      message: "S3_BUCKET is not configured. Upload endpoint is prepared.",
    };
  }

  const key = `uploads/${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  return {
    uploaded: true,
    s3Ready: true,
    bucket,
    key,
    url: `https://${bucket}.s3.${region}.amazonaws.com/${key}`,
  };
}

module.exports = {
  uploadDocumentToS3,
};