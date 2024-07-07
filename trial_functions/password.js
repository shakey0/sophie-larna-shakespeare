const crypto = require("crypto");
const cookie = require("cookie");

exports.handler = async function (event, context) {
  if (event.httpMethod === "POST") {
    const body = JSON.parse(event.body);
    console.log(body.password, process.env.PASSWORD);
    if (body.password === process.env.PASSWORD) {
      // Set session cookie
      const session = crypto.randomBytes(16).toString("hex");
      const cookieHeader = cookie.serialize("session", session, {
        secure: process.env.RUN_ENV !== "development",
        httpOnly: true,
        sameSite: "Strict",
        maxAge: 60,
        path: "/",
      });
      return {
        statusCode: 200,
        headers: {
          "Set-Cookie": cookieHeader,
        },
        body: JSON.stringify({ session }),
      };
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Unauthorized" }),
      };
    }
  } else {
    await client.end();
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }
};
