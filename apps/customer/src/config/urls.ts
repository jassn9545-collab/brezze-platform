import { NativeModules } from 'react-native';

const DEVELOPMENT_FALLBACK_HOST = '192.168.1.42';

const getDevelopmentApiHost = () => {
  try {
    const sourceCode = NativeModules.SourceCode;
    const scriptURL: unknown =
      sourceCode?.getConstants?.()?.scriptURL ?? sourceCode?.scriptURL;
    if (typeof scriptURL === 'string') {
      const host = /^https?:\/\/(\[[^\]]+\]|[^:/?#]+)(?::\d+)?(?:[/?#]|$)/i.exec(scriptURL)?.[1];
      if (host) {
        const normalizedHost = host.replace(/^\[|\]$/g, '').toLowerCase();
        if (!['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(normalizedHost)) {
          return host;
        }
      }
    }
  } catch {
    // Metro URL is unavailable; use the development machine's Wi-Fi address.
  }

  return DEVELOPMENT_FALLBACK_HOST;
};

const API_BASE_URL = __DEV__
  ? `http://${getDevelopmentApiHost()}:8000/api`
  : 'https://hirephpdeveloperindia.com/bezzie/api';

const URLs = {
  base: API_BASE_URL,

  socketUrl: '',

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

  // Review Api 
  submitReview: '/submit-review',
};

export default URLs;
