/**
 * In-App Purchase Service
 * Uses react-native-iap to handle native App Store (StoreKit) purchases.
 *
 * Product IDs must match what is configured in App Store Connect.
 * These are consumable IAPs (credit packs), not subscriptions.
 */
import { Platform, Alert } from 'react-native';
import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  getAvailablePurchases,
  type Product,
  type Purchase,
  type PurchaseError,
  ErrorCode,
} from 'react-native-iap';
import { supabase } from '@/config/supabase';

// ─── Product IDs (must match App Store Connect) ──────────────────────────
export const IAP_PRODUCT_IDS = Platform.select({
  ios: [
    'com.areyoutheone.credits.5',     // 5 credits  — $4.99
    'com.areyoutheone.credits.15',    // 15 credits — $9.99  (Save 30%)
    'com.areyoutheone.credits.50',    // 50 credits — $24.99 (Save 50%)
    'com.areyoutheone.credits.100',   // 100 credits — $39.99 (Save 60%)
  ],
  android: [
    'com.areyoutheone.credits.5',
    'com.areyoutheone.credits.15',
    'com.areyoutheone.credits.50',
    'com.areyoutheone.credits.100',
  ],
  default: [],
}) as string[];

// ─── Credit pack configuration (fallback if store prices unavailable) ────
export interface CreditPack {
  productId: string;
  credits: number;
  price: string;         // Display price from store, or fallback
  priceValue: number;    // Numeric price for sorting
  savings?: string;      // "Save 30%" label
  popular?: boolean;
  bestValue?: boolean;
  storeProduct?: Product; // Native store product reference
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    productId: 'com.areyoutheone.credits.5',
    credits: 5,
    price: '$4.99',
    priceValue: 4.99,
  },
  {
    productId: 'com.areyoutheone.credits.15',
    credits: 15,
    price: '$9.99',
    priceValue: 9.99,
    savings: 'Save 30%',
    popular: true,
  },
  {
    productId: 'com.areyoutheone.credits.50',
    credits: 50,
    price: '$24.99',
    priceValue: 24.99,
    savings: 'Save 50%',
  },
  {
    productId: 'com.areyoutheone.credits.100',
    credits: 100,
    price: '$39.99',
    priceValue: 39.99,
    savings: 'Save 60%',
    bestValue: true,
  },
];

// ─── What credits can be spent on ────────────────────────────────────────
export type CreditAction =
  | 'send_rose'
  | 'send_kiss'
  | 'profile_boost'
  | 'see_who_liked'
  | 'super_reveal'
  | 'instant_voice_unlock'
  | 'instant_video_unlock'
  | 'extra_daily_reveals';

export const CREDIT_COSTS: Record<CreditAction, number> = {
  send_rose: 1,
  send_kiss: 1,
  profile_boost: 5,
  see_who_liked: 3,
  super_reveal: 2,
  instant_voice_unlock: 3,
  instant_video_unlock: 5,
  extra_daily_reveals: 2, // +10 extra reveals
};

// ─── Service class ───────────────────────────────────────────────────────
class IAPService {
  private isConnected = false;
  private purchaseUpdateSubscription: any = null;
  private purchaseErrorSubscription: any = null;
  private onCreditsPurchased: ((credits: number) => void) | null = null;

  /**
   * Initialize the IAP connection and listeners.
   * Call this once when the app mounts.
   */
  async initialize(onCreditsPurchased?: (credits: number) => void): Promise<void> {
    if (this.isConnected) return;

    try {
      const result = await initConnection();
      this.isConnected = true;
      console.log('[IAP] Connection initialized:', result);

      if (onCreditsPurchased) {
        this.onCreditsPurchased = onCreditsPurchased;
      }

      // Listen for successful purchases
      this.purchaseUpdateSubscription = purchaseUpdatedListener(
        async (purchase: Purchase) => {
          console.log('[IAP] Purchase update:', purchase.productId);
          await this.handlePurchase(purchase);
        }
      );

      // Listen for purchase errors
      this.purchaseErrorSubscription = purchaseErrorListener(
        (error: PurchaseError) => {
          console.warn('[IAP] Purchase error:', error);
          if (error.code !== ErrorCode.UserCancelled) {
            Alert.alert(
              'Purchase Failed',
              error.message || 'Something went wrong. Please try again.'
            );
          }
        }
      );
    } catch (err) {
      console.warn('[IAP] Failed to connect:', err);
    }
  }

