<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\UserProof;
use Illuminate\Support\Facades\Hash;
use Mail;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use App\Traits\ApiResponse;
use Stripe\Exception\ApiErrorException;
use Stripe\StripeClient;
use Throwable;

class AuthController extends Controller
{
    use ApiResponse;

    public function register(Request $request)
    {
        $validator = \Validator::make($request->all(), [
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required',
            'phone'    => 'nullable|string|max:20',
            'confirm_password' => 'required|same:password',
            'user_type' => 'nullable|string|in:client,freelancer',
            'country' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 400, $validator->errors());
        }

        if ($request->filled('country') && !$this->normalizeStripeCountry($request->country)) {
            return $this->error('Country must be Australia or India.', 400);
        }

        // Generate OTP
        $otp = random_int(100000, 999999);

        // Store OTP in cache for 5 minutes (you can also use DB)
        Cache::put('user_otp_' . $request->email, $otp, now()->addMinutes(5));

        // Send OTP via email
        Mail::send([], [], function ($message) use ($request, $otp) {
            $message->to($request->email)
                    ->subject('OTP Verification')
                    ->html('<p>Hello ' . $request->name . '</p>
                            <p>Your OTP is <strong>' . $otp . '</strong></p>');
        });

        return $this->success([], 'OTP sent to your email.');
    }


    public function verifyOtp(Request $request, StripeClient $stripe){
        $validator = \Validator::make($request->all(), [
            'otp'     => 'required|digits:6',
            'email'   => 'required|email|unique:users,email',
            'phone'   => 'nullable|string|max:20|unique:users,phone',
            'name'    => 'required|string|max:255',
            'password' => 'required|min:6',
            'confirm_password' => 'required|same:password',
            'reference' => 'nullable|string',
            'user_type' => 'nullable|string|in:client,freelancer',
            'country' => 'required|string',
            'latitude' => 'nullable|string|max:191',
            'longitude' => 'nullable|string|max:191',
            'return_url' => 'required_with:refresh_url|url:http,https',
            'refresh_url' => 'required_with:return_url|url:http,https',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 400, $validator->errors());
        }

        $stripeCountry = $this->normalizeStripeCountry($request->country);

        if (!$stripeCountry) {
            return $this->error('Country must be Australia or India.', 400);
        }

        if (!config('services.stripe.secret')) {
            return $this->error('Stripe is not configured. Please add STRIPE_SECRET.', 500);
        }

        [$returnUrl, $refreshUrl] = $this->onboardingCallbackUrls($request);

        if (str_starts_with((string) config('services.stripe.secret'), 'sk_live_')
            && (!str_starts_with($returnUrl, 'https://') || !str_starts_with($refreshUrl, 'https://'))) {
            return $this->error('Stripe live-mode onboarding URLs must use HTTPS.', 400);
        }

        $cachedOtp = Cache::get('user_otp_' . $request->email);

        if (!$cachedOtp || $cachedOtp != $request->otp) {
            return $this->error('Invalid or expired OTP.', 400);
        }

        try {
            $user = DB::transaction(function () use ($request, $stripeCountry, $stripe) {
                $user = User::create([
                    'name'      => $request->name,
                    'email'     => $request->email,
                    'phone'     => $request->phone,
                    'password'  => \Hash::make($request->password),
                    'user_type' => $request->user_type ?? '',
                    'is_verified' => true,
                    'email_verified_at' => date('Y-m-d H:i:s'),
                    'refrence' => $request->reference ?? null,
                    'refral_code' => null,
                    'country' => $stripeCountry,
                    'latitude' => $request->latitude,
                    'longitude' => $request->longitude,
                ]);

                $stripeAccount = $this->createStripeConnectedAccount($user, $stripeCountry, $stripe);

                // Generate referral code
                $referral_code = strtoupper(substr($user->name, 0, 3)) . $user->id;
                $user->refral_code = $referral_code;
                $user->stripe_account_id = $stripeAccount->id;
                $user->save();

                return $user;
            });
        } catch (ApiErrorException $e) {
            return $this->error('Unable to create Stripe account: '.$e->getMessage(), 400);
        } catch (Throwable $e) {
            report($e);

            return $this->error('Registration failed. Please try again.', 500);
        }

        // Remove OTP from cache (correct key)
        Cache::forget('user_otp_' . $request->email);

        // Generate token
        $token = $user->createToken('api-token')->plainTextToken;

        try {
            $accountLink = $this->createStripeOnboardingLink(
                $user,
                $returnUrl,
                $refreshUrl,
                $stripe
            );
        } catch (Throwable $e) {
            report($e);
            $accountLink = null;
        }

        $user->makeHidden(['password', 'remember_token']);
        if(!$user->dob && !$user->street_address){
            $user->basic_info = 0;
        }else{
            $user->basic_info = 1;
        }
        if(!$user->profile_image){
            $user->profile_pic = 0;
        }else{
            $user->profile_pic = 1;
        }
        // return $user->id;
        $user->proof = 0;
        return $this->success([
            'user' => $user,
            'token' => $token,
            'onboarding_url' => $accountLink?->url,
            'onboarding_link_expires_at' => $accountLink?->expires_at,
        ], $accountLink
            ? 'OTP verified. Registration complete.'
            : 'OTP verified. Registration complete. Request a new Stripe onboarding link to continue.');
    }

    private function normalizeStripeCountry(?string $country): ?string
    {
        $country = strtolower(trim((string) $country));

        return match ($country) {
            'au', 'aus', 'australia' => 'AU',
            'in', 'ind', 'india' => 'IN',
            default => null,
        };
    }

    private function createStripeConnectedAccount(User $user, string $country, StripeClient $stripe)
    {
        return $stripe->v2->core->accounts->create([
            'contact_email' => $user->email,
            'display_name' => $user->name,
            'identity' => [
                'country' => $country,
                'entity_type' => 'individual',
            ],
            'dashboard' => 'express',
            'configuration' => [
                'merchant' => [
                    'capabilities' => [
                        'card_payments' => ['requested' => true],
                    ],
                ],
            ],
            'defaults' => [
                'responsibilities' => [
                    'fees_collector' => 'application',
                    'losses_collector' => 'application',
                ],
            ],
            'metadata' => [
                'user_id' => (string) $user->id,
                'user_type' => (string) $user->user_type,
            ],
        ]);
    }

    private function createStripeOnboardingLink(User $user, string $returnUrl, string $refreshUrl, StripeClient $stripe)
    {
        return $stripe->v2->core->accountLinks->create([
            'account' => $user->stripe_account_id,
            'use_case' => [
                'type' => 'account_onboarding',
                'account_onboarding' => [
                    'configurations' => ['merchant'],
                    'refresh_url' => $refreshUrl,
                    'return_url' => $returnUrl,
                    'collection_options' => [
                        'fields' => 'eventually_due',
                        'future_requirements' => 'include',
                    ],
                ],
            ],
        ]);
    }

    private function onboardingCallbackUrls(Request $request): array
    {
        $baseUrl = rtrim((string) config('services.stripe.onboarding_base_url'), '/');

        return [
            $request->input('return_url') ?: $baseUrl . route('stripe.onboarding.return', [], false),
            $request->input('refresh_url') ?: $baseUrl . route('stripe.onboarding.refresh', [], false),
        ];
    }

    public function stripeOnboardingLink(Request $request, StripeClient $stripe)
    {
        $validator = \Validator::make($request->all(), [
            'return_url' => 'required_with:refresh_url|url:http,https',
            'refresh_url' => 'required_with:return_url|url:http,https',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 400, $validator->errors());
        }

        if (!config('services.stripe.secret')) {
            return $this->error('Stripe is not configured. Please add STRIPE_SECRET.', 500);
        }

        [$returnUrl, $refreshUrl] = $this->onboardingCallbackUrls($request);

        if (str_starts_with((string) config('services.stripe.secret'), 'sk_live_')
            && (!str_starts_with($returnUrl, 'https://') || !str_starts_with($refreshUrl, 'https://'))) {
            return $this->error('Stripe live-mode onboarding URLs must use HTTPS.', 400);
        }

        $user = $request->user();

        if (!$user->stripe_account_id) {
            $stripeCountry = $this->normalizeStripeCountry($user->country);

            if (!$stripeCountry) {
                return $this->error('Country must be Australia or India.', 400);
            }

            try {
                $stripeAccount = $this->createStripeConnectedAccount($user, $stripeCountry, $stripe);
                $user->stripe_account_id = $stripeAccount->id;
                $user->save();
            } catch (ApiErrorException $e) {
                return $this->error('Unable to create Stripe account: '.$e->getMessage(), 400);
            } catch (Throwable $e) {
                report($e);

                return $this->error('Unable to create Stripe account. Please try again.', 500);
            }
        }

        try {
            $accountLink = $this->createStripeOnboardingLink($user, $returnUrl, $refreshUrl, $stripe);
        } catch (ApiErrorException $e) {
            return $this->error('Unable to create Stripe onboarding link: '.$e->getMessage(), 400);
        } catch (Throwable $e) {
            report($e);

            return $this->error('Unable to create Stripe onboarding link. Please try again.', 500);
        }

        return $this->success([
            'url' => $accountLink->url,
            'expires_at' => $accountLink->expires_at,
            'stripe_account_id' => $user->stripe_account_id,
        ], 'Stripe onboarding link created successfully.');
    }

    public function stripeAccountStatus(Request $request, StripeClient $stripe)
    {
        $accountId = $request->user()->stripe_account_id;

        if (!$accountId) {
            return $this->success([
                'connected' => false,
                'stripe_account_id' => null,
                'details_submitted' => false,
                'charges_enabled' => false,
                'payouts_enabled' => false,
                'ready_for_payments' => false,
                'onboarding_required' => true,
                'requirements' => [
                    'currently_due' => [],
                    'eventually_due' => [],
                    'disabled_reason' => null,
                ],
            ], 'No Stripe account is connected.');
        }

        if (!config('services.stripe.secret')) {
            return $this->error('Stripe is not configured. Please add STRIPE_SECRET.', 500);
        }

        try {
            $account = $stripe->v2->core->accounts->retrieve($accountId, [
                'include' => ['configuration.merchant', 'requirements'],
            ]);
        } catch (ApiErrorException $e) {
            return $this->error('Unable to retrieve Stripe account: '.$e->getMessage(), 400);
        } catch (Throwable $e) {
            report($e);

            return $this->error('Unable to retrieve Stripe account. Please try again.', 500);
        }

        $currentlyDue = [];
        $eventuallyDue = [];
        foreach (data_get($account, 'requirements.entries', []) ?? [] as $entry) {
            $deadlineStatus = data_get($entry, 'minimum_deadline.status');
            if (in_array($deadlineStatus, ['currently_due', 'past_due'], true)) {
                $currentlyDue[] = $entry->description;
            } elseif ($deadlineStatus === 'eventually_due') {
                $eventuallyDue[] = $entry->description;
            }
        }

        $chargesEnabled = data_get($account, 'configuration.merchant.capabilities.card_payments.status') === 'active';
        $payoutsEnabled = data_get($account, 'configuration.merchant.capabilities.stripe_balance.payouts.status') === 'active';

        return $this->success([
            'connected' => true,
            'stripe_account_id' => $accountId,
            'details_submitted' => $currentlyDue === [] && $eventuallyDue === [],
            'charges_enabled' => $chargesEnabled,
            'payouts_enabled' => $payoutsEnabled,
            'ready_for_payments' => $chargesEnabled && $payoutsEnabled,
            'onboarding_required' => $currentlyDue !== [] || $eventuallyDue !== [],
            'requirements' => [
                'currently_due' => $currentlyDue,
                'eventually_due' => $eventuallyDue,
                'disabled_reason' => data_get($account, 'configuration.merchant.capabilities.card_payments.status_details.0.code'),
            ],
        ], 'Stripe account status retrieved successfully.');
    }

    public function profileVerificationInfo(Request $request){
        $user = $request->user();
        if(!$user->dob && !$user->street_address){
            $basic_info = 0;
        }else{
            $basic_info = 1;
        }
        if(!$user->profile_image){
            $profile_pic = 0;
        }else{
            $profile_pic = 1;
        }
        $user_proof = UserProof::where('user_id', $user->id)->first();
        if($user_proof){
            $proof = 1;
        }else{
            $proof = 0;
        }
        return $this->success([
            'basic_info' => $basic_info,
            'profile_pic' => $profile_pic,
            'proof' => $proof,
            'is_verification_completed' => $user_proof->is_verified
        ]);
    }

    public function resendOtp(Request $request){
        $validator = \Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 400, $validator->errors());
        }

