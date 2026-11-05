import React, { useMemo } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import type { StopwatchState } from "../../hooks/useStopwatch";
import { useTheme } from "../../theme/ThemeContext";
import { createSessionStyles } from "./styles";

function fmtStopwatch(ms: number) {
  const total = Math.floor(ms / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
}

export default function TimerPanel({
  timer,
  note,
  onNoteChange,
  onStop,
}: {
  timer: StopwatchState;
  note: string;
  onNoteChange: (v: string) => void;
  onStop: () => void;
}) {
  const { colors } = useTheme();
  const s = useMemo(() => createSessionStyles(colors), [colors]);
  const primary =
    timer.status === "running"
      ? "Pause"
      : timer.status === "paused"
        ? "Resume"
        : "Start";
  const onPrimary = timer.status === "running" ? timer.pause : timer.start;

  return (
    <View>
      <Text style={s.clock}>{fmtStopwatch(timer.elapsedMs)}</Text>

      <View style={s.row}>
        <Pressable style={[s.btn, s.primary]} onPress={onPrimary}>
          <Text style={s.primaryText}>{primary}</Text>
        </Pressable>
        {timer.isActive && (
          <Pressable style={[s.btn, s.secondary]} onPress={onStop}>
            <Text style={s.secondaryText}>Stop & save</Text>
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
      <Text style={s.hint}>Sessions under one minute aren't saved.</Text>
    </View>
  );
}
