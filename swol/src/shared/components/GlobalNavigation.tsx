import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "../../features/auth/screens/Login";
import { useSupabase } from "../hooks/useSupabase";
import { Tabs } from "./Tabs";

const Stack = createStackNavigator();

export function GlobalNavigation() {
  const { isLoggedIn } = useSupabase();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isLoggedIn ? "Tabs" : "Login"}
        screenOptions={{ headerShown: false }}
      >
        {isLoggedIn ? (
          <Stack.Screen name="Tabs" component={Tabs} />
        ) : (
          <>
            <Stack.Screen name="Login" component={Login} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
