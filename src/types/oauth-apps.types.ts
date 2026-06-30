export interface OAuthApp {
  id: number;
  name: string;
  client_id?: string;
  clientId?: string;
  redirect_uris?: string;
  redirectUris?: string;
  created: string;
  updated: string;
}

export interface CreatedOAuthApp extends OAuthApp {
  raw_secret?: string;
  rawSecret?: string;
}

export interface CreateOAuthAppInput {
  name: string;
  redirect_uris: string;
}

export interface UpdateOAuthAppInput {
  name: string;
  redirect_uris: string;
}
