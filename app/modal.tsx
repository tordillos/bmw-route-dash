import { StatusBar } from "expo-status-bar";
import { Platform, View } from "react-native";

export default function ModalScreen() {
  return (
    <View>
      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}