        // Generate new OTP
        $otp = random_int(100000, 999999);

        // Store in cache for 5 minutes
        Cache::put('user_otp_' . $request->email, $otp, now()->addMinutes(5));

        // Send OTP via email
        Mail::send([], [], function ($message) use ($request, $otp) {
            $message->to($request->email)
                    ->subject('OTP Verification')
                    ->html('<h2>Hello ' . $request->name . '</h2>
                            <p>Your new OTP is <strong>' . $otp . '</strong></p>');
        });

        return $this->success([], 'New OTP sent successfully.');
    }

    public function login(Request $request)
    {
        $validator = \Validator::make($request->all(), [
            'email' => 'required|exists:users,email',
            'password' => 'required',
            'user_type' => 'required|string|in:client,freelancer',
        ], [
            'email.required' => 'Email is required',
            'email.exists' => 'This email is not registered with us.',
            'user_type.in' => 'User type must be either client or freelancer.'
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 400, $validator->errors());
        }

        $user = User::where('email', $request->email)->with('proof')->first();
        if($user->user_type !== $request->user_type){
            return $this->error('This email is not associated with the selected user type', 400);
        }
        $user_proof = UserProof::where('user_id', $user->id)->first();
        if($user_proof->is_verified==2){
            return $this->error('Your ID verification has been rejected. Please contact support for further assistance.', 400);

        }
        // if(!$user->proof || !$user->proof->is_verified){
        //     return $this->error('Your account is under review. Please complete your ID verification.', 400);
        // }

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return $this->error('Invalid credentials', 400);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        $user->makeHidden(['password', 'remember_token']);
        if(!$user->dob && !$user->street_address){
            $basic_info = 0;
        }else{
            $basic_info = 1;
        }
        if(!$user->profile_image){
            $profile_pic = 0;
        }else{
            $profile_pic = 1;
        }
        
        if($user_proof){
            $proof = 1;
        }else{
            $proof = 0;
        }

        return $this->success([
            'user' => $user,
            'token' => $token,
            'basic_info' => $basic_info,
            'profile_pic' => $profile_pic,
            'proof' => $proof,
            'is_verification_completed' => ($user_proof) ? $user_proof->is_verified : 0

        ], 'Login successful.');
    }

