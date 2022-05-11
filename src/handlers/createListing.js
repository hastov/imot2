import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from '../libs/ddbDocClient';
import { v4 as uuid } from 'uuid';
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpErrorHandler from '@middy/http-error-handler';
// import createError from 'http-errors';

async function createListing(event, context) {
  const { typeOfListing, typeOfProperty, province, city, roomsCount, neighboorhood } = event.body;

  const listing = {
    id: `listing#${uuid()}`,
    sortKey: `${typeOfListing}#${typeOfProperty}#${province}#${city}#${roomsCount}#${neighboorhood}`
  };

  const params = {
    TableName: process.env.IMOT2_TABLE_NAME,
    Item: listing,
  };

  try {
    await ddbDocClient.send(new PutCommand(params));
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
    // throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 201,
    body: JSON.stringify(listing),
  };
}

export const handler = middy(createListing)
  .use(httpJsonBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());


