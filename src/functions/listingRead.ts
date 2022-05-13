import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import ddbDocClient from "../libs/ddbDocClient";
// import { ulid } from 'ulid';
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpErrorHandler from '@middy/http-error-handler';
import createError from 'http-errors';
import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';

const listingRead: APIGatewayProxyHandler = async (event, _context): Promise<APIGatewayProxyResult> => {
  let { id } = event.pathParameters!;
  const listing = await getListingByID(id!)
  return {
    statusCode: 200,
    body: JSON.stringify(listing)
  }
}

export const getListingByID = async (id: string): Promise<any> => {
  const params = {
    TableName: process.env.LISTINGS_TABLE_NAME,
    KeyConditionExpression: 'PPK = :PPK AND PSK = :PSK',
    ExpressionAttributeValues: {
      ':PPK': 'LISTINGS',
      ':PSK': id,
    },
  };

  let result;
  try {
    result = await ddbDocClient.send(new QueryCommand(params));
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error as string);
  }

  if (result.Items?.length == 0) 
    throw new createError.NotFound();
  
  return result.Items![0]
}

export const handler: APIGatewayProxyHandler = middy(listingRead)
  .use(httpJsonBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());


