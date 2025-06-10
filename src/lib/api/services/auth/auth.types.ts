export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    name: string;
    is_admin: string;
  };
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface RefreshTokenDto {
  refresh_token: string;
}
