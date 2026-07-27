export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export interface AuthenticationResponse {
  authenticated: true;
  user: AuthenticatedUser;
}
