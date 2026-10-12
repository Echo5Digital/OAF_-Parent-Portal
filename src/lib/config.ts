export const config = {
  cognitoUserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID ?? "",
  cognitoClientId: import.meta.env.VITE_COGNITO_CLIENT_ID ?? "",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "",
};