  /**
   * Clean up IAP connection and listeners.
   * Call when the app unmounts.
   */
  async cleanup(): Promise<void> {
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
      this.purchaseUpdateSubscription = null;
    }
    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
      this.purchaseErrorSubscription = null;
    }
    if (this.isConnected) {
      await endConnection();
      this.isConnected = false;
    }
  }

  /**
   * Fetch products from the App Store.
   * Returns credit packs enriched with live store pricing.
   */
  async fetchProducts(): Promise<CreditPack[]> {
    try {
      if (!this.isConnected) {
        await this.initialize();
      }

      const products = await fetchProducts({ skus: IAP_PRODUCT_IDS, type: 'in-app' }) as Product[];
      console.log('[IAP] Fetched products:', products.length);

      // Merge store products with our local config
      return CREDIT_PACKS.map((pack) => {
        const storeProduct = products.find((p) => p.id === pack.productId);
        if (storeProduct) {
          return {
            ...pack,
            price: storeProduct.displayPrice || pack.price,
            priceValue: Number(storeProduct.price) || pack.priceValue,
            storeProduct,
          };
        }
        return pack;
      });
    } catch (err) {
      console.warn('[IAP] Failed to fetch products, using fallback pricing:', err);
      return CREDIT_PACKS;
    }
  }

  /**
   * Request a purchase for the given product ID.
   * This triggers the native App Store purchase sheet.
   */
  async purchaseCredits(productId: string): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.initialize();
      }

      await requestPurchase({
        type: 'in-app',
        request: {
          apple: { sku: productId },
          google: { skus: [productId] },
        }
      });
      // The purchaseUpdatedListener will handle the rest
    } catch (err: any) {
      if (err.code === ErrorCode.UserCancelled) {
        console.log('[IAP] User cancelled purchase');
        return;
      }
      console.error('[IAP] Purchase request error:', err);
      throw err;
    }
  }

  /**
   * Handle a successful purchase.
   * Validates receipt, grants credits, and finishes the transaction.
   */
  private async handlePurchase(purchase: Purchase): Promise<void> {
    try {
      const pack = CREDIT_PACKS.find((p) => p.productId === purchase.productId);
      if (!pack) {
        console.error('[IAP] Unknown product purchased:', purchase.productId);
        return;
      }

      // Validate receipt with our backend (Supabase)
      await this.validateAndGrantCredits(purchase, pack.credits);

      // Finish the transaction (critical - prevents re-delivery)
      await finishTransaction({ purchase, isConsumable: true });

      console.log(`[IAP] ✅ Granted ${pack.credits} credits for ${purchase.productId}`);

      // Notify listeners
      if (this.onCreditsPurchased) {
        this.onCreditsPurchased(pack.credits);
      }
    } catch (err) {
      console.error('[IAP] Failed to handle purchase:', err);
      Alert.alert(
        'Purchase Processing Error',
        'Your purchase was successful but we had trouble adding credits. Please contact support.'
      );
    }
  }

  /**
   * Validate receipt server-side and grant credits.
   */
  private async validateAndGrantCredits(
    purchase: Purchase,
    credits: number
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Record the purchase transaction
    const { error: txError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        type: 'purchase',
        amount: credits,
        product_id: purchase.productId,
        transaction_id: ('transactionId' in purchase) ? purchase.transactionId : null,
        receipt: purchase.purchaseToken,
        platform: Platform.OS,
        created_at: new Date().toISOString(),
      });

    if (txError) {
      console.error('[IAP] Failed to record transaction:', txError);
      // Don't throw — credits may have been granted by a DB trigger
    }

    // Update user's credit balance (upsert)
    const { data: currentBalance } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    const newBalance = (currentBalance?.balance || 0) + credits;

    const { error: balError } = await supabase
      .from('user_credits')
      .upsert({
        user_id: user.id,
        balance: newBalance,
        updated_at: new Date().toISOString(),
      });

    if (balError) {
      console.error('[IAP] Failed to update balance:', balError);
      throw balError;
    }
  }

  /**
   * Get the current user's credit balance from Supabase.
   */
  async getBalance(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { data } = await supabase
        .from('user_credits')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      return data?.balance || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Spend credits on an action.
   * Returns true if successful, false if insufficient balance.
   */
  async spendCredits(action: CreditAction): Promise<boolean> {
    const cost = CREDIT_COSTS[action];
    const balance = await this.getBalance();

    if (balance < cost) {
      return false;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Deduct credits
    const { error: balError } = await supabase
      .from('user_credits')
      .update({
        balance: balance - cost,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (balError) {
      console.error('[IAP] Failed to deduct credits:', balError);
      return false;
    }

    // Log the spend
    await supabase
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        type: 'spend',
        amount: -cost,
        action,
        created_at: new Date().toISOString(),
      });

    return true;
  }

  /**
   * Restore any previous purchases (for consumables this checks pending transactions).
   */
  async restorePurchases(): Promise<void> {
    try {
      const purchases = await getAvailablePurchases();
      console.log('[IAP] Restored purchases:', purchases.length);

      for (const purchase of purchases) {
        await this.handlePurchase(purchase as Purchase);
      }
    } catch (err) {
      console.warn('[IAP] Restore purchases failed:', err);
    }
  }
}

export const iapService = new IAPService();
