@extends('admin.layouts.admin')

@section('title', $user->user_type === 'freelancer' ? 'Professional Details' : 'Client Details')

@section('content')
@php
    $isFreelancer = $user->user_type === 'freelancer';
    $verification = $user->proof?->is_verified ?? $user->is_verified ?? 0;
    $verificationLabels = [0 => 'Pending', 1 => 'Verified', 2 => 'Rejected'];
    $verificationColours = [0 => 'warning', 1 => 'success', 2 => 'danger'];
    $profilePhoto = $user->profile_image
        ? asset(ltrim($user->profile_image, '/'))
        : 'https://ui-avatars.com/api/?name='.urlencode($user->name).'&background=0063b7&size=256&rounded=true&color=fff&length=1';
    $statusColour = fn ($status) => match ($status) {
        'completed', 'succeeded', 'resolved', 'paid', 'approved' => 'success',
        'failed', 'rejected', 'cancelled' => 'danger',
        'in progress', 'processing', 'in_review' => 'info',
        default => 'warning',
    };
@endphp

<style>
    .admin-profile-photo { width: 110px; height: 110px; object-fit: cover; border-radius: 50%; }
    .detail-label { color: #8a8f98; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; }
    .detail-value { color: #222; margin-bottom: 16px; overflow-wrap: anywhere; }
    .stat-card h3 { margin: 4px 0 0; }
    .proof-image { width: 100%; max-height: 220px; object-fit: contain; border: 1px solid #e5e7eb; border-radius: 8px; background: #fafafa; }
    .table td { vertical-align: middle; }
</style>

<div class="block-header"><div class="row">
    <div class="col-lg-8 col-md-8 col-sm-12">
        <h2>{{ $isFreelancer ? 'Professional' : 'Client' }} Details</h2>
        <ul class="breadcrumb">
            <li class="breadcrumb-item"><a href="{{ route('admin.dashboard') }}"><i class="fa fa-dashboard"></i></a></li>
            <li class="breadcrumb-item"><a href="{{ route('admin.users.index', ['type' => $user->user_type]) }}">{{ $isFreelancer ? 'Professionals' : 'Clients' }}</a></li>
            <li class="breadcrumb-item active">{{ $user->name }}</li>
        </ul>
    </div>
    <div class="col-lg-4 col-md-4 col-sm-12 text-right"><a class="btn btn-create" href="{{ route('admin.users.index', ['type' => $user->user_type]) }}"><i class="fa fa-arrow-left"></i> Back</a></div>
</div></div>

<div class="row clearfix">
    <div class="col-lg-4 col-md-12">
        <div class="card">
            <div class="body text-center">
                <img src="{{ $profilePhoto }}" class="admin-profile-photo" alt="{{ $user->name }}">
                <h5 class="mt-3 mb-1">{{ $user->name }}</h5>
                <p class="text-muted mb-2">{{ $isFreelancer ? ($user->profile_title ?: 'Service Professional') : 'Client' }}</p>
                <span class="badge badge-{{ $verificationColours[$verification] ?? 'secondary' }}">{{ $verificationLabels[$verification] ?? 'Unknown' }}</span>
                <span class="badge badge-primary">{{ ucfirst($user->user_type) }}</span>
            </div>
            <div class="body border-top">
                <label class="detail-label">Verification status</label>
                <select class="form-control" id="verification-status">
                    <option value="0" @selected($verification === 0)>Pending</option>
                    <option value="1" @selected($verification === 1)>Verified</option>
                    <option value="2" @selected($verification === 2)>Rejected</option>
                </select>
                <small class="text-muted d-block mt-2">Updates the account and submitted proof together.</small>
            </div>
        </div>
        <div class="card"><div class="header"><h2>Contact & address</h2></div><div class="body">
            <div class="detail-label">Email</div><div class="detail-value">{{ $user->email }}</div>
            <div class="detail-label">Phone</div><div class="detail-value">{{ $user->phone ?: 'Not provided' }}</div>
            <div class="detail-label">Alternate phone</div><div class="detail-value">{{ $user->alternate_phone ?: 'Not provided' }}</div>
            <div class="detail-label">Date of birth</div><div class="detail-value">{{ $user->dob ? date('M d, Y', strtotime($user->dob)) : 'Not provided' }}</div>
            <div class="detail-label">Gender</div><div class="detail-value">{{ $user->gender ? ucfirst($user->gender) : 'Not provided' }}</div>
            <div class="detail-label">Address</div><div class="detail-value">{{ collect([$user->street_address, $user->city, $user->state, $user->country, $user->pincode])->filter()->implode(', ') ?: 'Not provided' }}</div>
            <div class="detail-label">Joined</div><div class="detail-value mb-0">{{ $user->created_at?->format('M d, Y h:i A') ?: '—' }}</div>
        </div></div>
    </div>

    <div class="col-lg-8 col-md-12">
        <div class="row clearfix">
            @php
                $cards = $isFreelancer
                    ? [['Bids',$stats['bids']],['Hired',$stats['hired']],['Completed',$stats['completed']],['Earnings','$'.number_format($stats['earnings'],2)],['Rating',number_format($stats['rating'],1).' / 5'],['Reviews',$stats['reviews']]]
                    : [['Jobs',$stats['jobs']],['Open',$stats['open']],['In progress',$stats['in_progress']],['Completed',$stats['completed']],['Total paid','$'.number_format($stats['spent'],2)],['Reviews received',$stats['reviews']]];
            @endphp
            @foreach($cards as [$label, $value])
                <div class="col-lg-4 col-md-4 col-sm-6"><div class="card stat-card"><div class="body"><small class="text-muted">{{ $label }}</small><h3>{{ $value }}</h3></div></div></div>
            @endforeach
        </div>

        <div class="card">
            <div class="body"><ul class="nav nav-tabs">
                <li class="nav-item"><a class="nav-link active" data-toggle="tab" href="#overview">Overview</a></li>
                <li class="nav-item"><a class="nav-link" data-toggle="tab" href="#jobs">{{ $isFreelancer ? 'Bids & jobs' : 'Jobs' }}</a></li>
                <li class="nav-item"><a class="nav-link" data-toggle="tab" href="#payments">Payments</a></li>
                <li class="nav-item"><a class="nav-link" data-toggle="tab" href="#reviews">Reviews</a></li>
                <li class="nav-item"><a class="nav-link" data-toggle="tab" href="#cases">{{ $isFreelancer ? 'Withdrawals & disputes' : 'Disputes' }}</a></li>
            </ul></div>

            <div class="tab-content">
                <div class="tab-pane active" id="overview"><div class="body">
                    @if($isFreelancer)
                        <div class="row">
                            <div class="col-md-6"><div class="detail-label">Profile title</div><div class="detail-value">{{ $user->profile_title ?: 'Not provided' }}</div></div>
                            <div class="col-md-6"><div class="detail-label">Experience</div><div class="detail-value">{{ $user->experience ?: 'Not provided' }}</div></div>
                            <div class="col-md-12"><div class="detail-label">Skills</div><div class="detail-value">{{ is_array($user->skills) ? implode(', ', $user->skills) : ($user->skills ?: 'Not provided') }}</div></div>
                            <div class="col-md-12"><div class="detail-label">Profile description</div><div class="detail-value">{{ $user->profile_description ?: 'Not provided' }}</div></div>
                            <div class="col-md-12"><div class="detail-label">Stripe Connect</div><div class="detail-value"><span class="badge badge-{{ $user->stripe_account_id ? 'success' : 'warning' }}">{{ $user->stripe_account_id ? 'Connected' : 'Not connected' }}</span></div></div>
                        </div>
                        <h6>Service listings</h6>
                        <div class="table-responsive"><table class="table table-sm table-bordered"><thead><tr><th>Service</th><th>Category</th><th>Price</th><th>Status</th></tr></thead><tbody>
                        @forelse($serviceCatalogs as $service)
                            <tr><td>{{ $service->heading }}</td><td>{{ $service->category?->name ?: '—' }}</td><td>${{ number_format((float)$service->price, 2) }}</td><td><span class="badge badge-{{ $service->status ? 'success' : 'secondary' }}">{{ $service->status ? 'Active' : 'Inactive' }}</span></td></tr>
                        @empty<tr><td colspan="4" class="text-center text-muted">No services created.</td></tr>@endforelse
                        </tbody></table></div>
                    @else
                        <div class="row">
                            <div class="col-md-6"><div class="detail-label">Stripe customer</div><div class="detail-value"><span class="badge badge-{{ $user->stripe_customer_id ? 'success' : 'warning' }}">{{ $user->stripe_customer_id ? 'Connected' : 'Not connected' }}</span></div></div>
                            <div class="col-md-6"><div class="detail-label">Reference code</div><div class="detail-value">{{ $user->refral_code ?: '—' }}</div></div>
                        </div>
                        <h6>Service bookings</h6>
                        <div class="table-responsive"><table class="table table-sm table-bordered"><thead><tr><th>Service</th><th>Professional</th><th>Price</th><th>Status</th></tr></thead><tbody>
                        @forelse($bookings as $booking)
                            <tr><td>{{ $booking->catalog?->heading ?: '—' }}</td><td>{{ $booking->provider?->name ?: '—' }}</td><td>${{ number_format((float)$booking->price, 2) }}</td><td><span class="badge badge-{{ $statusColour($booking->status) }}">{{ ucfirst(str_replace('_', ' ', $booking->status)) }}</span></td></tr>
                        @empty<tr><td colspan="4" class="text-center text-muted">No service bookings.</td></tr>@endforelse
                        </tbody></table></div>
                    @endif

                    <h6 class="mt-3">Identity proof</h6>
                    @if($user->proof)
                        <div class="row">
                            <div class="col-md-4"><div class="detail-label">Type</div><div class="detail-value">{{ ucfirst(str_replace('_', ' ', $user->proof->proof_type ?: 'Not provided')) }}</div></div>
                            <div class="col-md-4"><div class="detail-label">ID number</div><div class="detail-value">{{ $user->proof->id_number ?: 'Not provided' }}</div></div>
                            <div class="col-md-4"><div class="detail-label">Expiry</div><div class="detail-value">{{ $user->proof->expiry_date?->format('M d, Y') ?: 'Not provided' }}</div></div>
                            @if($user->proof->front_image)<div class="col-md-6"><div class="detail-label mb-2">Front image</div><a href="{{ asset(ltrim($user->proof->front_image, '/')) }}" target="_blank"><img class="proof-image" src="{{ asset(ltrim($user->proof->front_image, '/')) }}" alt="Proof front"></a></div>@endif
                            @if($user->proof->back_image)<div class="col-md-6"><div class="detail-label mb-2">Back image</div><a href="{{ asset(ltrim($user->proof->back_image, '/')) }}" target="_blank"><img class="proof-image" src="{{ asset(ltrim($user->proof->back_image, '/')) }}" alt="Proof back"></a></div>@endif
                        </div>
                    @else<div class="alert alert-warning mb-0">No identity proof has been submitted.</div>@endif
                </div></div>

                <div class="tab-pane" id="jobs"><div class="body"><div class="table-responsive"><table class="table table-bordered table-hover">
                    <thead><tr><th>Job</th><th>{{ $isFreelancer ? 'Client' : 'Professional' }}</th><th>{{ $isFreelancer ? 'Bid amount' : 'Budget / bids' }}</th><th>Status</th><th></th></tr></thead><tbody>
                    @if($isFreelancer)
                        @forelse($bids as $bid)
                            <tr><td>{{ $bid->project?->title ?: 'Deleted job' }}</td><td>{{ $bid->project?->client?->name ?: '—' }}</td><td>${{ number_format((float)$bid->bid_amount, 2) }} @if($bid->is_hired)<span class="badge badge-success">Hired</span>@endif</td><td><span class="badge badge-{{ $statusColour($bid->project?->status) }}">{{ ucfirst($bid->project?->status ?: 'Unknown') }}</span></td><td>@if($bid->project)<a class="btn btn-sm btn-warning" href="{{ route('admin.jobs.project_view', $bid->project_id) }}">View</a>@endif</td></tr>
                        @empty<tr><td colspan="5" class="text-center text-muted">No bids or job activity.</td></tr>@endforelse
                    @else
                        @forelse($projects as $project)
                            <tr><td>{{ $project->title }}</td><td>{{ $project->hiredBid?->user?->name ?: 'Not hired' }}</td><td>${{ number_format((float)$project->budget, 2) }} / {{ $project->bids_count }} bids</td><td><span class="badge badge-{{ $statusColour($project->status) }}">{{ ucfirst($project->status) }}</span></td><td><a class="btn btn-sm btn-warning" href="{{ route('admin.jobs.project_view', $project->id) }}">View</a></td></tr>
                        @empty<tr><td colspan="5" class="text-center text-muted">No jobs posted.</td></tr>@endforelse
                    @endif
                    </tbody></table></div></div></div>

                <div class="tab-pane" id="payments"><div class="body"><div class="table-responsive"><table class="table table-bordered">
                    <thead><tr><th>Job</th><th>{{ $isFreelancer ? 'Client' : 'Professional' }}</th><th>Transaction</th><th>Amount</th>@if($isFreelancer)<th>Earnings</th>@endif<th>Status</th><th>Date</th></tr></thead><tbody>
                    @forelse($payments as $payment)
                        <tr><td>{{ $payment->project?->title ?: '—' }}</td><td>{{ $isFreelancer ? ($payment->customer?->name ?: '—') : ($payment->provider?->name ?: '—') }}</td><td>{{ $payment->transaction_id ?: $payment->stripe_payment_intent_id ?: '—' }}</td><td>${{ number_format((float)$payment->amount, 2) }}</td>@if($isFreelancer)<td>${{ number_format((float)$payment->provider_earnings, 2) }}</td>@endif<td><span class="badge badge-{{ $statusColour($payment->status) }}">{{ ucfirst($payment->status) }}</span></td><td>{{ $payment->paid_at?->format('M d, Y') ?: ($payment->created_at?->format('M d, Y') ?: '—') }}</td></tr>
                    @empty<tr><td colspan="{{ $isFreelancer ? 7 : 6 }}" class="text-center text-muted">No payment records.</td></tr>@endforelse
                    </tbody></table></div></div></div>

                <div class="tab-pane" id="reviews"><div class="body">
                    <h6>Reviews received ({{ $reviewsReceived->count() }})</h6>
                    <div class="table-responsive"><table class="table table-bordered"><thead><tr><th>From</th><th>Job</th><th>Rating</th><th>Review</th><th>Date</th></tr></thead><tbody>
                    @forelse($reviewsReceived as $review)<tr><td>{{ $review->reviewer?->name ?: '—' }}</td><td>{{ $review->job?->title ?: '—' }}</td><td><span class="text-warning">{{ str_repeat('★', max(0, min(5, (int)$review->star))) }}</span> {{ $review->star }}/5</td><td>{{ $review->review ?: '—' }}</td><td>{{ $review->created_at?->format('M d, Y') ?: '—' }}</td></tr>@empty<tr><td colspan="5" class="text-center text-muted">No reviews received.</td></tr>@endforelse
                    </tbody></table></div>
                    <h6 class="mt-4">Reviews given ({{ $reviewsGiven->count() }})</h6>
                    <div class="table-responsive"><table class="table table-bordered"><thead><tr><th>To</th><th>Job</th><th>Rating</th><th>Review</th><th>Date</th></tr></thead><tbody>
                    @forelse($reviewsGiven as $review)<tr><td>{{ $review->receiver?->name ?: '—' }}</td><td>{{ $review->job?->title ?: '—' }}</td><td><span class="text-warning">{{ str_repeat('★', max(0, min(5, (int)$review->star))) }}</span> {{ $review->star }}/5</td><td>{{ $review->review ?: '—' }}</td><td>{{ $review->created_at?->format('M d, Y') ?: '—' }}</td></tr>@empty<tr><td colspan="5" class="text-center text-muted">No reviews given.</td></tr>@endforelse
                    </tbody></table></div>
                </div></div>

                <div class="tab-pane" id="cases"><div class="body">
                    @if($isFreelancer)
                        <h6>Withdrawal requests</h6>
                        <div class="table-responsive"><table class="table table-bordered"><thead><tr><th>Requested</th><th>Amount</th><th>Status</th><th>Reference</th><th></th></tr></thead><tbody>
                        @forelse($withdrawals as $withdrawal)<tr><td>{{ $withdrawal->created_at?->format('M d, Y') ?: '—' }}</td><td>{{ strtoupper($withdrawal->currency) }} {{ number_format((float)$withdrawal->requested_amount, 2) }}</td><td><span class="badge badge-{{ $statusColour($withdrawal->status) }}">{{ ucfirst($withdrawal->status) }}</span></td><td>{{ $withdrawal->payment_reference ?: '—' }}</td><td><a class="btn btn-sm btn-warning" href="{{ route('admin.withdrawals.show', $withdrawal) }}">View</a></td></tr>@empty<tr><td colspan="5" class="text-center text-muted">No withdrawal requests.</td></tr>@endforelse
                        </tbody></table></div>
                    @endif
                    <h6 class="{{ $isFreelancer ? 'mt-4' : '' }}">Disputes</h6>
                    <div class="table-responsive"><table class="table table-bordered"><thead><tr><th>Subject</th><th>Job</th><th>Opened by</th><th>Against</th><th>Status</th><th></th></tr></thead><tbody>
                    @forelse($disputes as $dispute)<tr><td>{{ $dispute->subject }}</td><td>{{ $dispute->project?->title ?: '—' }}</td><td>{{ $dispute->openedBy?->name ?: '—' }}</td><td>{{ $dispute->againstUser?->name ?: '—' }}</td><td><span class="badge badge-{{ $statusColour($dispute->status) }}">{{ ucfirst(str_replace('_', ' ', $dispute->status)) }}</span></td><td><a class="btn btn-sm btn-warning" href="{{ route('admin.disputes.show', $dispute) }}">View</a></td></tr>@empty<tr><td colspan="6" class="text-center text-muted">No disputes.</td></tr>@endforelse
                    </tbody></table></div>
                </div></div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
$(function () {
    $('#verification-status').on('change', function () {
        var select = $(this);
        select.prop('disabled', true);
        $.ajax({
            url: '{{ route('admin.users.update_status', $user->id) }}',
            type: 'POST',
            data: { _token: '{{ csrf_token() }}', status: select.val() },
            success: function () { toastr.success('Verification status updated successfully.'); window.location.reload(); },
            error: function (xhr) { toastr.error(xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : 'Unable to update verification status.'); select.prop('disabled', false); }
        });
    });
});
</script>
@endpush
