import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import ddbDocClient from "../libs/ddbDocClient";
import { getListingByID } from "./listingRead";
// import { ulid } from 'ulid';
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpErrorHandler from '@middy/http-error-handler';
import createError from 'http-errors';
import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { usernameFromTokenIn } from "../libs/jwtParse";

const listingDelete: APIGatewayProxyHandler = async (event, _context): Promise<APIGatewayProxyResult> => {
  const username = usernameFromTokenIn(event)
  const { id } = event.pathParameters!

  const listing = await getListingByID(id!)

  if (listing.POSTER !== username) 
    throw new createError.Unauthorized()

  await deleteAuctionWithID(id!)

  return {
    statusCode: 200,
    body: ""
  }
}

async function deleteAuctionWithID(id: string): Promise<APIGatewayProxyResult> {
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


