/**
 * TabErrorBoundary — catches per-tab render crashes
 *
 * Wraps each tab's content. When a tab throws a render error:
 *  • Shows a "TAB CRASHED" HUD with a RELOAD TAB button
 *  • Auto-resets after 4 seconds for transient errors
 *  • Other tabs and the toolbar are completely unaffected
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { D, FONT } from '@/constants/design';

interface Props {
  children: React.ReactNode;
  tabName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class TabErrorBoundary extends React.Component<Props, State> {
  private _resetTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Auto-reset after 4 seconds for transient errors
    this._resetTimer = setTimeout(() => this.reset(), 4000);
    try {
      console.error('[TabErrorBoundary] Tab crashed:', error?.message, info?.componentStack?.slice(0, 300));
    } catch {}
  }

  componentWillUnmount() {
    if (this._resetTimer) clearTimeout(this._resetTimer);
  }

  reset = () => {
    if (this._resetTimer) { clearTimeout(this._resetTimer); this._resetTimer = null; }
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={s.wrap}>
        <View style={s.card}>
          {/* HUD corners */}
          <View style={[s.corner, s.tl]} />
          <View style={[s.corner, s.tr]} />
          <View style={[s.corner, s.bl]} />
          <View style={[s.corner, s.br]} />

          <MaterialIcons name="warning" size={32} color={D.red} style={{ marginBottom: 12 }} />
          <Text style={s.title}>TAB CRASHED</Text>
          {this.props.tabName && (
            <Text style={s.tabName}>{this.props.tabName.toUpperCase()}</Text>
          )}
          <Text style={s.message} numberOfLines={3}>
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </Text>

          <TouchableOpacity style={s.btn} onPress={this.reset} activeOpacity={0.75}>
            <MaterialIcons name="refresh" size={14} color={D.primary} />
            <Text style={s.btnText}>RELOAD TAB</Text>
          </TouchableOpacity>

          <Text style={s.hint}>Auto-resets in 4 s · Other tabs unaffected</Text>
        </View>
      </View>
    );
  }
}

const CORNER = 10;

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: D.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: D.surface,
    borderWidth: 1.5,
    borderColor: D.red + '60',
    borderRadius: 14,
    padding: 28,
    alignItems: 'center',
    maxWidth: 360,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  title: {
    fontFamily: FONT.mono,
    fontSize: 16,
    fontWeight: '900',
    color: D.red,
    letterSpacing: 2,
    marginBottom: 4,
  },
  tabName: {
    fontFamily: FONT.mono,
    fontSize: 11,
    color: D.textDim,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  message: {
    fontFamily: FONT.mono,
    fontSize: 11,
    color: D.textMid,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 20,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: D.primary + '60',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: D.primary + '14',
    marginBottom: 14,
  },
  btnText: {
    fontFamily: FONT.mono,
    fontSize: 12,
    fontWeight: '700',
    color: D.primary,
    letterSpacing: 1,
  },
  hint: {
    fontFamily: FONT.mono,
    fontSize: 9,
    color: D.textDim,
    letterSpacing: 0.5,
  },
  // HUD corners
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
  },
  tl: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2,   borderColor: D.red + '50', borderTopLeftRadius: 14 },
  tr: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2, borderColor: D.red + '50', borderTopRightRadius: 14 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2,   borderColor: D.red + '30', borderBottomLeftRadius: 14 },
  br: { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2, borderColor: D.red + '30', borderBottomRightRadius: 14 },
});
