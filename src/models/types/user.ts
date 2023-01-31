import { Types, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  username: string;
  password: string;
  role: number;
  avatar: string;
  country: string;
  countryCode: string;
  city: string;
  region: string;
  lat: string;
  lon: string;
  upVotes: Types.ObjectId[];
  downVotes: Types.ObjectId[];
  tokens: TokensProps[];
  hasExternalAccount: boolean;
  externalAccounts: ExternalAccountsProps[];
  subscribed?: string[];
  last_post: Types.ObjectId[];
  is_bot?: boolean;
}

export type TokensProps = {
  access_token?: string;
  refresh_token?: string;
  provider: 'reddit' | 'twitter';
  oauth_access_token?: string;
  oauth_access_token_secret?: string;
  access_token_expiration?: Date;
};

interface ExternalAccountsProps {
  username: string;
  provider: 'reddit' | 'twitter';
  link?: string;
}
