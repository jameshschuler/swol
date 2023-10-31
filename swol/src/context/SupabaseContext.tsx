import { createContext } from "react";

type SupabaseContextProps = {
  isLoggedIn: boolean;
  userId?: string;
  //login: (email: string, password: string) => Promise<void>;
  //register: (email: string, password: string) => Promise<void>;
  //forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  getGoogleOAuthUrl: () => Promise<string | null>;
  setOAuthSession: (tokens: {
    access_token: string;
    refresh_token: string;
  }) => Promise<void>;
};

export const SupabaseContext = createContext<SupabaseContextProps>({
  isLoggedIn: false,
  //login: async () => {},
  //register: async () => {},
  //forgotPassword: async () => {},
  logout: async () => {},
  getGoogleOAuthUrl: async () => "",
  setOAuthSession: async () => {},
});
