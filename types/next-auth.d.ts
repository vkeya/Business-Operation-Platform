import type {
  DefaultSession,
} from "next-auth";

import type {
  DefaultJWT,
} from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
	  passwordChangedAt?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    passwordChangedAt?: string | null;
  }
}