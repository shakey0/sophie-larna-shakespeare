const { Client } = require("pg");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const {
  BUCKET_NAME,
  BUCKET_REGION,
  BUCKET_ENDPOINT,
  ACCESS_KEY_ID,
  SECRET_ACCESS_KEY,
  PG_CONNECTION_STRING,
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

exports.handler = async function (event, context) {
  // Check if the source is valid and set the data types
  const source = event.queryStringParameters.source;
  const validSources = ["Sophie", "Amber", "Blevins"];
  if (!validSources.includes(source)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid source" }),
    };
  }
  let entryType = "A" + source.toLowerCase(); // THIS WILL CHANGE AND ANOTHER CHAR WILL NEED TO BE ADDED
  console.log("source", entryType);
  const folderName = source.toLowerCase() + "/";
  let albumsData = [];

  // Connect to the database
  const isDevelopment = process.env.RUN_ENV === "development";

  const client = new Client({
    connectionString: isDevelopment
      ? "postgresql://localhost:5432/sophie-data-local"
      : PG_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to connect to the database",
        details: err.message,
      }),
    };
  }

  // Get data from the database
  try {
    if (event.httpMethod === "GET") {
      const res = await client.query(
        "SELECT * FROM all_entries WHERE entry_type = $1",
        [entryType]
      );
      await client.end();

      albumsData = res.rows.map((row) => ({
        coverPhoto: row.data[0],
        allPhotos: row.data,
        name: row.name,
        order: row.order,
      })); // Add more data from res.info , like the description, etc.
    } else {
      await client.end();
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method Not Allowed" }),
      };
    }
  } catch (err) {
    await client.end();
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }

  // Get images from S3 and add them to the data
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

    const dataWithImages = await Promise.all(
      albumsData.map(async (album) => {
        const coverPhoto = await getImage(folderName + album.coverPhoto);
        return {
          ...album,
          coverPhoto,
        };
      })
    );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataWithImages),
    };
  } catch (error) {
    console.error("Error getting objects from S3:", error);
    return {
      statusCode: 500,
      body: "Error getting objects from S3.",
    };
  }
};
