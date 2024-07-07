const cookie = require("cookie");
const { Client } = require("pg");

exports.handler = async function (event, context) {
  const cookies = cookie.parse(event.headers.cookie || "");
  const session = cookies.session;
  console.log(session); // TAKE OUT LATER

  if (!session) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Unauthorized" }),
    };
  }

  const isDevelopment = process.env.RUN_ENV === "development";

  const client = new Client({
    connectionString: isDevelopment
      ? "postgresql://localhost:5432/sophie-data-local"
      : process.env.PG_CONNECTION_STRING,
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

  try {
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body);
      const res = await client.query(
        "INSERT INTO users (name, word, number) VALUES ($1, $2, $3) RETURNING *",
        [body.name, body.word, body.number]
      );
      await client.end();
      return {
        statusCode: 200,
        body: JSON.stringify(res.rows),
      };
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
      body: JSON.stringify({ error: err.message, body: event.body }),
    };
  }
};
