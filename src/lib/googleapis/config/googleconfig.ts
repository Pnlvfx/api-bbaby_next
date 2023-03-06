import { GoogleCredentials } from '../types/credentials';

export const getGoogleHeader = (credentials: GoogleCredentials) => {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${credentials.access_token}`,
  };
};

export const getGoogleParent = () => {
  const projectId = process.env.CLOUD_NAME;
  const location = 'us-central1';
  const parent = `projects/${projectId}/locations/${location}`;
  return parent;
};
