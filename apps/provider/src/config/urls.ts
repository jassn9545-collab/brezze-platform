

import {NativeModules} from 'react-native';

const ASSET_BASE_URL = 'https://hirephpdeveloperindia.com/bezzie/public';

const getDevelopmentApiHost = (): string => {
  try {
    const sourceCode = NativeModules.SourceCode;
    const scriptURL: unknown =
      sourceCode?.getConstants?.()?.scriptURL ?? sourceCode?.scriptURL;
    if (typeof scriptURL === 'string') {
      const host = /^https?:\/\/(\[[^\]]+\]|[^:/?#]+)(?::\d+)?(?:[/?#]|$)/i.exec(scriptURL)?.[1];
      if (host) {
        const normalizedHost = host.replace(/^\[|\]$/g, '').toLowerCase();
        // USB devices reach the backend through adb reverse, just like Metro.
        return ['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(normalizedHost)
          ? '127.0.0.1'
          : host;
      }
    }
  } catch {
    // Metro URL is unavailable; use the USB-forwarded backend.
  }

  return '127.0.0.1';
};

const URLs = {
  base: 'https://hirephpdeveloperindia.com/bezzie/api',
  assets: ASSET_BASE_URL,

  realtime: {
    host: __DEV__ ? getDevelopmentApiHost() : 'hirephpdeveloperindia.com',
    port: __DEV__ ? 8083 : 443,
    key: 'bezzie-local-key',
    secure: !__DEV__,
  },

  SHARE_URL: 'https://hirephpdeveloperindia.com/referral',
  inviteUrls: [
    'com.gandharva://invite/link',
    'https://hirephpdeveloperindia.com/referral',
  ],

  // API end points
  basicSetting: '/setting',
  registration: '/register',
  resendUserVerifyOtp: '/resend-otp',
  verifyUser: '/verify-otp',
  basicDetail: '/basic-info-update',
  uploadProfile: '/profile-photo-upload',
  userVerificationID: '/id-verification',
  profileVerificationInfo: '/profile-verification-info',
  stripeOnboardingLink: '/stripe/onboarding-link',
  stripeAccountStatus: '/stripe/account-status',
  login: '/login',
  profile: '/freelancer/my-profile',
  updateProfile: '/freelancer/profile-update',
  logout: '/logout',
  forgotPassword: '/forget-password',
  verifyOtp: '/forget-password-otp-verification',
  resendOtp: '/resend-otp',
  resetPassword: '/update-password',

  jobList: '/freelancer/latest-jobs',
  jobDetail: '/freelancer/job-detail',
  jobApply: '/freelancer/apply-job',
  addSavedJob: '/freelancer/save-job',
  removeSavedJob: '/freelancer/remove-job',
  mySavedJobs: '/freelancer/saved-jobs',
  applyJobs: '/freelancer/applied-jobs',
  activeJobs: '/freelancer/active-jobs',
  completeJobs: '/freelancer/completed-jobs',
  submitJob: '/freelancer/submit-work',
  submitReview: '/submit-review',
  paymentHistory: '/freelancer/payments',
  catalogs: '/freelancer/catalogs',
  chatConversations: '/chat/conversations',
  getUserNotifications: '/notifications',
  supportRequests: '/support-requests',
};

const legacyAssetPattern = /^https?:\/\/hirephpdeveloperindia\.com\/bezzie\/(?!public\/)(?=(?:uploads|assets)\/)/i;

export const normalizeAssetPayload = <T>(value: T, key = ''): T => {
  if (typeof value === 'string') {
    if (key === 'base_url' || key === 'image_base_url') {
      return ASSET_BASE_URL as T;
    }

    return value.replace(legacyAssetPattern, `${ASSET_BASE_URL}/`) as T;
  }

  if (Array.isArray(value)) {
    return value.map(item => normalizeAssetPayload(item)) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [
        entryKey,
        normalizeAssetPayload(entryValue, entryKey),
      ]),
    ) as T;
  }

  return value;
};

export default URLs;
