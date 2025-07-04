
export const APP_CONSTANTS = {
  DELIVERY_FEE: 1200, // Global delivery fee in Rwf
  DISCOUNT_RATE: 0.02, // 2% discount rate
  PAYMENT_METHODS: {
    MTN: 'MTN',
    PAY_ON_DELIVERY: 'PAY_ON_DELIVERY'
  },
  PAYMENT_CODE: '+250784720984' // Static MoMo payment code
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CART: '/cart',
  CHECKOUT: '/checkout',
  DASHBOARD: '/dashboard'
} as const;
