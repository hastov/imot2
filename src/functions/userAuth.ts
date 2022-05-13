import { CognitoIdentityProviderClient, AdminInitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import createError from 'http-errors';
// import { ulid } from 'ulid';
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpErrorHandler from '@middy/http-error-handler';

const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

async function userAuth(event, _context) {
  try {
    const { email, password } = event.body;
    if (!email || !password || password.length < 8)
      throw new createError.BadRequest('Invalid input');

    const { USER_POOL_ID, USER_POOL_CLIENT_ID } = process.env;
    const params = {
      AuthFlow: "ADMIN_NO_SRP_AUTH",
      UserPoolId: USER_POOL_ID,
      ClientId: USER_POOL_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    };
    const command = new AdminInitiateAuthCommand(params);
    const response = await client.send(command);
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  }
  catch (error) {
    throw new createError.InternalServerError(error);
  }
}

export const handler = middy(userAuth)
  .use(httpJsonBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());