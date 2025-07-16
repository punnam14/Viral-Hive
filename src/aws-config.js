// src/aws-config.js
import AWS from 'aws-sdk';
import { AWS_CONFIG } from './config';

AWS.config.region = AWS_CONFIG.region;

// Cognito credentials provider
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: AWS_CONFIG.identityPoolId,
});
