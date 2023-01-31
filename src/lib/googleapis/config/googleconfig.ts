import { GoogleCredentials } from '../types/credentials';

export const getGoogleHeader = (credentials: GoogleCredentials) => {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${credentials.access_token}`,
  };
};
