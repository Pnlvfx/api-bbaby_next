export interface GoogleCredentials {
  /**
   * A token that can be sent to a Google API.
   */
  access_token?: string | null;
  /**
   * The timestamp in seconds at which this token is thought to expire.
   */
  expires?: number;
  /**
   * The time in ms at which this token is thought to expire.
   */
  expires_in?: number;
  /**
   * The scopes of access granted by the access_token expressed as a list of space-delimited, case-sensitive strings.
   */
  scope?: string;
  /**
   * Identifies the type of token returned. At this time, this field always has the value Bearer.
   */
  token_type?: string | null;
  /**
   * This field is only present if the access_type parameter was set to offline in the authentication request. For details, see Refresh tokens.
   */
  refresh_token?: string | null;
}
