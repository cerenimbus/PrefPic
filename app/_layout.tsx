import { Stack,useSegments } from "expo-router";
import { AuthProvider } from "./AuthContext";  // Import AuthProvider


export default function RootLayout() {
  const segments = useSegments();
  console.log("Current Route:", segments);
  return (
    
    
     <AuthProvider>

    <Stack>
       
      <Stack.Screen name="loading" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="addPearls" options={{ headerShown: false }} />
      <Stack.Screen name="procedureReviewSummary" options={{ headerShown: false }} />
      <Stack.Screen name="viewProcedure" options={{headerShown: false}} />
      <Stack.Screen name="reviewImage" options={{headerShown:false}} />
      <Stack.Screen name="sign-in" options={{headerShown: false}} />
      <Stack.Screen name="forgotpassword" options={{headerShown: false}} />
      <Stack.Screen name="viewEditPicture" options={{headerShown:false}}/>
      <Stack.Screen name="retakePicture" options={{headerShown:false}}/>
      <Stack.Screen name="addProcedure" options={{ headerShown:false}} />
      <Stack.Screen name="library" options={{headerShown: false}} />           {/*library screen*/}
      <Stack.Screen name="second_library" options={{headerShown: false}} />    
      <Stack.Screen name="camera" options={{headerShown: false}} />

      <Stack.Screen name="startpage" options={{headerShown: false}} />
      <Stack.Screen name="editPictureText" options={{headerShown: false}} />


      <Stack.Screen name="enterTeamMember" options={{headerShown: false}} />

      {/* <Stack.Screen name="viewProcedure" options={{headerShown: false}} /> */}
      <Stack.Screen name="addTeamMember" options={{headerShown: false}} />
      {/* <Stack.Screen name="addTeamMemberCode" options={{headerShown: false}} /> */}
      <Stack.Screen name="addTeamMemberDisplay" options={{headerShown: false}} />

      <Stack.Screen name ="teamMember" options={{headerShown:false}} /> 
      <Stack.Screen name ="feedback" options={{headerShown:false}} />

      {/* <Stack.Screen name="viewProcedure" options={{headerShown: false}} /> */}
      <Stack.Screen name="help" options={{headerShown: false}} />

      <Stack.Screen name="createAccount" options={{headerShown: false}} />
      <Stack.Screen name="completeDemo" options={{headerShown: false}} />
      <Stack.Screen name="mainAccountPage" options={{headerShown: false}} />




    </Stack>
    </AuthProvider>
    
  );
}
