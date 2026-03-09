import { load } from '@cashfreepayments/cashfree-js';
import { logger } from './logger';

/**
 * Initialize Cashfree SDK
 * @returns Cashfree instance
 */
export const initializeCashfree = async () => {
  try {
    const cashfree = await load({
      mode: 'production',
    });
    return cashfree;
  } catch (error) {
    logger.error('Failed to initialize Cashfree:', error);
    throw new Error('Payment system initialization failed');
  }
};
