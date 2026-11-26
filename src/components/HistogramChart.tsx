import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line as SvgLine, Rect } from 'react-native-svg';
import { COLORS } from '../constants/theme';
import { DarkModeTheme } from '../types';
import { computeHistogramBars } from '../lib/healthUtils';
import { MotionButton as TouchableOpacity } from './Motion';

export interface HistogramDatum {
  label: string;
  value: number;
  secondaryValue?: number;
  displayValue?: string;
}

interface HistogramChartProps {
  data: HistogramDatum[];
  minVal: number;
  maxVal: number;
  unit: string;
  primaryColor?: string;
  secondaryColor?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  height?: number;
  dm: DarkModeTheme;
  emptyText?: string;
}

export const HistogramChart: React.FC<HistogramChartProps> = ({
  data,
  minVal,
  maxVal,
  unit,
  primaryColor = COLORS.secondary,
  secondaryColor = COLORS.primary,
  primaryLabel,
  secondaryLabel,
  height = 122,
  dm,
  emptyText = 'Sem medições suficientes para exibir o gráfico.',
}) => {
  const chartWidth = 300;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const bars = useMemo(
    () => computeHistogramBars(data, minVal, maxVal, chartWidth, height),
    [data, minVal, maxVal, chartWidth, height]
  );

  const activeIdx =
    selectedIndex !== null && selectedIndex < data.length
      ? selectedIndex
      : data.length > 0
        ? data.length - 1
        : null;
  const activeItem = activeIdx !== null ? data[activeIdx] : null;

  const canvasBg = dm.isDark ? '#0D172B' : '#F8FAFC';
  const separatorStroke = canvasBg;
  const guideStroke = dm.isDark ? 'rgba(148, 163, 184, 0.16)' : 'rgba(15, 23, 42, 0.06)';

  if (data.length === 0) {
    return (
      <View
        style={[
          styles.emptyWrap,
          { backgroundColor: canvasBg, borderColor: dm.border },
        ]}
      >
        <Text style={[styles.emptyText, { color: dm.sub }]}>{emptyText}</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {/* Minimalist Tabular Readout */}
      {activeItem && (
        <View style={styles.readoutRow}>
          <View style={styles.readoutLeft}>
            <View style={[styles.readoutDot, { backgroundColor: primaryColor }]} />
            <Text style={[styles.readoutLabel, { color: dm.sub }]}>
              {activeItem.label}
            </Text>
          </View>
          <Text style={[styles.readoutValue, { color: dm.text }]}>
            {activeItem.displayValue
              ? activeItem.displayValue
              : typeof activeItem.secondaryValue === 'number'
                ? `${activeItem.value}/${activeItem.secondaryValue} ${unit}`
                : `${activeItem.value} ${unit}`}
          </Text>
        </View>
      )}

      {/* Minimalist Contiguous Stepped Histogram Canvas */}
      <View
        style={[
          styles.canvasBox,
          {
            backgroundColor: canvasBg,
            borderColor: dm.border,
          },
        ]}
      >
        <Svg
          width="100%"
          height={height}
          viewBox={`0 0 ${chartWidth} ${height}`}
          preserveAspectRatio="none"
        >
          <SvgLine
            x1="0"
            y1={Math.round(height * 0.35)}
            x2={chartWidth}
            y2={Math.round(height * 0.35)}
            stroke={guideStroke}
            strokeWidth={1}
            strokeDasharray="3,4"
          />
          <SvgLine
            x1="0"
            y1={Math.round(height * 0.7)}
            x2={chartWidth}
            y2={Math.round(height * 0.7)}
            stroke={guideStroke}
            strokeWidth={1}
            strokeDasharray="3,4"
          />

          {bars.map((bar, idx) => {
            const isSelected = idx === activeIdx;
            const barFill = isSelected ? primaryColor : `${primaryColor}48`;
            const secFill = isSelected ? secondaryColor : `${secondaryColor}58`;
            return (
              <React.Fragment key={idx}>
                <Rect
                  x={bar.x}
                  y={bar.y}
                  width={bar.width}
                  height={bar.height}
                  rx={0}
                  fill={barFill}
                  stroke={separatorStroke}
                  strokeWidth={1.5}
                />
                {typeof bar.secondaryY === 'number' &&
                  typeof bar.secondaryHeight === 'number' && (
                    <Rect
                      x={bar.x}
                      y={bar.secondaryY}
                      width={bar.width}
                      height={bar.secondaryHeight}
                      rx={0}
                      fill={secFill}
                      stroke={separatorStroke}
                      strokeWidth={1.5}
                    />
                  )}
              </React.Fragment>
            );
          })}
          <SvgLine
            x1="0"
            y1={height - 0.5}
            x2={chartWidth}
            y2={height - 0.5}
            stroke={dm.border}
            strokeWidth={1}
          />
        </Svg>

        {/* Transparent Interactive Tap Columns */}
        <View style={styles.tapOverlay}>
          {data.map((item, idx) => (
            <TouchableOpacity
              key={`${item.label}-${idx}`}
              onPress={() => setSelectedIndex(idx)}
              style={styles.tapColumn}
              accessibilityLabel={`Selecionar ${item.label}: ${item.value} ${unit}`}
            />
          ))}
        </View>
      </View>

      {/* Clean X-axis Labels */}
      <View style={styles.xAxisRow}>
        {data.map((item, idx) => {
          const isSelected = idx === activeIdx;
          return (
            <TouchableOpacity
              key={`${item.label}-lbl-${idx}`}
              onPress={() => setSelectedIndex(idx)}
              style={styles.xAxisCell}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.xAxisText,
                  {
                    color: isSelected ? dm.text : dm.sub,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {(primaryLabel || secondaryLabel) && (
        <View style={styles.legendRow}>
          {primaryLabel && (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: primaryColor }]} />
              <Text style={[styles.legendText, { color: dm.sub }]}>{primaryLabel}</Text>
            </View>
          )}
          {secondaryLabel && (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: secondaryColor }]} />
              <Text style={[styles.legendText, { color: dm.sub }]}>{secondaryLabel}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  readoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  readoutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  readoutDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  readoutLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  readoutValue: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  canvasBox: {
    borderRadius: 16,
    borderWidth: 1,
    paddingTop: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  tapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  tapColumn: {
    flex: 1,
    height: '100%',
  },
  xAxisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 2,
  },
  xAxisCell: {
    flex: 1,
    alignItems: 'center',
  },
  xAxisText: {
    fontSize: 10,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 14,
    marginTop: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '600',
  },
  emptyWrap: {
    height: 110,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
