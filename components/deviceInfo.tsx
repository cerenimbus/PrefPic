import { Platform } from "react-native";
import constants from "expo-constants";

export const getDeviceID = async () => {
    return {
        id: constants.sessionId || 'UnknownDeviceID',
        type: Platform.OS === 'ios' ? 'iOS' : 'Android',
        model: '', 
        version: Platform.Version.toString() || 'UnknownVersion', 
        softwareVersion:  '',
    };
  };