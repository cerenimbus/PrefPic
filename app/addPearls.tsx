import { useRouter, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AddPearls() {
  const router = useRouter();
  // const {
  //   procedureName,
  //   alwaysDo: alwaysDoParam,
  //   watchFor: watchForparam,
  //   neverDo: neverDoParam,
  // } = useLocalSearchParams();

  const scrollViewRef = useRef<ScrollView | null>(null);
  const alwaysDoRef = useRef<TextInput | null>(null);
  const watchForRef = useRef<TextInput | null>(null);
  const neverDoRef = useRef<TextInput | null>(null);

  const params = useLocalSearchParams();
  const procedureName = Array.isArray(params.procedureName) ? params.procedureName[0] : params.procedureName;
  const alwaysDoParam = Array.isArray(params.alwaysDo) ? params.alwaysDo[0] : params.alwaysDo;
  const watchForparam = Array.isArray(params.watchFor) ? params.watchFor[0] : params.watchFor;
  const neverDoParam = Array.isArray(params.neverDo) ? params.neverDo[0] : params.neverDo;

  const [alwaysDo, setAlwaysDo] = useState<string>(alwaysDoParam || "");
  const [watchFor, setWatchFor] = useState<string>(watchForparam || "");
  const [neverDo, setNeverDo] = useState<string>(neverDoParam || "");
  const [activeField, setActiveField] = useState<React.RefObject<TextInput> | null>(null); 

  const navigateToProcedureReviewSummary = async() => {
    // Create an array of the values
    const pearlsArray = [alwaysDo, watchFor, neverDo];

    // MG 02/28/2025
    // Save the array in AsyncStorage with a unique key for the procedure
    await AsyncStorage.setItem(`procedurePearls_${procedureName}`, JSON.stringify(pearlsArray));

    router.push({
      pathname: "procedureReviewSummary",
      params: { procedureName, alwaysDo, watchFor, neverDo },
    });
  };    

  const handleFocus = (inputRef: React.RefObject<TextInput>) => {
    setActiveField(inputRef);
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 100, animated: true });
    }, 300);
  };

  const handleBlur = () => {
    setActiveField(null);
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    handleBlur();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <ScrollView ref={scrollViewRef} contentContainerStyle={styles.container}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.header}>Procedure Pearls</Text>

          {/* Always Do */}
          <View style={styles.section}>
            <View style={styles.labelContainer}>
              <View style={[styles.dot, { backgroundColor: "green" }]} />
              <Text style={styles.label}>Always Do</Text>
            </View>
            <TextInput
              ref={alwaysDoRef}
              style={[styles.input, activeField === alwaysDoRef ? styles.activeInput : {}]}
              multiline
              placeholder="Enter details..."
              value={alwaysDo}
              onChangeText={setAlwaysDo}
              onFocus={() => handleFocus(alwaysDoRef)}
              onBlur={handleBlur}
              returnKeyType="done"
            />
          </View>

          {/* Watch For */}
          <View style={styles.section}>
            <View style={styles.labelContainer}>
              <View style={[styles.dot, { backgroundColor: "orange" }]} />
              <Text style={styles.label}>Watch For</Text>
            </View>
            <TextInput
              ref={watchForRef}
              style={[styles.input, activeField === watchForRef ? styles.activeInput : {}]}
              multiline
              placeholder="Enter details..."
              value={watchFor}
              onChangeText={setWatchFor}
              onFocus={() => handleFocus(watchForRef)}
              onBlur={handleBlur}
              returnKeyType="done"
            />
          </View>

          {/* Never Do */}
          <View style={styles.section}>
            <View style={styles.labelContainer}>
              <View style={[styles.dot, { backgroundColor: "red" }]} />
              <Text style={styles.label}>Never Do</Text>
            </View>
            <TextInput
              ref={neverDoRef}
              style={[styles.input, activeField === neverDoRef ? styles.activeInput : {}]}
              multiline
              placeholder="Enter details..."
              value={neverDo}
              onChangeText={setNeverDo}
              onFocus={() => handleFocus(neverDoRef)}
              onBlur={handleBlur}
              returnKeyType="done"
            />
          </View>

          {/* Done Button */}
          {activeField && (
            <TouchableOpacity style={styles.doneButton} onPress={dismissKeyboard}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          )}

          {/* Next Button */}
          <TouchableOpacity style={styles.button} onPress={navigateToProcedureReviewSummary}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  backText: {
    fontSize: 18,
    color: "#007AFF",
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    minHeight: 120,
  },
  activeInput: {
    borderColor: "#007AFF",
    backgroundColor: "#e6f0ff",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  doneButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    alignSelf: "flex-end",
    marginTop: 10,
  },
  doneText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
