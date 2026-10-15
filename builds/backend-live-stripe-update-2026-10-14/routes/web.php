<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\LoginController;
use App\Http\Controllers\Admin\ProfileController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\JobController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\HomeController;

Route::get('/', function () {
    return view('welcome');
});

Route::view('/stripe/onboarding/return', 'stripe.onboarding-callback', ['refresh' => false])
    ->name('stripe.onboarding.return');
Route::view('/stripe/onboarding/refresh', 'stripe.onboarding-callback', ['refresh' => true])
    ->name('stripe.onboarding.refresh');

// Route::get('/admin', [LoginController::class, 'index'])->name('login');
Route::get('/admin', [LoginController::class, 'index'])->name('admin_home');
Route::post('/admin/login', [LoginController::class, 'admin_login'])->name('admin_login');

Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    Route::post('/cache', function () {
        \Illuminate\Support\Facades\Artisan::call('cache:clear');
        \Illuminate\Support\Facades\Artisan::call('config:clear');
        \Illuminate\Support\Facades\Artisan::call('route:clear');
        \Illuminate\Support\Facades\Artisan::call('view:clear');

        return response()->json([
            'status' => true,
            'message' => 'All caches cleared successfully'
        ]);
    })->name('admin.cache.clear');

    Route::post('/update-price', [HomeController::class, 'update_price'])->name('admin.update_price');

    Route::get('/dashboard', [DashboardController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/logout', [ProfileController::class, 'logout'])->name('admin.logout');

    Route::get('/profile', [ProfileController::class, 'index'])->name('admin.profile');
    Route::post('/profile/update', [ProfileController::class, 'update'])->name('admin.profile.update');
    Route::post('/profile/upload-photo', [ProfileController::class, 'uploadPhoto'])->name('admin.profile.upload_photo');
    Route::post('/profile/update-password', [ProfileController::class, 'updatePassword'])->name('admin.profile.update_password');

    // users routes
    Route::prefix('users')->group(function () {
        // Route::get('/', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('admin.users.list');
        Route::get('/', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('admin.users.index');
        Route::post('/get_users', [\App\Http\Controllers\Admin\UserController::class, 'user_list'])->name('admin.users.index_users');
        Route::post('/update_status/{id}', [\App\Http\Controllers\Admin\UserController::class, 'update_status'])->name('admin.users.update_status');
        Route::post('/update_featured/{id}', [\App\Http\Controllers\Admin\UserController::class, 'update_featured'])->name('admin.users.update_featured');
        Route::get('/create', [\App\Http\Controllers\Admin\UserController::class, 'create'])->name('admin.users.create');
        Route::post('/store', [\App\Http\Controllers\Admin\UserController::class, 'store'])->name('admin.users.store');
        Route::get('/edit/{id}', [\App\Http\Controllers\Admin\UserController::class, 'edit'])->name('admin.users.edit');
        Route::post('/update/{id}', [\App\Http\Controllers\Admin\UserController::class, 'update'])->name('admin.users.update');
        Route::get('/delete/{id}', [\App\Http\Controllers\Admin\UserController::class, 'delete'])->name('admin.users.delete');
        Route::get('/{id}', [\App\Http\Controllers\Admin\UserController::class, 'show'])->name('admin.users.show');
    });

    Route::prefix('category')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\CategoryController::class, 'index'])->name('admin.category.index');
        Route::post('/get_categories', [\App\Http\Controllers\Admin\CategoryController::class, 'category_list'])->name('admin.category.get_categories');
        Route::get('/create', [\App\Http\Controllers\Admin\CategoryController::class, 'create'])->name('admin.category.create');
        Route::post('/store', [\App\Http\Controllers\Admin\CategoryController::class, 'store'])->name('admin.category.store');
        Route::get('/edit/{id}', [\App\Http\Controllers\Admin\CategoryController::class, 'edit'])->name('admin.category.edit');
        Route::post('/update/{id}', [\App\Http\Controllers\Admin\CategoryController::class, 'update'])->name('admin.category.update');
        Route::get('/delete/{id}', [\App\Http\Controllers\Admin\CategoryController::class, 'delete'])->name('admin.category.delete');
    });


    Route::get('jobs', [\App\Http\Controllers\Admin\JobController::class, 'index'])->name('admin.jobs.index');
    Route::get('jobs-open', [\App\Http\Controllers\Admin\JobController::class, 'openJobs'])->name('admin.jobs.open');
    Route::get('jobs-closed', [\App\Http\Controllers\Admin\JobController::class, 'closedJobs'])->name('admin.jobs.closed');
    Route::post('job-get-ajax', [\App\Http\Controllers\Admin\JobController::class, 'job_list'])->name('admin.jobs.job_list');
    Route::get('project/view/{id}', [\App\Http\Controllers\Admin\JobController::class, 'project_view'])->name('admin.jobs.project_view');

    Route::get('/payments', [PaymentController::class, 'index'])->name('admin.payments.index');

    Route::get('/disputes', [\App\Http\Controllers\Admin\DisputeController::class, 'index'])->name('admin.disputes.index');
    Route::get('/disputes/{dispute}', [\App\Http\Controllers\Admin\DisputeController::class, 'show'])->name('admin.disputes.show');
    Route::patch('/disputes/{dispute}/status', [\App\Http\Controllers\Admin\DisputeController::class, 'updateStatus'])->name('admin.disputes.update_status');

    Route::get('/withdrawal-requests', [\App\Http\Controllers\Admin\WithdrawalRequestController::class, 'index'])->name('admin.withdrawals.index');
    Route::get('/withdrawal-requests/{withdrawal}', [\App\Http\Controllers\Admin\WithdrawalRequestController::class, 'show'])->name('admin.withdrawals.show');
    Route::patch('/withdrawal-requests/{withdrawal}/status', [\App\Http\Controllers\Admin\WithdrawalRequestController::class, 'updateStatus'])->name('admin.withdrawals.update_status');


    Route::get('/settings', [\App\Http\Controllers\Admin\SettingsController::class, 'index'])->name('admin.settings');
    Route::post('/settings/update', [\App\Http\Controllers\Admin\SettingsController::class, 'update'])->name('admin.settings.update');

});
