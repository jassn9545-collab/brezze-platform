<?php
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\Client\JobController as ClientJobController;
use App\Http\Controllers\Api\Client\ClientHomeController;
use App\Http\Controllers\Api\Client\ServiceCatalogController as ClientServiceCatalogController;
use App\Http\Controllers\Api\Freelancer\FreelancerJobController;
use App\Http\Controllers\Api\Freelancer\ServiceCatalogController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\ServiceBookingController;

use Illuminate\Support\Facades\Route;

Route::middleware('throttle:10,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
});

Route::middleware('throttle:5,1')->group(function () {
    Route::post('/forget-password', [AuthController::class, 'forgetPassword']);
    Route::post('/forget-password-otp-verification', [AuthController::class, 'forgetPasswordOtpVerification']);
    Route::post('/update-password', [AuthController::class, 'updatePassword']);
});
Route::post('/setting', [AuthController::class, 'setting']);
Route::post('/stripe/webhook', [PaymentController::class, 'webhook']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::prefix('chat')->group(function () {
        Route::get('conversations', [ChatController::class, 'index']);
        Route::post('conversations', [ChatController::class, 'store']);
        Route::get('conversations/{conversation}/messages', [ChatController::class, 'messages']);
        Route::post('conversations/{conversation}/messages', [ChatController::class, 'send'])
            ->middleware('throttle:60,1');
    });

    Route::post('/update-profile', [UserController::class, 'updateProfile']);
    Route::get('/contact-us', [UserController::class, 'contactUs']);

    Route::get('/address/list', [UserController::class, 'addressList']);
    Route::post('/address/add', [UserController::class, 'addressAdd']);

    Route::get('/home', [HomeController::class, 'homeData']);
    Route::get('/all-categories', [HomeController::class, 'allCategories']);
    Route::get('/category/{id}', [HomeController::class, 'productsByCategory']);
    Route::get('/product/{id}', [HomeController::class, 'productDetails']);

    // new routes will be added here
    Route::post('profile-verification-info', [AuthController::class, 'profileVerificationInfo']);
    Route::post('basic-info-update', [AuthController::class, 'basicInfoUpdate']);
    Route::post('profile-photo-upload', [AuthController::class, 'profilePhotoUpload']);
    Route::post('id-verification', [AuthController::class, 'idVerification']);
    Route::post('stripe/onboarding-link', [AuthController::class, 'stripeOnboardingLink']);
    Route::get('stripe/account-status', [AuthController::class, 'stripeAccountStatus']);

    // jobs routes
    Route::prefix('client')->group(function () {
        Route::get('discovery', [ClientServiceCatalogController::class, 'discovery']);
        Route::get('freelancer-catalogs/{provider}', [ClientServiceCatalogController::class, 'index']);
        Route::get('service-bookings', [ServiceBookingController::class, 'clientIndex']);
        Route::post('service-bookings', [ServiceBookingController::class, 'store']);

        Route::post('new-job', [ClientJobController::class, 'createJob']);
        Route::post('my-jobs', [ClientJobController::class, 'myJobs']);
        Route::post('job-details', [ClientJobController::class, 'jobDetails']);
        Route::post('hire-now', [ClientJobController::class, 'hireNow']);
        Route::post('job-mark-completed', [ClientJobController::class, 'jobMarkCompleted']);
        Route::post('payments/intent', [PaymentController::class, 'createIntent']);
        Route::get('payments/jobs/{jobId}', [PaymentController::class, 'status']);
        Route::post('payments/{paymentId}/verify', [PaymentController::class, 'verify']);
        Route::post('payments/{paymentId}/cancel', [PaymentController::class, 'cancel']);

        Route::post('freelancer-profile', [ClientHomeController::class, 'freelancerProfile']);
        Route::post('my-profile', [ClientHomeController::class, 'myProfile']);
        Route::post('update-profile', [ClientHomeController::class, 'updateProfile']);

    });

    Route::prefix('freelancer')->group(function () {

        Route::post('latest-jobs', [FreelancerJobController::class, 'latestJobs']);
        Route::post('apply-job', [FreelancerJobController::class, 'applyJob']);
        Route::post('job-detail', [FreelancerJobController::class, 'jobDetail']);
        Route::post('save-job', [FreelancerJobController::class, 'saveJob']);
        Route::post('remove-job', [FreelancerJobController::class, 'removeJob']);
        Route::post('saved-jobs', [FreelancerJobController::class, 'savedJobs']);
        Route::post('active-jobs', [FreelancerJobController::class, 'activeJobs']);
        Route::post('applied-jobs', [FreelancerJobController::class, 'appliedJobs']);
        Route::post('completed-jobs', [FreelancerJobController::class, 'completedJobs']);
        Route::post('my-profile', [FreelancerJobController::class, 'myProfile']);
        Route::post('profile-update', [FreelancerJobController::class, 'profileUpdate']);
        Route::post('submit-work', [FreelancerJobController::class, 'submitWork']);
        Route::post('payments', [PaymentController::class, 'providerHistory']);
        Route::get('catalogs', [ServiceCatalogController::class, 'index']);
        Route::post('catalogs', [ServiceCatalogController::class, 'store']);
        Route::get('service-bookings', [ServiceBookingController::class, 'providerIndex']);
        Route::post('service-bookings/{booking}/respond', [ServiceBookingController::class, 'respond']);

    });

    Route::post('submit-review', [FreelancerJobController::class, 'submitReview']);
    Route::post('account/update-password', [HomeController::class, 'updatePassword']);
});

?>
