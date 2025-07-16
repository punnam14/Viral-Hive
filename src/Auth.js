// src/Auth.js
import { COGNITO_CONFIG } from './config';
import AWS from 'aws-sdk';

// Function to initiate login
export const login = () => {
  const { domain, redirectSignIn, responseType, scope, userPoolWebClientId } = COGNITO_CONFIG;
  
  // Construct the login URL
  const loginUrl = `${domain}/login?client_id=${userPoolWebClientId}&response_type=${responseType}&scope=${encodeURIComponent(
    scope
  )}&redirect_uri=${encodeURIComponent(redirectSignIn)}`;

  console.log(loginUrl)
  
  // Redirect to Cognito's hosted UI
  window.location.assign(loginUrl);
};

// Function to initiate logout
export const logout = () => {
  const { domain, redirectSignOut, userPoolWebClientId } = COGNITO_CONFIG;
  
  // Construct the logout URL
  const logoutUrl = `${domain}/logout?client_id=${userPoolWebClientId}&logout_uri=${encodeURIComponent(redirectSignOut)}`;
  
  // Redirect to Cognito's logout endpoint
  window.location.assign(logoutUrl);
};

// Function to handle authentication (token exchange)
export const handleAuthentication = async () => {
  // Parse the URL parameters
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');

  if (!code) {
    console.warn('No authorization code found in URL.');
    // Optionally, check for error parameters
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    if (error) {
      console.error(`Error during authentication: ${error} - ${errorDescription}`);
    }
    return null;
  }

  console.log('Authorization code found:', code);

  const { domain, redirectSignIn, userPoolWebClientId } = COGNITO_CONFIG;
  const tokenUrl = `${domain}/oauth2/token`;

  // Prepare the token exchange parameters
  const paramsBody = new URLSearchParams();
  paramsBody.append('grant_type', 'authorization_code');
  paramsBody.append('client_id', userPoolWebClientId);
  paramsBody.append('code', code);
  paramsBody.append('redirect_uri', redirectSignIn);

  try {
    console.log('Exchanging authorization code for tokens...');
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: paramsBody.toString(),
    });

    console.log('Token exchange response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching tokens:', errorText);
      return null;
    }

    const result = await response.json();
    console.log('Token exchange result:', result);

    if (result.error) {
      console.error('Error fetching tokens:', result);
      return null;
    }

    // Store tokens securely (Consider more secure storage in production)
    localStorage.setItem('id_token', result.id_token);
    localStorage.setItem('access_token', result.access_token);
    localStorage.setItem('refresh_token', result.refresh_token);

    // Configure AWS SDK with credentials
    AWS.config.region = COGNITO_CONFIG.region;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: COGNITO_CONFIG.identityPoolId,
      Logins: {
        [`cognito-idp.${COGNITO_CONFIG.region}.amazonaws.com/${COGNITO_CONFIG.userPoolId}`]: result.id_token,
      },
    });

    // Refresh AWS credentials
    console.log('Refreshing AWS credentials...');
    await new Promise((resolve, reject) => {
      AWS.config.credentials.refresh((error) => {
        if (error) {
          console.error('Error refreshing credentials:', error);
          reject(error);
        } else {
          console.log('AWS credentials refreshed successfully.');
          resolve();
        }
      });
    });

    // Remove the authorization code from the URL to prevent reuse
    window.history.replaceState({}, document.title, '/');

    return AWS.config.credentials.identityId;
  } catch (error) {
    console.error('Error during authentication:', error);
    return null;
  }
};
