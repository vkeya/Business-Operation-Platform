export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
}

export interface AuthContext {
  user: AuthenticatedUser;
}

export function requireAuthContext(
  context: AuthContext | null | undefined,
): AuthContext {
  if (!context?.user?.id) {
    throw new Error("Authentication is required.");
  }

  return context;
}