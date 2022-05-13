import { APIGatewayProxyEvent } from "aws-lambda";

export const usernameFromTokenIn = (event: APIGatewayProxyEvent): string | null => {
  const token = event.headers.Authorization?.replace(/^(Bearer )/,'')
  if (!token) return null
  return parsedFromJWT(token!)['cognito:username']
}

/**
 * Returns a JS object representation of a Javascript Web Token from its common encoded
 * string form.
 *
 * @template T the expected shape of the parsed token
 * @param {string} token a Javascript Web Token in base64 encoded, `.` separated form
 * @returns {(T | undefined)} an object-representation of the token
 * or undefined if parsing failed
 */
//  export function getParsedJwt<T extends object = { [k: string]: string | number }>(
//   token: string,
// ): T | undefined {
//   try {
//     return JSON.parse(atob(token.split('.')[1]))
//   } catch {
//     return undefined
//   }
// }

export function parsedFromJWT(token: string) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(Buffer.from(base64, "base64").toString().split('').map(function(c: string) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
};