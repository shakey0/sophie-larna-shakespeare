const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
const sanitize = require("sanitize-filename");

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { files: 10 } });

const s3Client = new S3Client({
  forcePathStyle: true,
  region: process.env.BUCKET_REGION,
  endpoint: process.env.BUCKET_ENDPOINT,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  const contentType =
    event.headers["content-type"] || event.headers["Content-Type"];
  if (!contentType.startsWith("multipart/form-data")) {
    return {
      statusCode: 400,
      body: "Bad Request: Content-Type must be multipart/form-data",
    };
  }

  return new Promise((resolve, reject) => {
    const req = {
      ...event,
      body: Buffer.from(event.body, "base64"),
    };
    const res = {
      setHeader: () => {},
      end: (body) => {
        resolve({
          statusCode: 200,
          body,
        });
      },
    };

    upload.array("photos")(req, res, async (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_COUNT") {
          return resolve({
            statusCode: 400,
            body: "Error: Too many photos uploaded. Maximum of 10 per upload.",
          });
        }
        return resolve({
          statusCode: 500,
          body: "Internal Server Error: Photo upload failed",
        });
      }

      const { files } = req;

      if (!files || files.length === 0) {
        return resolve({
          statusCode: 400,
          body: "No photos uploaded.",
        });
      }

      try {
        const uploadResults = await Promise.all(
          files.map(async (file) => {
            const sanitizedFilename = sanitize(file.originalname.split(".")[0]);

            const outputFilePath = path.join(
              "/tmp",
              `${sanitizedFilename}.webp`
            );

            // Resize, compress, and convert the image to .webp
            await sharp(file.buffer)
              .resize(800) // Resize to width of 800px
              .webp({ quality: 80 }) // Compress to 80% quality
              .toFile(outputFilePath);

            const fileStream = fs.createReadStream(outputFilePath);

            const uniqueKey = `sophie/${sanitizedFilename}-${uuidv4()}.webp`;

            const uploadCommand = new PutObjectCommand({
              Bucket: process.env.BUCKET_NAME,
              Key: uniqueKey,
              Body: fileStream,
              ContentType: "image/webp",
            });

            await s3Client.send(uploadCommand);

            // Clean up the temporary file
            fs.unlinkSync(outputFilePath);

            return {
              filename: file.originalname,
              status: "uploaded",
              key: uniqueKey,
            };
          })
        );

        resolve({
          statusCode: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ success: true, files: uploadResults }),
        });
      } catch (error) {
        console.error("Error processing or uploading photos:", error);
        resolve({
          statusCode: 500,
          body: "Error processing or uploading photos.",
        });
      }
    });
  });
};
