import { PutCommand } from "@aws-sdk/lib-dynamodb";
import ddbDocClient from "../libs/ddbDocClient";
import { usernameFromTokenIn } from "../libs/jwtParse";
import { ulid } from 'ulid';
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpErrorHandler from '@middy/http-error-handler';
import createError from 'http-errors';
import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';

const listingCreate: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, _context) => {
  const username = usernameFromTokenIn(event)

  if (!username || event.body === null) {
    throw new createError.BadRequest(`Invalid body`)
  }
  // const { typeOfListing: string, typeOfProperty, province, city, roomsCount, neighboorhood }: Body = event.body;
  const { typeOfListing, typeOfProperty, province, city, roomsCount, neighboorhood, price } = event.body as any;

  const listing = {
    PPK: "LISTINGS",
    PSK: ulid(),
    LSI1: `${typeOfProperty}#${typeOfListing}#${typeOfProperty}#${province}#${city}#${neighboorhood}#${roomsCount}#${price}`,
    POSTER: username,
  };

  const params = {
    TableName: process.env.LISTINGS_TABLE_NAME,
    Item: listing,
  };

  try {
    await ddbDocClient.send(new PutCommand(params));
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error as string);
  }

  return {
    statusCode: 201,
    body: JSON.stringify(listing),
  };
}

// interface Body { 
//   typeOfListing: string | null;
//   typeOfProperty: string | null;
//   province: string | null;
//   city: string | null;
//   roomsCount: string | null;
//   neighboorhood: string | null;
// }

export const handler: APIGatewayProxyHandler = middy(listingCreate)
  .use(httpJsonBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());


