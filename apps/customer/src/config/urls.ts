const API_BASE_URL = 'https://hirephpdeveloperindia.com/bezzie/api';
const ASSET_BASE_URL = 'https://hirephpdeveloperindia.com/bezzie/public';

const URLs = {
  base: API_BASE_URL,
  assets: ASSET_BASE_URL,
  realtime: {
    // Live hosting does not currently expose a Reverb WebSocket endpoint.
    enabled: false,
    host: 'hirephpdeveloperindia.com',
    port: 443,
    key: 'bezzie-local-key',
    secure: true,
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
  login: '/login',
  profile: '/client/my-profile',
  updateProfile: '/client/update-profile',
  logout: '/logout',
  forgotPassword: '/forget-password',
  verifyOtp: '/forget-password-otp-verification',
  resendOtp: '/resend-otp',
  resetPassword: '/update-password',
  faq: '/get-faq',
  referEarn: '/refer-and-earn',
  withdrawReferEarn: '/withdraw-earning',
  getUserNotifications: '/notifications',
  privacyPolicy: '/legal/privacy-policy',
  supportRequests: '/support-requests',
  updateAccountPassword: '/account/update-password',
  clientProfile: '/client/freelancer-profile',

  // job
  createJob: '/client/new-job',
  jobList: '/client/my-jobs',
  jobDetail: '/client/job-details',
  hireJob: '/client/hire-now',
  completeJob: '/client/job-mark-completed',
  paymentIntent: '/client/payments/intent',
  paymentStatus: '/client/payments/jobs',
  paymentVerify: '/client/payments',
  paymentCancel: '/client/payments',
  paymentMethods: '/client/payment-methods',
  paymentMethodSetup: '/client/payment-methods/setup',
  paymentMethodSession: '/client/payment-methods/session',

  // Review Api 
  submitReview: '/submit-review',
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
