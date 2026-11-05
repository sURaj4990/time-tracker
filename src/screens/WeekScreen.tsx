import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { BarChart } from "react-native-gifted-charts";
import { getDomains, getRangeTotals, DomainRow, RangeRow } from "../db/queries";
import { lastNDays, formatDay } from "../lib/date";
import { fmtDuration } from "../lib/format";
import { useTheme } from "../theme/ThemeContext";
import { Palette } from "../theme/palettes";

const DAYS = 7;

export default function WeekScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [days, setDays] = useState<string[]>([]);
  const [rows, setRows] = useState<RangeRow[]>([]);
  const [roots, setRoots] = useState<DomainRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const dates = lastNDays(DAYS);
        const [r, all] = await Promise.all([
          getRangeTotals(dates[0], dates[dates.length - 1]),
          getDomains(),
        ]);
        setDays(dates);
        setRows(r);
        setRoots(all.filter((d) => d.parent_id == null));
      })();
    }, []),
  );

  const weekTotal = rows.reduce((sum, r) => sum + r.seconds, 0);

  const stackData = days.map((date) => {
    const stacks = roots
      .map((root) => {
        const match = rows.find(
          (r) => r.entry_date === date && r.rootId === root.id,
        );
        return match
          ? { value: Math.round(match.seconds / 60), color: root.color }
          : null;
      })
      .filter((s): s is { value: number; color: string } => s !== null);

    return {
      label: formatDay(date, { weekday: "short" }),
      stacks: stacks.length > 0 ? stacks : [{ value: 0, color: colors.empty }],
    };
  });

  const maxMinutes = Math.max(
    60,
    ...days.map((date) =>
      rows
        .filter((r) => r.entry_date === date)
        .reduce((sum, r) => sum + Math.round(r.seconds / 60), 0),
    ),
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.total}>
        Last 7 days · {weekTotal > 0 ? fmtDuration(weekTotal) : "0m"}
      </Text>

      {weekTotal === 0 ? (
        <Text style={styles.empty}>Nothing logged this week yet.</Text>
      ) : (
        <View style={styles.chartWrap}>
          <BarChart
            stackData={stackData}
            barWidth={24}
            spacing={18}
            initialSpacing={12}
            width={width - 100}
            height={220}
            maxValue={maxMinutes}
            noOfSections={4}
            backgroundColor={colors.background}
            yAxisLabelSuffix="m"
            yAxisTextStyle={{ color: colors.textSubtle, fontSize: 11 }}
            xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 11 }}
            yAxisColor={colors.border}
            xAxisColor={colors.border}
            rulesColor={colors.border}
            yAxisThickness={0}
            xAxisThickness={0}
          />
        </View>
      )}

      <View style={styles.legend}>
        {roots.map((root) => (
          <View key={root.id} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: root.color }]} />
            <Text style={styles.legendText}>{root.name}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function createStyles(c: Palette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    content: { padding: 24, paddingTop: 16 },
    total: { fontSize: 15, color: c.textSubtle, textAlign: "center" },
    empty: { textAlign: "center", color: c.textSubtle, marginTop: 40 },
    chartWrap: { alignItems: "center", marginVertical: 20 },
    legend: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 16,
      marginTop: 8,
    },
    legendItem: { flexDirection: "row", alignItems: "center" },
    dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
    legendText: { fontSize: 14, color: c.textMuted },
  });
}
