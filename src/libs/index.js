export async function sendResponse(statusCode, body) {
  return {
      statusCode: statusCode,
      body: JSON.stringify(body),
      headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
      }
  };
};

export async function validateInput(body) {
  const { email, password } = body;
  return !email || !password || password.length < 8;
};