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

app.get('/', async (req, res) => {
  try {
    const clientCredentialRequest = {
      scopes: ['https://graph.microsoft.com/.default'],
    };

    const response = await cca.acquireTokenByClientCredential(clientCredentialRequest);

    if (response) {
      console.log('Access token acquired:', response.accessToken);
      res.json({
        message: 'Access token acquired successfully',
        tokenType: response.tokenType,
        expiresOn: response.expiresOn
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