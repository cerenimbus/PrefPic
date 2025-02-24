import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Modal from "react-native-modal";

type Member = {
  name: string;
  phone: string;
};

type Props = {
  isVisible: boolean;
  onClose: () => void;
  onRemove: () => void;
  member: Member;
};

const RemoveTeamMemberModal: React.FC<Props> = ({ isVisible, onClose, onRemove, member }) => {
  return (
    <Modal isVisible={isVisible} backdropOpacity={0.5}>
      <View style={styles.modalContainer}>
        <Text style={styles.title}>Remove Team Member</Text>
        <Text style={styles.message}>
          Are you sure you want to remove {" "}
          <Text style={styles.boldText}>{member.name}</Text> - {" "}
          <Text style={styles.boldText}>{member.phone}</Text> from your team?
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.goBackButton} onPress={onClose}>
            <Text style={styles.goBackText}>Go Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
            <Text style={styles.removeText}>Remove</Text>
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
  goBackButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#1E3A8A",
    alignItems: "center",
    marginRight: 5,
  },
  goBackText: {
    color: "#1E3A8A",
    fontWeight: "bold",
  },
  removeButton: {
    flex: 1,
    padding: 10,
    backgroundColor: "#1E3A8A",
    borderRadius: 5,
    alignItems: "center",
    marginLeft: 5,
  },
  removeText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default RemoveTeamMemberModal;
