import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import ddbDocClient from "../libs/ddbDocClient";
// import { ulid } from 'ulid';
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpErrorHandler from '@middy/http-error-handler';
import createError from 'http-errors';
import { APIGatewayProxyHandler } from 'aws-lambda';

const listingRead: APIGatewayProxyHandler = async (event, _context) => {
  const { id } = event.pathParameters!;
  const params = {
    TableName: process.env.LISTINGS_TABLE_NAME,
    KeyConditionExpression: 'PPK = :PPK',
    ExpressionAttributeValues: {
      ':PPK': id,
    },
  };

  try {
    const result = await ddbDocClient.send(new QueryCommand(params));
    if (!result.Items) throw new createError.NotFound();
    return {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error as string);
  }

  // return {
  //   statusCode: 201,
  //   body: JSON.stringify(listing),
  // };
}

// interface Body { 
//   typeOfListing: string | null;
//   typeOfProperty: string | null;
//   province: string | null;
//   city: string | null;
//   roomsCount: string | null;
//   neighboorhood: string | null;
// }

export const handler: APIGatewayProxyHandler = middy(listingRead)
  .use(httpJsonBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());


