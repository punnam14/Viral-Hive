export const AWS_CONFIG = {
    region: 'us-east-1',
    userPoolId: 'us-east-1_iLipboMCP',
    userPoolWebClientId: '60b6982u8e3k5aojb3homt37s5',
    identityPoolId: 'us-east-1:cbe12596-c91d-46ab-8b8b-4d74de275442',
  };


  // src/config.js
export const COGNITO_CONFIG = {
    region: 'us-east-1',
    userPoolId: 'us-east-1_iLipboMCP', // Your User Pool ID
    userPoolWebClientId: '60b6982u8e3k5aojb3homt37s5',
    domain: 'https://viralhive.auth.us-east-1.amazoncognito.com',
    redirectSignIn: 'https://viralhive.pro', // Your app's URL
    redirectSignOut: 'https://viralhive.pro',
    responseType: 'code',
    scope: 'openid profile email',
    identityPoolId: 'us-east-1:cbe12596-c91d-46ab-8b8b-4d74de275442',
  };
  