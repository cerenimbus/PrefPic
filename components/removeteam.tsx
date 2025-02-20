import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Modal from "react-native-modal";

interface RemoveTeamMemberModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  memberName: string;
  memberPhone: string;
}

const RemoveTeamMemberModal: React.FC<RemoveTeamMemberModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  memberName,
  memberPhone
}) => {
  return (
    <Modal isVisible={isVisible} backdropOpacity={0.5}>
      <View style={styles.modalContainer}>
        <Text style={styles.title}>Remove Team Member</Text>
        <Text style={styles.message}>
          Are you sure you want to remove{" "}
          <Text style={styles.boldText}>{memberName}</Text> -
          <Text style={styles.boldText}> {memberPhone}</Text> from your team?
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={onConfirm}>
            <Text style={styles.buttonText}>Yes, Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  boldText: {
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    flex: 1,
    padding: 12,
    backgroundColor: "#3b5998",
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  confirmButton: {
    backgroundColor: "#1d4ed8",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default RemoveTeamMemberModal;
