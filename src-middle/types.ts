export interface ITranslation {
  text: string;
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  translated?: string;
}

export class Translation implements ITranslation {
  text: string;
  clientId: string;
  clientSecret: string;
  accessToken: string;
  translated: string;
}

export class Credential {
  ClientId: string;
  ClientSecret: string;
}