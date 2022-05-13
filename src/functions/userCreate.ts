import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand } from "@aws-sdk/client-cognito-identity-provider";
import createError from 'http-errors';
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpErrorHandler from '@middy/http-error-handler';
// import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context, Callback, APIGatewayProxyResult } from 'aws-lambda';

const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

const userCreate = async (event: any, _context: any) => {
  try {
    const { email, password } = event.body as any;
    if (!email || !password || password.length < 8)
      throw new createError.BadRequest('Invalid input');

    const userPoolId = process.env.USER_POOL_ID;
    const params = {
      UserPoolId: userPoolId,
      // ClientId: ulid(),
      Username: email,
      // Password: password,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
        {
          Name: 'email_verified',
          Value: 'true',
        },
      ],
      MessageAction: 'SUPPRESS'
    };
    const command = new AdminCreateUserCommand(params);
    const responseCreate = await client.send(command);
    if (responseCreate.User) {
      await setPassword(email, password, userPoolId, client);
    }
    return {
      statusCode: 201,
      body: JSON.stringify(`Created ${responseCreate.User.Username}`),
    };
  }
  catch (error) {
    throw new createError.InternalServerError(error as string);
  }
}

async function setPassword(username: string, password: string, userPoolId: string | undefined, client: CognitoIdentityProviderClient) {
  const params = {
    Password: password,
    UserPoolId: userPoolId,
    Username: username,
    Permanent: true,
  };
  const command = new AdminSetUserPasswordCommand(params);
  return client.send(command);
}

export const handler = middy(userCreate)
  .use(httpJsonBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());