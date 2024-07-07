const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const {
  BUCKET_NAME,
  BUCKET_REGION,
  BUCKET_ENDPOINT,
  ACCESS_KEY_ID,
  SECRET_ACCESS_KEY,
} = process.env;

const s3Client = new S3Client({
  forcePathStyle: true,
  region: BUCKET_REGION,
  endpoint: BUCKET_ENDPOINT,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

exports.handler = async (event, context) => {
  // Define file names directly for testing purposes
  const keysArray = [
    "sophie/Screenshot from 2024-07-07 11-09-29-6a6d4249-c904-4b35-a710-f162c3a3b56b.webp",
    "sophie/Screenshot from 2024-07-07 11-15-31-d9dfe1a1-248d-41fe-8b01-193fdfedd341.webp",
  ];

  try {
    const streamToString = (stream) =>
      new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () =>
          resolve(Buffer.concat(chunks).toString("base64"))
        );
      });

    const getImage = async (key) => {
      const getObjectCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      const response = await s3Client.send(getObjectCommand);
      const body = await streamToString(response.Body);

      return {
        key,
        contentType: response.ContentType,
        body,
      };
    };

    const images = await Promise.all(keysArray.map((key) => getImage(key)));
    console.log("images:", images);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(images),
    };
  } catch (error) {
    console.error("Error getting objects from S3:", error);
    return {
      statusCode: 500,
      body: "Error getting objects from S3.",
    };
  }
};
