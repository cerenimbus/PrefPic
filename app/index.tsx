import React from "react";
import { ImageBackground, Image,StyleSheet,TouchableOpacity,View,Text, SafeAreaView} from "react-native";
import { useRouter } from "expo-router";
import { useContext,useState,useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "./AuthContext";


export default function start(){

  const router = useRouter();
  const authContext = useContext(AuthContext);
  const authCode = authContext?.authCode || null;

  const [userType, setUserType] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);



  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedAuthCode = await AsyncStorage.getItem("authorizationCode");
        const storedType = await AsyncStorage.getItem("type");
        const storedStatus = await AsyncStorage.getItem("status");

        setUserType(storedType);
        setStatus(storedStatus);

        console.log("Auth Code:", storedAuthCode);
        console.log("User Type:", storedType);
        console.log("Status:", storedStatus);

        if (authCode) {
          if (storedType === "Physician" && storedStatus === "Demo") {
            router.replace("/library");
          } else if (storedType === "Surgical Staff" && storedStatus === "Demo") {
            console.log("Invalid combination: Surgical Staff cannot be in demo mode.");
          } else if (storedType === "Surgical Staff" && storedStatus === "Active") {
            router.replace("/sign-in");
          } else if (storedType === "Physician" && storedStatus === "Active") {
            router.replace("/sign-in");
          } else if (storedStatus === "Verified") {
            router.replace("/");
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);

      }
    };

    fetchUserData();
  }, [authCode]);


  const handlePhysicianPress = async () => {
      await AsyncStorage.setItem("isSurgicalStaff", "false");
      router.push("/startpage");
  };

  const handleSurgicalStaffPress = async () => {
      await AsyncStorage.setItem("isSurgicalStaff", "true");
      router.push("/sign-in");
  };


    return(

        <ImageBackground source={require("../assets/Start.jpg")} style={styles.background}>
          <SafeAreaView style={{ flex: -2}}>
            <View style= {styles.container}>
                

                  <View style={styles.imageTextContainer}>
                             <Image source={require("../assets/gray.jpg")} style={styles.imagestyle} />
                           </View>
                 <View>
                    <TouchableOpacity  style={styles.getButton} onPress={handlePhysicianPress}>
                    <Text style={styles.text1}>Physician</Text>
                    </TouchableOpacity>
                 </View>
                 <View>
                    <TouchableOpacity 
                    style={styles.getButton2} 
                    onPress={handleSurgicalStaffPress}>
                        <Text style = {styles.text2}>Surgical Staff</Text>
                    </TouchableOpacity>
                 </View>
            </View>
            </SafeAreaView>

        </ImageBackground>
    )


}

const styles = StyleSheet.create({

    background: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      },
      container: {
       
        width: 294,
        height: 255,
        justifyContent: "center",
        padding: 15,
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 30,
        marginTop: 40
      },
      imageTextContainer: {
        alignItems: "center",
        marginTop: -10,
      },
      imagestyle: {
        width: 99,
        height: 99,
        borderRadius: 50,
      },
      getButton: {
        backgroundColor: "#375894", 
        borderRadius: 31,
        paddingVertical: 10,
        width: 262,
        alignItems: "center",
        marginTop: 20,
        height: 37
        
        
      },
      getButton2: {
        backgroundColor: "#375894", 
        borderRadius: 31,
        paddingVertical: 10,
        width: 262,
        alignItems: "center",
        marginTop: 15,
        height: 37
        
      },
      text1:{
        fontSize: 14,
        color: "#FFFFFF",
        fontWeight: "bold"

      },
      text2:{
        fontSize: 14,
        color: "#FFFFFF",
        fontWeight: "bold"

      },
})