    public function logout(Request $request)
    {

        $user = $request->user();
        if ($user && $user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }
        return response()->json(['status'  => 'success','message' => 'Logged out'], 200);
    }

    public function test(Request $request){
        // Validate the email
        $request->validate([
            'email' => 'required|email',
        ]);

        // Generate OTP
        $otp = random_int(100000, 999999);

        // Prepare email content
        $subject = 'OTP for Email Verification';
        $html = '<h2>Hello user</h2>
                <p>Your OTP is <strong>' . $otp . '</strong></p>';

        // Send email
        Mail::send([], [], function ($message) use ($request, $html, $subject) {
            $message->to($request->email)
                    ->subject($subject)
                    ->html($html);
        });

        // Return response (for testing only, remove OTP in production)
        return response()->json([
            'message' => 'OTP sent successfully',
            'otp' => $otp,
        ], 200);
    }

    public function profile(Request $request)
    {
        $user = $request->user();
        $user->profile = url('public/uploads/user/'.$user->profile);

        return response()->json([
            'status' => 'success',
            'data' => $user
        ],200);
    }

    public function forgetPassword(Request $request){
        $validator = \Validator::make($request->all(), [
            'email' => 'required|exists:users,email',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 400, $validator->errors());
        }

        $user = User::where('email', $request->email)->first();

        // Generate new password
        $otp = random_int(100000, 999999);

        // Store OTP in cache for 5 minutes (you can also use DB)
        Cache::put('user_otp_' . $user->id, $otp, now()->addMinutes(5));

        // Send OTP via email
        Mail::send([], [], function ($message) use ($user, $otp) {
            $message->to($user->email)
                    ->subject('Forget Password OTP')
                    ->html('<p>Hello ' . $user->name . '</p>
                            <p>Your OTP is <strong>' . $otp . '</strong></p>');
        });

        return $this->success(['user_id' => $user->id], 'Forget password OTP sent to your email.');
    }

    public function forgetPasswordOtpVerification(Request $request){
        $validator = \Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'otp'     => 'required|digits:6',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 400, $validator->errors());
        }

