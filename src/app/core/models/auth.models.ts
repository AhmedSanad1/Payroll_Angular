export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoggedUser {
  accessToken: string;
  accessTokenExpiresAtUtc: string;
  username: string;
}

export interface CurrentUser {
  id: number;
  username: string;
}
