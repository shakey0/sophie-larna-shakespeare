const { Client } = require("pg");

exports.handler = async function (event, context) {
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
    // Handle connection errors
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to connect to the database",
        details: err.message,
      }),
    };
  }

  try {
    if (event.httpMethod === "GET") {
      const res = await client.query("SELECT * FROM users");
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
      body: JSON.stringify({ error: err.message }),
    };
  }
};
