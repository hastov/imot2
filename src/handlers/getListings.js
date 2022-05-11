import { ddbDocClient } from '../libs/ddbDocClient';
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpErrorHandler from '@middy/http-error-handler';
import createError from 'http-errors';

async function getListings(event, context) {
  let listings;

  const params = {
    TableName: process.env.IMOT2_TABLE_NAME,
    // IndexName: 'id',
    KeyConditionExpression: 'begins_with(#id, :prefix)',
    ExpressionAttribueNames: {
      '#id': 'id',
    },
    ExpressionAttribueValues: {
      ':prefix': 'listing#',
    },
  };

  try {
    await ddbDocClient.send(new QueryCommand(params));
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(listings),
  };
}

export const handler = middy(getListings)
  .use(httpJsonBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());


