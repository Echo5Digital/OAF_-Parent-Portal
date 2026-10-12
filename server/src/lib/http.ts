import type { APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { AuthError } from "./auth.js";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN ?? "*",
  "Access-Control-Allow-Headers": "authorization,content-type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

export function json(statusCode: number, body: unknown): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    body: JSON.stringify(body),
  };
}

export async function withErrorHandling(
  fn: () => Promise<APIGatewayProxyStructuredResultV2>,
): Promise<APIGatewayProxyStructuredResultV2> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof AuthError) {
      return json(err.statusCode, { error: err.message });
    }
    console.error(err);
    return json(500, { error: "Internal server error" });
  }
}
