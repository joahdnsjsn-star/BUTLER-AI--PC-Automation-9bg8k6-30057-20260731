/**
 * Butler AI — Purchase Context
 * Provides in-app purchase / subscription state to all tabs.
 * Stub implementation — no purchases are active in this build.
 */
import React, { createContext, useContext } from 'react';

export type PurchaseTier = 'free' | 'pro' | 'titan';

interface PurchaseState {
  tier:         PurchaseTier;
  isPro:        boolean;
  isTitan:      boolean;
  isLoading:    boolean;
  purchase:     (productId: string) => Promise<void>;
  restore:      () => Promise<void>;
}

const DEFAULT: PurchaseState = {
  tier:      'free',
  isPro:     false,
  isTitan:   false,
  isLoading: false,
  purchase:  async () => {},
  restore:   async () => {},
};

const PurchaseContext = createContext<PurchaseState>(DEFAULT);

export function PurchaseProvider({ children }: { children: React.ReactNode }) {
  return (
    <PurchaseContext.Provider value={DEFAULT}>
      {children}
    </PurchaseContext.Provider>
  );
}

export function usePurchase(): PurchaseState {
  return useContext(PurchaseContext);
}
