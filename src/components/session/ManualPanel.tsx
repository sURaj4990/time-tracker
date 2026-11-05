import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
} from "react-native";
import { insertEntry } from "../../db/entries";
import {
  toLocalDate,
  parseLocalDate,
  shiftDate,
  formatDay,
} from "../../lib/date";
import { fmtDuration } from "../../lib/format";
import { useTheme } from "../../theme/ThemeContext";
import TimePickerSheet from "../TimePickerSheet";
import { createSessionStyles } from "./styles";

const HOURS = Array.from({ length: 13 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

export default function ManualPanel({
  topicId,
  label,
}: {
  topicId: number;
  label: string;
}) {
  const { colors } = useTheme();
  const s = useMemo(() => createSessionStyles(colors), [colors]);
  const today = toLocalDate(new Date());

  const [date, setDate] = useState(today);
  const [hours, setHours] = useState(0);
  const [mins, setMins] = useState(30);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [picking, setPicking] = useState(false);

  const totalMinutes = hours * 60 + mins;
  const valid = totalMinutes > 0 && totalMinutes <= 24 * 60;

  const save = async () => {
    if (!valid) {
      Alert.alert("Check the duration", "Choose at least one minute.");
      return;
    }
    setSaving(true);
    try {
      await insertEntry({
        topicId,
        durationSeconds: totalMinutes * 60,
        startedAt: parseLocalDate(date),
        source: "manual",
        note: note.trim() || undefined,
      });
      Alert.alert(
        "Saved",
        `${fmtDuration(totalMinutes * 60)} logged to ${label} on ${date}.`,
      );
      setNote("");
    } catch {
      Alert.alert("Could not save", "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const arrow = {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  };

  return (
    <View>
      <Text style={s.label}>Date</Text>
      <View style={styles.dateRow}>
        <Pressable style={arrow} onPress={() => setDate(shiftDate(date, -1))}>
          <Text style={[styles.arrowText, { color: colors.text }]}>‹</Text>
        </Pressable>
        <Text style={[styles.dateText, { color: colors.text }]}>
          {date === today ? "Today" : formatDay(date)}
        </Text>
        <Pressable
          disabled={date >= today}
          style={[arrow, date >= today && s.disabled]}
          onPress={() => setDate(shiftDate(date, 1))}
        >
          <Text style={[styles.arrowText, { color: colors.text }]}>›</Text>
        </Pressable>
      </View>

      <Text style={s.label}>Duration</Text>
      <Pressable
        onPress={() => setPicking(true)}
        style={[
          styles.durationBox,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.durationText, { color: colors.text }]}>
          {totalMinutes > 0 ? fmtDuration(totalMinutes * 60) : "0m"}
        </Text>
        <Text style={[styles.durationHint, { color: colors.textSubtle }]}>
          Tap to change
        </Text>
      </Pressable>

      <Text style={s.label}>Note (optional)</Text>
      <TextInput
        style={[s.input, { minHeight: 60, textAlignVertical: "top" }]}
        value={note}
        onChangeText={setNote}
        placeholder="e.g. Chapter 4 of Hands-On ML"
        placeholderTextColor={colors.placeholder}
        multiline
        maxLength={200}
      />

      <Pressable
        style={[
          styles.save,
          { backgroundColor: colors.primary },
          (!valid || saving) && s.disabled,
        ]}
        disabled={!valid || saving}
        onPress={save}
      >
        <Text style={[styles.saveText, { color: colors.onPrimary }]}>
          {saving ? "Saving…" : "Save entry"}
        </Text>
      </Pressable>

      <TimePickerSheet
        visible={picking}
        title="Time spent"
        hours={HOURS}
        minutes={MINUTES}
        initialHour={hours}
        initialMinute={mins}
        formatHour={(h) => `${h}h`}
        formatMinute={(m) => `${m}m`}
        onClose={() => setPicking(false)}
        onConfirm={(h, m) => {
          setHours(h);
          setMins(m);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: { fontSize: 16, fontWeight: "600" },
  arrowText: { fontSize: 22 },
  durationBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  durationText: { fontSize: 28, fontWeight: "700" },
  durationHint: { fontSize: 13, marginTop: 4 },
  save: {
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveText: { fontSize: 16, fontWeight: "600" },
});
