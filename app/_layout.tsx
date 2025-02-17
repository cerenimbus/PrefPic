import { Stack } from "expo-router";
import { AuthProvider } from "./AuthContext";  // Import AuthProvider


export default function RootLayout() {
  return (
    
    
       <AuthProvider>

       <Stack>
      <Stack.Screen name="loading" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="addPearls" options={{ headerShown: false }} />
      <Stack.Screen name="procedureReviewSummary" options={{ headerShown: false }} />
      <Stack.Screen name="reviewImage" options={{headerShown:false}} />

      <Stack.Screen name="viewEditPicture" options={{headerShown:false}}/>
      <Stack.Screen name="retakePicture" options={{headerShown:false}}/>
      <Stack.Screen name="addProcedure" options={{ headerShown:false}} />
      <Stack.Screen name="library" options={{headerShown: false}} />           {/*library screen*/}
      <Stack.Screen name="second_library" options={{headerShown: false}} />    {/*second_library screen*/}
      <Stack.Screen name="camera" options={{headerShown: false}} />
      <Stack.Screen name="viewProcedure" options={{headerShown: false}} />
    </Stack>
    </AuthProvider>
    
  );
}