        $user = User::find($request->user_id);
        $cachedOtp = Cache::get('user_otp_' . $user->id);

        if (!$cachedOtp || $cachedOtp != $request->otp) {
            return $this->error('Invalid or expired OTP.', 400);
        }

        // Optionally, delete OTP from cache
        Cache::forget('user_otp_' . $user->id);

        return $this->success(['user_id' => $user->id], 'OTP verified. You can now reset your password.');
    }

    public function updatePassword(Request $request){
        $validator = \Validator::make($request->all(), [
            'user_id'          => 'required|exists:users,id',
            'new_password'     => 'required|min:6',
            'confirmed_password' => 'required|same:new_password',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 400, $validator->errors());
        }

        $user = User::find($request->user_id);
        $user->password = Hash::make($request->new_password);
        $user->save();

        Mail::send([], [], function ($message) use ($user) {
            $message->to($user->email)
                    ->subject('Password Updated')
                    ->html('<p>Hello ' . $user->name . '</p>
                            <p>Your password has been updated successfully.</p>');
        });

        return $this->success([], 'Password updated successfully.');
    }

    public function basicInfoUpdate(Request $request){
        $validator = \Validator::make($request->all(), [
            'dob' => 'required|date',
            'street_address' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'pincode' => 'required|string|max:20',
            'latitude' => 'required',
            'longitude' => 'required',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 400, $validator->errors());
        }

        $user = $request->user();
        $user->skills = $request->skills;
        $user->dob = $request->dob;
        $user->street_address = $request->street_address;
        $user->state = $request->state;
        $user->pincode = $request->pincode;
        $user->latitude = $request->latitude;
        $user->longitude = $request->longitude;
        $user->save();

        return $this->success($user, 'Basic information updated successfully.');
    }

    public function profilePhotoUpload(Request $request){
        $validator = \Validator::make($request->all(), [
            'profile_image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 400, $validator->errors());
        }

        $user = $request->user();

        if ($request->hasFile('profile_image')) {
            $file = $request->file('profile_image');
            $filename = time() . '.' . $file->guessExtension();
            $filePath = public_path('uploads/user/');
            $file->move($filePath, $filename);

            // Update user's profile image path
            $user->profile_image = 'uploads/user/' . $filename;
            $user->save();

            return $this->success(['profile_image' => url('public/uploads/user/'.$filename)], 'Profile photo uploaded successfully.');
        } else {
            return $this->error('No file uploaded.', 400);
        }
    }

    public function idVerification(Request $request){
        $validator = \Validator::make($request->all(), [
            'proof_type' => 'required|string|max:255',
            'id_number' => 'required|string|max:255',
            'expiry_date' => 'nullable|date',
            'front_image' => 'required|image|mimes:jpeg,png,jpg,gif|max:3072',
            'back_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:3072',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 400, $validator->errors());
        }

        $user = $request->user();

        if ($request->hasFile('front_image')) {
            $file = $request->file('front_image');
            $filename = 'uploads/id_proofs/'.$user->id.'/front_' . time() . '.' . $file->guessExtension();
            $filePath = public_path('uploads/id_proofs/' . $user->id);
            $file->move($filePath, $filename);
        } 
        if ($request->hasFile('back_image')) {
            $file = $request->file('back_image');
            $filename_back = 'uploads/id_proofs/'.$user->id.'/back_' . time() . '.' . $file->guessExtension();
            $filePath = public_path('uploads/id_proofs/' . $user->id);
            $file->move($filePath, $filename_back);
        }

        UserProof::updateOrInsert(
                        [
                            'user_id'    => $user->id,
                            'proof_type' => $request->proof_type,
                        ],
                        [
                            'id_number'   => $request->id_number,
                            'expiry_date' => date('Y-m-d', strtotime($request->expiry_date)),
                            'front_image' => $filename ?? null,
                            'back_image'  => $filename_back ?? null
                        ]
                    );

        return $this->success([$user->load('proof')], 'ID verification submitted successfully. It will be reviewed shortly.');
    }

    public function setting(Request $request){
        $data['skills'] = DB::table('categories')->select('id', 'name','slug','photo')->get();
        $data['proof_type'] = DB::table('proof_type')->select('name')->get();
        $data['base_url'] = url('public/');

        return $this->success($data, 'Settings retrieved successfully.');
    }
}
