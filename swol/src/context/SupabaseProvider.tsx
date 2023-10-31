import { useEffect, useState } from "react";
import { supabaseClient } from "../lib/supabase";
import { SupabaseContext } from "./SupabaseContext";

type SupabaseProviderProps = {
  children: JSX.Element | JSX.Element[];
};

export const SupabaseProvider = (props: SupabaseProviderProps) => {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [isNavigationReady, setNavigationReady] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();

  const getGoogleOAuthUrl = async (): Promise<string | null> => {
    const result = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: process.env.GOOGLE_REDIRECT_URL,
      },
    });

    return result.data.url;
  };

  const setOAuthSession = async (tokens: {
    access_token: string;
    refresh_token: string;
  }) => {
    const { data, error } = await supabaseClient.auth.setSession({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });

    if (error) {
      throw error;
    }

    setLoggedIn(data.session !== null);
  };

  const logout = async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    setLoggedIn(false);
  };

  const checkIfUserIsLoggedIn = async () => {
    const result = await supabaseClient.auth.getSession();
    setUserId(result.data.session?.user.id);
    setLoggedIn(result.data.session !== null);
    setNavigationReady(true);
  };

  useEffect(() => {
    checkIfUserIsLoggedIn();
  }, []);

  return (
    <SupabaseContext.Provider
      value={{ getGoogleOAuthUrl, isLoggedIn, logout, setOAuthSession, userId }}
    >
      {isNavigationReady ? props.children : null}
    </SupabaseContext.Provider>
  );
};
