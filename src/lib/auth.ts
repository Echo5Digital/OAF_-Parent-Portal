import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  type CognitoUserSession,
} from "amazon-cognito-identity-js";
import { config } from "./config";

let pool: CognitoUserPool | null = null;

function getPool(): CognitoUserPool {
  if (!pool) {
    pool = new CognitoUserPool({
      UserPoolId: config.cognitoUserPoolId,
      ClientId: config.cognitoClientId,
    });
  }
  return pool;
}

export function signIn(email: string, password: string): Promise<CognitoUserSession> {
  const user = new CognitoUser({ Username: email, Pool: getPool() });
  const authDetails = new AuthenticationDetails({ Username: email, Password: password });

  return new Promise((resolve, reject) => {
    user.authenticateUser(authDetails, {
      onSuccess: (session) => resolve(session),
      onFailure: (err) => reject(err),
      newPasswordRequired: () => reject(new Error("A new password is required for this account")),
    });
  });
}

export function signOut(): void {
  getPool().getCurrentUser()?.signOut();
}

export function getAccessToken(): Promise<string | null> {
  const user = getPool().getCurrentUser();
  if (!user) return Promise.resolve(null);

  return new Promise((resolve) => {
    user.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session?.isValid()) {
        resolve(null);
        return;
      }
      resolve(session.getAccessToken().getJwtToken());
    });
  });
}
