const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
const sanitize = require("sanitize-filename");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const busboy = require("busboy");

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

  console.log("Bucket Name start:", process.env.BUCKET_NAME);

  const contentType =
    event.headers["content-type"] || event.headers["Content-Type"];
  if (!contentType.startsWith("multipart/form-data")) {
    return {
      statusCode: 400,
      body: "Bad Request: Content-Type must be multipart/form-data",
    };
  }

  const fields = {};
  const files = [];

  return new Promise((resolve, reject) => {
    const bb = busboy({ headers: event.headers });

    bb.on("field", (fieldname, val) => {
      fields[fieldname] = val;
    });

    bb.on("file", (fieldname, file, info) => {
      const { filename, encoding, mimeType } = info;
      const sanitizedFilename = sanitize(filename.split(".")[0]);
      const fileBuffer = [];

      file.on("data", (data) => {
        fileBuffer.push(data);
      });

      file.on("end", async () => {
        const buffer = Buffer.concat(fileBuffer);
        files.push({
          fieldname,
          buffer,
          filename: sanitizedFilename,
          mimeType,
        });
      });
    });

    bb.on("finish", async () => {
      try {
        if (!files.length) {
          return resolve({
            statusCode: 400,
            body: "No photos uploaded.",
          });
        }

        const uploadResults = await Promise.all(
          files.map(async (file) => {
            const outputFilePath = path.join("/tmp", `${file.filename}.webp`);

            // Resize, compress, and convert the image to .webp
            await sharp(file.buffer)
              .resize(800) // Resize to width of 800px
              .webp({ quality: 80 }) // Compress to 80% quality
              .toFile(outputFilePath);

            const fileStream = fs.createReadStream(outputFilePath);
            const uniqueKey = `sophie/${file.filename}-${uuidv4()}.webp`;

            console.log("Bucket Name before:", process.env.BUCKET_NAME);

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
              filename: file.filename,
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
          body: JSON.stringify({
            success: true,
            files: uploadResults,
            fields,
          }),
        });
      } catch (error) {
        console.error("Error processing or uploading photos:", error);
        resolve({
          statusCode: 500,
          body: "Error processing or uploading photos.",
        });
      }
    });

    bb.write(Buffer.from(event.body, "base64"));
    bb.end();
  });
};
