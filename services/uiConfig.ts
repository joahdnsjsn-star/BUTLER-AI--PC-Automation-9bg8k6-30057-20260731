/**
 * Butler AI — UI Config Service
 * Persists user UI preferences (layout density, animations, etc.)
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@butler_ui_config_v1';

export interface UIConfigData {
  animationsEnabled:   boolean;
  compactMode:         boolean;
  showTooltips:        boolean;
  tabBarVisible:       boolean;
  hapticFeedback:      boolean;
  fontSize:            'small' | 'normal' | 'large';
}

const DEFAULTS: UIConfigData = {
  animationsEnabled:   true,
  compactMode:         false,
  showTooltips:        true,
  tabBarVisible:       true,
  hapticFeedback:      true,
  fontSize:            'normal',
};

class UIConfigService {
  private _config: UIConfigData = { ...DEFAULTS };
  private _loaded = false;

  async load(): Promise<UIConfigData> {
    if (this._loaded) return this._config;
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) this._config = { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {}
    this._loaded = true;
    return this._config;
  }

  async update(partial: Partial<UIConfigData>): Promise<void> {
    this._config = { ...this._config, ...partial };
    try { await AsyncStorage.setItem(KEY, JSON.stringify(this._config)); } catch {}
  }

  get(): UIConfigData { return this._config; }
}

export const uiConfig = new UIConfigService();
