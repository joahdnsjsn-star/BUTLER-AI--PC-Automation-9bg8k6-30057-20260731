/**
 * Butler AI — Remote Access Tiers
 * Defines subscription tiers for remote PC access features.
 */

export type TierID = 'free' | 'pro' | 'titan';

export interface Tier {
  id:          TierID;
  label:       string;
  price:       string;
  maxPCs:      number;
  features:    string[];
}

export const TIERS: Record<TierID, Tier> = {
  free: {
    id:       'free',
    label:    'FREE',
    price:    '$0',
    maxPCs:   1,
    features: ['1 PC', 'Basic commands', 'LAN only'],
  },
  pro: {
    id:       'pro',
    label:    'PRO',
    price:    '$4.99/mo',
    maxPCs:   3,
    features: ['3 PCs', 'All commands', 'Script library', 'LAN only'],
  },
  titan: {
    id:       'titan',
    label:    'TITAN',
    price:    '$9.99/mo',
    maxPCs:   10,
    features: ['10 PCs', 'All features', 'Priority support', 'Early access'],
  },
};

export interface SavedPC {
  id:        string;
  name:      string;
  addr:      string;
  lastSeen:  number;
  version:   string | null;
  tierId:    TierID;
}
