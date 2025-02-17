import { router, useRouter, useLocalSearchParams } from "expo-router";
import React, {useState, useEffect} from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from "react-native";

export default function ProcedureReviewSummary() {
  const {procedureName, alwaysDo: alwaysDoParam, watchFor: watchForParam, neverDo: neverDoParam}= useLocalSearchParams();
  const router =  useRouter();

  const navigateToLibrary = () => {
    router.push({
      pathname: "library",
      params: { procedureName, alwaysDo, watchFor, neverDo },
    });
  }

  const [alwaysDo, setAlwaysDo] = useState(alwaysDoParam || "");
  const [watchFor, setWatchFor] = useState(watchForParam || "");
  const [neverDo, setNeverDo] = useState(neverDoParam || "");
  const navigatetoaddpearls = () => {
    router.push({
      pathname: "addPearls",   
      params: { procedureName, alwaysDo, watchFor, neverDo },
    });
  }
  useEffect(() => {
    if (alwaysDoParam) {
      setAlwaysDo(alwaysDoParam);
    }
  }, [alwaysDoParam]);
  
  useEffect(() => {
    if (watchForParam) {
      setWatchFor(watchForParam);
    }
  }, [watchForParam]);

  useEffect(() => {
    if (neverDoParam) {
      setNeverDo(neverDoParam);
    }
  }, [neverDoParam]);
  // const navigateToLoading = () => {
  //   router.push("loading");
  // }
  return (
    <View style={styles.container}>
     
        <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>←  Back</Text>
        </TouchableOpacity>

      
      <View style={styles.titleSection}>
      <Text style={styles.procedureNameText}>{procedureName}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* 
        //RHCM 
        //Images Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Images</Text>
          </View>
          <View style={styles.imagesContainer}>
            {Array.from({ length: 6 }).map((_, index) => (
              <View key={index} style={styles.imagePlaceholder} />
            ))}
          </View>
        </View>

        {/* 
        //RHCM 
        //Procedure Pearls Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Procedure Pearls</Text>
            <Text style={styles.editText}>Edit</Text>
          </View>
          <View>
            <Text style={[styles.label, { color: "green" }]}>● Always Do</Text>
            <Text style={styles.description}>
              {alwaysDo}
            </Text>

            <Text style={[styles.label, { color: "orange" }]}>● Watch For</Text>
            <Text style={styles.description}>
              {watchFor}
            </Text>

            <Text style={[styles.label, { color: "red" }]}>● Never Do</Text>
            <Text style={styles.description}>
              {neverDo}
            </Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={navigatetoaddpearls}>
        <Text style={styles.buttonText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={navigateToLibrary}>
        <Text style={styles.FinishButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f6fc",
    padding: 20,
  },
  procedureNameText: {
    fontSize: 45,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Roboto',
},
  deleteButton:{
    backgroundColor: "#FFFFF",
    paddingVertical: 14,
    borderRadius: 31,
    alignItems: "center",
    marginTop: 10,
    borderColor: "375894",
    borderWidth: 1,
  },
  FinishButtonText: {
    color: "#375894"  ,
    fontSize: 16, // Adjusted font size
    fontWeight: "bold",
},
  backText: {
    fontSize: 16,
    color: "#3b82f6",
    marginBottom: 10,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  procedureName: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    alignItems: "center",
  },
  editText: {
    fontSize: 14,
    color: "#3b82f6",
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  imagePlaceholder: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#375894",
    paddingVertical: 15,
    borderRadius: 31,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
