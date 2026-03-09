export const BASE_URL = 'http://localhost:3000/api/v1';
export const AUTH_ENDPOINTS = {
  SEND_LOGIN_OTP: '/auth/send-login-otp',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  PROFILE: '/auth/me',
};
export const ONBOARDING_ENDPOINTS = {
  START: '/seller/onboarding/start',
  STATUS: '/seller/onboarding/status',
  SUBMIT_STEP: (step) => `/seller/onboarding/step/${step}`,
  // Legacy steps (keeping for now to avoid breaking changes until migrated)
  STEP1_LANGUAGE: '/onboarding/step1-language',
  STEP2_MOBILE: '/onboarding/step2-mobile',
  STEP3_VERIFY: '/onboarding/step3-verify',
  STEP4_DETAILS: '/onboarding/step4-details',
  STEP5_BUSINESS: '/onboarding/step5-business',
  STEP6_SHOP: '/onboarding/step6-shop',
  STEP7_COMPLETE: '/onboarding/step7-complete',
};
export const DASHBOARD_ENDPOINTS = {
  STATS: '/dashboard/stats',
};
