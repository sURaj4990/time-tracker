import React, { useMemo, useState } from "react";
import { View, Text, Pressable, TextInput, StyleSheet } from "react-native";
import type { PomodoroState } from "../../hooks/usePomodoro";
import type { PomodoroMinutes } from "../../settings/AppSettings";
import { fmtClock } from "../../lib/format";
import { useTheme } from "../../theme/ThemeContext";
import TimePickerSheet from "../TimePickerSheet";
import { createSessionStyles } from "./styles";

const range = (from: number, to: number, step: number) =>
  Array.from(
    { length: Math.floor((to - from) / step) + 1 },
    (_, i) => from + i * step,
  );

const PHASE_LABEL = {
  focus: "Focus",
  shortBreak: "Short break",
  longBreak: "Long break",
} as const;

const DURATIONS: {
  key: keyof PomodoroMinutes;
  label: string;
  values: number[];
}[] = [
  { key: "focus", label: "Focus", values: range(5, 90, 5) },
  { key: "shortBreak", label: "Short break", values: range(1, 30, 1) },
  { key: "longBreak", label: "Long break", values: range(5, 60, 5) },
];

type Props = {
  pomo: PomodoroState;
  durations: PomodoroMinutes;
  onChangeDurations: (d: PomodoroMinutes) => void;
  note: string;
  onNoteChange: (v: string) => void;
};

export default function PomodoroPanel({
  pomo,
  durations,
  onChangeDurations,
  note,
  onNoteChange,
}: Props) {
  const { colors } = useTheme();
  const s = useMemo(() => createSessionStyles(colors), [colors]);
  const [editing, setEditing] = useState<(typeof DURATIONS)[number] | null>(
    null,
  );

  const idle = pomo.status === "idle";
  const primary =
    pomo.status === "running"
      ? "Pause"
      : pomo.status === "paused"
        ? "Resume"
        : "Start";
  const onPrimary = pomo.status === "running" ? pomo.pause : pomo.start;
  const inFocus = pomo.phase === "focus";

  return (
    <View>
      <Text style={s.phase}>{PHASE_LABEL[pomo.phase]}</Text>
      <Text style={s.clock}>{fmtClock(pomo.remainingMs)}</Text>
      <Text style={s.meta}>Focus blocks this session: {pomo.completed}</Text>

      <View style={s.row}>
        <Pressable style={[s.btn, s.primary]} onPress={onPrimary}>
          <Text style={s.primaryText}>{primary}</Text>
        </Pressable>
        {inFocus ? (
          <Pressable style={[s.btn, s.secondary]} onPress={pomo.stop}>
            <Text style={s.secondaryText}>Stop</Text>
          </Pressable>
        ) : (
          <Pressable style={[s.btn, s.secondary]} onPress={pomo.skipBreak}>
            <Text style={s.secondaryText}>Skip break</Text>
          </Pressable>
        )}
      </View>

      <Text style={s.label}>Note (optional)</Text>
      <TextInput
        style={[s.input, { minHeight: 60, textAlignVertical: "top" }]}
        value={note}
        onChangeText={onNoteChange}
        placeholder="What are you working on?"
        placeholderTextColor={colors.placeholder}
        multiline
        maxLength={200}
      />

      <Text style={s.label}>Durations</Text>
      <View style={styles.chips}>
        {DURATIONS.map((d) => (
          <Pressable
            key={d.key}
            disabled={!idle}
            onPress={() => setEditing(d)}
            style={[
              styles.chip,
              { backgroundColor: colors.surface },
              !idle && s.disabled,
            ]}
          >
            <Text style={[styles.chipLabel, { color: colors.textSubtle }]}>
              {d.label}
            </Text>
            <Text style={[styles.chipValue, { color: colors.text }]}>
              {durations[d.key]} min
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={s.hint}>
        Each focus block is saved to this topic with your note. Breaks aren't
        logged.
      </Text>

      <TimePickerSheet
        visible={editing !== null}
        title={editing ? `${editing.label} length` : ""}
        minutes={editing?.values ?? []}
        initialMinute={editing ? durations[editing.key] : 0}
        formatMinute={(m) => `${m} min`}
        onClose={() => setEditing(null)}
        onConfirm={(_, m) => {
          if (editing) onChangeDurations({ ...durations, [editing.key]: m });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: "row", gap: 10 },
  chip: { flex: 1, padding: 12, borderRadius: 12, alignItems: "center" },
  chipLabel: { fontSize: 12 },
  chipValue: { fontSize: 16, fontWeight: "600", marginTop: 2 },
});
