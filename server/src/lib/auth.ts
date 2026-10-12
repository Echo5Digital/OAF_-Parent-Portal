import { CognitoJwtVerifier } from "aws-jwt-verify";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { queryOne } from "./db.js";

export type AuthenticatedUser = {
  id: string;
  cognitoSub: string;
  email: string;
  fullName: string;
  role: string;
};

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID ?? "",
  tokenUse: "access",
  clientId: process.env.COGNITO_CLIENT_ID ?? "",
});

export class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 401) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function authenticate(event: APIGatewayProxyEventV2): Promise<AuthenticatedUser> {
  const header = event.headers?.authorization ?? event.headers?.Authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AuthError("Missing bearer token");
  }
  const token = header.slice("Bearer ".length);

  const payload = await verifier.verify(token).catch(() => {
    throw new AuthError("Invalid or expired token");
  });

  const user = await queryOne<{
    id: string;
    cognito_sub: string;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
  }>("select id, cognito_sub, email, full_name, role, is_active from users where cognito_sub = $1", [payload.sub]);

  if (!user || !user.is_active) {
    throw new AuthError("Account not found or inactive", 403);
  }

  return {
    id: user.id,
    cognitoSub: user.cognito_sub,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
  };
}

export function requireRole(user: AuthenticatedUser, ...roles: string[]) {
  if (!roles.includes(user.role)) {
    throw new AuthError(`Requires role: ${roles.join(" or ")}`, 403);
  }
}
