import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, Modal } from "react-native";
import Wheel from "./Wheel";
import { useTheme } from "../theme/ThemeContext";
import { Palette } from "../theme/palettes";
import React from "react";

type Props = {
  visible: boolean;
  title: string;
  hours?: number[]; // leave out for a single-column picker
  minutes: number[];
  initialHour?: number;
  initialMinute: number;
  formatHour?: (h: number) => string;
  formatMinute?: (m: number) => string;
  onClose: () => void;
  onConfirm: (hour: number, minute: number) => void;
};

export default function TimePickerSheet({
  visible,
  title,
  hours,
  minutes,
  initialHour = 0,
  initialMinute,
  formatHour = (h) => String(h),
  formatMinute = (m) => String(m),
  onClose,
  onConfirm,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [hour, setHour] = useState(initialHour);
  const [minute, setMinute] = useState(initialMinute);

  // Each time the sheet opens, start from the saved value
  useEffect(() => {
    if (visible) {
      setHour(initialHour);
      setMinute(initialMinute);
    }
  }, [visible, initialHour, initialMinute]);

  const done = () => {
    onConfirm(hour, minute);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.wheels}>
            {hours && (
              <>
                <Wheel
                  values={hours}
                  value={hour}
                  onChange={setHour}
                  format={formatHour}
                  width={90}
                />
                <Text style={styles.colon}>:</Text>
              </>
            )}
            <Wheel
              values={minutes}
              value={minute}
              onChange={setMinute}
              format={formatMinute}
              width={hours ? 90 : 170}
            />
          </View>

          <View style={styles.buttons}>
            <Pressable onPress={onClose} style={styles.cancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={done} style={styles.done}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function createStyles(c: Palette) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: c.overlay,
      justifyContent: "center",
      alignItems: "center",
    },
    card: {
      width: "85%",
      backgroundColor: c.surface,
      borderRadius: 20,
      padding: 20,
      alignItems: "center",
    },
    title: { fontSize: 18, fontWeight: "700", color: c.text, marginBottom: 8 },
    wheels: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    colon: {
      fontSize: 22,
      fontWeight: "700",
      color: c.text,
      marginHorizontal: 4,
    },
    buttons: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 12,
      width: "100%",
      marginTop: 16,
    },
    cancel: { paddingVertical: 10, paddingHorizontal: 16 },
    cancelText: { color: c.textMuted, fontSize: 16, fontWeight: "600" },
    done: {
      backgroundColor: c.primary,
      paddingVertical: 10,
      paddingHorizontal: 22,
      borderRadius: 10,
    },
    doneText: { color: c.onPrimary, fontSize: 16, fontWeight: "600" },
  });
}
