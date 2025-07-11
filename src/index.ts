import express from 'express';
import dotenv from 'dotenv';
import { ConfidentialClientApplication } from '@azure/msal-node';

dotenv.config();

const app = express();
const port = 3000;

const msalConfig = {
  auth: {
    clientId: process.env.CLIENT_ID!,
    clientSecret: process.env.CLIENT_SECRET!,
    authority: `https://login.microsoftonline.com/${process.env.TENANT_ID}`
  }
};

const cca = new ConfidentialClientApplication(msalConfig);

app.use(express.json());

function decodeJWT(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

    return { header, payload };
  } catch (error) {
    throw new Error('Failed to decode JWT: ' + error);
  }
}

app.get('/', async (req, res) => {
  try {
    const clientCredentialRequest = {
      scopes: ['https://graph.microsoft.com/.default'],
    };

    const response = await cca.acquireTokenByClientCredential(clientCredentialRequest);

    if (response) {
      const decodedToken = decodeJWT(response.accessToken);
      res.json({
        message: 'Access token acquired successfully',
        tokenType: response.tokenType,
        expiresOn: response.expiresOn,
        decodedToken
      });
    } else {
      res.status(500).json({ error: 'Failed to acquire token' });
    }
  } catch (error) {
    console.error('Error acquiring token:', error);
    res.status(500).json({ error: 'Token acquisition failed' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});