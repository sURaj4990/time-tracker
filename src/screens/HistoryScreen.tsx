import React, { useCallback, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { PieChart } from "react-native-gifted-charts";
import { getDayTotals, getEntryDates, DayTotal } from "../db/queries";
import { currentStreak } from "../lib/streak";
import { toLocalDate } from "../lib/date";
import { fmtDuration } from "../lib/format";
import { useTheme } from "../theme/ThemeContext";
import { Palette } from "../theme/palettes";

export default function HistoryScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const today = toLocalDate(new Date());
  const [totals, setTotals] = useState<DayTotal[]>([]);
  const [streak, setStreak] = useState(0);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [t, dates] = await Promise.all([
          getDayTotals(today),
          getEntryDates(),
        ]);
        setTotals(t);
        setStreak(currentStreak(dates, today));
      })();
    }, [today]),
  );

  const total = totals.reduce((sum, t) => sum + t.seconds, 0);
  const isEmpty = total === 0;

  const pieData = isEmpty
    ? [{ value: 1, color: colors.empty }]
    : totals.map((t) => ({ value: t.seconds, color: t.color }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.date}>{today}</Text>
        <Text style={styles.streak}>
          🔥 {streak} {streak === 1 ? "day" : "days"}
        </Text>
      </View>

      <View style={styles.chartWrap}>
        <PieChart
          data={pieData}
          donut
          radius={120}
          innerRadius={75}
          innerCircleColor={colors.background}
          centerLabelComponent={() => (
            <View style={styles.center}>
              <Text style={styles.centerValue}>
                {isEmpty ? "0m" : fmtDuration(total)}
              </Text>
              <Text style={styles.centerLabel}>today</Text>
            </View>
          )}
        />
      </View>

      {isEmpty ? (
        <Text style={styles.empty}>Nothing logged yet today.</Text>
      ) : (
        totals.map((t) => (
          <View key={t.rootId} style={styles.row}>
            <View style={[styles.dot, { backgroundColor: t.color }]} />
            <Text style={styles.rowName}>{t.name}</Text>
            <Text style={styles.rowValue}>
              {fmtDuration(t.seconds)} · {Math.round((t.seconds / total) * 100)}
              %
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function createStyles(c: Palette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    content: { padding: 24, paddingTop: 16 },
    header: { alignItems: "center", marginBottom: 16 },
    date: { fontSize: 14, color: c.textSubtle },
    streak: { fontSize: 22, fontWeight: "700", marginTop: 4, color: c.text },
    chartWrap: { alignItems: "center", marginVertical: 16 },
    center: { alignItems: "center" },
    centerValue: { fontSize: 24, fontWeight: "700", color: c.text },
    centerLabel: { fontSize: 13, color: c.textSubtle },
    empty: { textAlign: "center", color: c.textSubtle, marginTop: 8 },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    dot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
    rowName: { flex: 1, fontSize: 16, color: c.text },
    rowValue: { fontSize: 15, color: c.textMuted },
  });
}
