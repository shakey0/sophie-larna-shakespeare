exports.handler = async function (event, context) {
  const source = event.queryStringParameters.source;
  const messages = {
    Sophie: "Hello, Mental Sophie!",
    Amber: "Hello, Ammmbbberrrr!",
    Blevins: "Hello, Blevy Blevs!",
  };

  if (messages[source]) {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: messages[source] }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello, Cat!" }),
  };
};
