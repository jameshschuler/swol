import { faGithub } from "@fortawesome/free-brands-svg-icons/faGithub";
import { faGoogle } from "@fortawesome/free-brands-svg-icons/faGoogle";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSupabase } from "../../../shared/hooks/useSupabase";

type Provider = "google" | "github";

export default function Login() {
  const { getGoogleOAuthUrl, setOAuthSession } = useSupabase();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    WebBrowser.warmUpAsync();

    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  async function handleLogin(provider: Provider) {
    setLoading(true);
    try {
      const url = await getGoogleOAuthUrl();
      if (!url) {
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(
        url,
        process.env.GOOGLE_REDIRECT_URL,
        {
          showInRecents: true,
        }
      );

      if (result.type === "success") {
        const data = extractParamsFromUrl(result.url);

        if (!data.access_token || !data.refresh_token) {
          return;
        }

        setOAuthSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });

        // TODO: might not need this
        SecureStore.setItemAsync(
          "google-access-token",
          JSON.stringify(data.provider_token)
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const extractParamsFromUrl = (url: string) => {
    const params = new URLSearchParams(url.split("#")[1]);
    const data = {
      access_token: params.get("access_token"),
      expires_in: parseInt(params.get("expires_in") || "0"),
      refresh_token: params.get("refresh_token"),
      token_type: params.get("token_type"),
      provider_token: params.get("provider_token"),
    };

    return data;
  };

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.title}>swol.</Text>
      </View>
      <View style={styles.bottom}>
        {/* <TouchableOpacity style={styles.btn}>
          <Text style={styles.btnText}>Sign In</Text>
        </TouchableOpacity> */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.smallBtn}
            onPress={() => handleLogin("google")}
            disabled={loading}
          >
            <FontAwesomeIcon
              size={20}
              icon={faGoogle} // TODO: change icon when loading
              color={constants.colors.green}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.smallBtn}
            onPress={() => handleLogin("github")}
          >
            <FontAwesomeIcon
              size={20}
              icon={faGithub}
              color={constants.colors.green}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const constants = {
  colors: {
    green: "green",
  },
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#CCC",
    alignItems: "center",
    height: "100%",
  },
  title: {
    fontSize: 112,
    fontWeight: "500",
    color: constants.colors.green,
  },
  bottom: {
    backgroundColor: "#FFF",
    height: "50%",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
  },
  top: {
    backgroundColor: "#f8f8f3",
    width: "100%",
    height: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 30,
  },
  btn: {
    padding: 15,
    borderColor: constants.colors.green,
    borderWidth: 2,
    borderRadius: 15,
    width: "50%",
  },
  smallBtn: {
    padding: 15,
    borderWidth: 2,
    borderRadius: 50,
    borderColor: constants.colors.green,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
    color: constants.colors.green,
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
  },
  btnIcon: {
    textAlign: "center",
    marginHorizontal: "auto",
  },
});
