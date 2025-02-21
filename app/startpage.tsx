import React from "react";
import { ImageBackground, Image,StyleSheet,TouchableOpacity,View,Text, SafeAreaView} from "react-native";
import { useRouter } from "expo-router";
import { useState,useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function start(){

  const router = useRouter();
  const [physicianStatus, setPhysicianStatus] = useState<string | null>(null);

  useEffect(() => {
    const checkPhysicianStatus = async () => {
      const status = await AsyncStorage.getItem("status");
      setPhysicianStatus(status); // No more TypeScript error
    };
  
    checkPhysicianStatus();
  }, []);

  const handlePhysicianPress = () => {
    if (physicianStatus === "Demo" || physicianStatus === "Active") {
      router.push("/sign-in"); 
    } else {
      router.push("/"); 
    }
  };

    return(

        <ImageBackground source={require("../assets/Start.jpg")} style={styles.background}>
          <SafeAreaView style={{ flex: -2}}>
            <View style= {styles.container}>
                

                  <View style={styles.imageTextContainer}>
                             <Image source={require("../assets/gray.jpg")} style={styles.imagestyle} />
                           </View>
                 <View>
                    <TouchableOpacity  style={styles.getButton} onPress={() => router.push("/sign-in")}
              >
                    <Text style={styles.text1}>Physician</Text>
                    </TouchableOpacity>
                 </View>
                 <View>
                    <TouchableOpacity style={styles.getButton2} onPress={() => router.push("/")}
                >
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