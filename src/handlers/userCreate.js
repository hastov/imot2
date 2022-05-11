import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand } from "@aws-sdk/client-cognito-identity-provider";
import createError from 'http-errors';
// import { ulid } from 'ulid';
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpErrorHandler from '@middy/http-error-handler';

const client = new CognitoIdentityProviderClient();

async function userCreate(event, context) {
  try {
    const { email, password } = event.body;
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
      const responsePassword = await setPassword(email, password, client, userPoolId);
      return {
        statusCode: 201,
        body: JSON.stringify(`Created ${responsePassword.User}`),
      };
    }
    // TODO: Password not set
  }
  catch (error) {
    throw new createError.InternalServerError(error);
  }
}

async function setPassword(username, password, client, userPoolId) {
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