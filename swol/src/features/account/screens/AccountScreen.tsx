import { Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

export function AccountScreen() {
  return (
    <View>
      <Text>Account</Text>
      <TouchableOpacity>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
