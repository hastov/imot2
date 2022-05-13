import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import ddbDocClient from "../libs/ddbDocClient";
// import { ulid } from 'ulid';
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpErrorHandler from '@middy/http-error-handler';
import createError from 'http-errors';
import { APIGatewayProxyHandler } from 'aws-lambda';

const listingDelete: APIGatewayProxyHandler = async (event, _context) => {
  const { id } = event.pathParameters!;
  const params = {
    TableName: process.env.LISTINGS_TABLE_NAME,
    Key: {
      PPK: "LISTINGS",
      PSK: id,
    },
  };

  try {
    const result = await ddbDocClient.send(new DeleteCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    } 
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error as string);
  }
}

export const handler: APIGatewayProxyHandler = middy(listingDelete)
  .use(httpJsonBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());


