@extends('admin.layouts.admin')

@section('title', 'Job Details')

@section('content')
@php
    $status = strtolower((string) $project->status);
    $statusClass = match ($status) {
        'active' => 'success',
        'in progress' => 'primary',
        'completed' => 'info',
        'pause' => 'warning',
        'deleted' => 'danger',
        default => 'secondary',
    };
    $hiredBid = $project->hiredBid;
    $provider = $hiredBid?->user;
    $payment = $project->payment;
    $address = collect([$project->address, $project->city, $project->country, $project->pincode])->filter()->unique()->implode(', ');
@endphp

<style>
    .detail-label { color: #6c757d; font-size: 12px; margin-bottom: 4px; text-transform: uppercase; }
    .detail-value { font-weight: 600; word-break: break-word; }
    .profile-avatar { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; background: #f1f3f5; }
    .job-image { width: 100%; height: 170px; object-fit: cover; border-radius: 8px; border: 1px solid #e9ecef; }
    .section-title { font-size: 16px; font-weight: 700; margin-bottom: 18px; }
    .detail-card { height: calc(100% - 20px); }
    .detail-table td, .detail-table th { vertical-align: middle; }
</style>

<div class="block-header">
    <div class="row align-items-center">
        <div class="col-lg-8 col-md-8 col-sm-12">
            <h2 class="user-name">Job #{{ $project->id }} — {{ $project->title ?: 'Untitled Job' }}</h2>
            <ul class="breadcrumb">
                <li class="breadcrumb-item"><a href="{{ route('admin.dashboard') }}"><i class="fa fa-dashboard"></i></a></li>
                <li class="breadcrumb-item"><a href="{{ route('admin.jobs.index') }}">Jobs</a></li>
                <li class="breadcrumb-item active">Details</li>
            </ul>
        </div>
        <div class="col-lg-4 col-md-4 col-sm-12 text-right">
            <a href="{{ url()->previous() === url()->current() ? route('admin.jobs.index') : url()->previous() }}" class="btn btn-outline-primary">
                <i class="fa fa-arrow-left"></i> Back to Jobs
            </a>
        </div>
    </div>
</div>

<div class="row clearfix">
    <div class="col-lg-8 col-md-12">
        <div class="card detail-card">
            <div class="body">
                <div class="d-flex justify-content-between align-items-start mb-4">
                    <div>
                        <h4 class="mb-1">{{ $project->title ?: 'Untitled Job' }}</h4>
                        <small class="text-muted">Posted {{ \Carbon\Carbon::parse($project->created_at)->format('d M Y, h:i A') }}</small>
                    </div>
                    <span class="badge badge-{{ $statusClass }} px-3 py-2">{{ ucwords($project->status ?: 'Unknown') }}</span>
                </div>

                <div class="row mb-4">
                    <div class="col-md-3 col-6 mb-3"><div class="detail-label">Budget</div><div class="detail-value">AUD {{ number_format((float) $project->budget, 2) }}</div></div>
                    <div class="col-md-3 col-6 mb-3"><div class="detail-label">Total Bids</div><div class="detail-value">{{ number_format($project->bids_count) }}</div></div>
                    <div class="col-md-3 col-6 mb-3"><div class="detail-label">Assigned</div><div class="detail-value">{{ $hiredBid ? 'Yes' : 'No' }}</div></div>
                    <div class="col-md-3 col-6 mb-3"><div class="detail-label">Payment</div><div class="detail-value">{{ $payment ? ucfirst($payment->status) : 'Not created' }}</div></div>
                </div>

                <div class="mb-4">
                    <div class="detail-label">Categories</div>
                    @forelse($categories as $category)
                        <span class="badge badge-light border mr-1">{{ $category->name }}</span>
                    @empty
                        <span class="text-muted">{{ $project->category ?: 'Not provided' }}</span>
                    @endforelse
                </div>

                <div class="mb-4">
                    <div class="detail-label">Description</div>
                    <div class="text-dark" style="white-space: pre-line;">{{ $project->description ?: 'No description provided.' }}</div>
                </div>

                <div>
                    <div class="detail-label">Service Location</div>
                    <div class="detail-value">{{ $address ?: 'Not provided' }}</div>
                    @if($project->latitude && $project->longitude)
                        <div class="mt-2">
                            <a href="https://www.google.com/maps/search/?api=1&query={{ urlencode($project->latitude.','.$project->longitude) }}" target="_blank" rel="noopener noreferrer">
                                <i class="fa fa-map-marker"></i> View on map
                            </a>
                            <small class="text-muted ml-2">{{ $project->latitude }}, {{ $project->longitude }}</small>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <div class="col-lg-4 col-md-12">
        <div class="card detail-card">
            <div class="body">
                <div class="section-title">Customer</div>
                @if($project->client)
                    <div class="media">
                        <img class="profile-avatar mr-3" src="{{ $project->client->profile_image ? asset(ltrim($project->client->profile_image, '/')) : asset('assets/admin/images/user.png') }}" alt="Customer">
                        <div class="media-body">
                            <h6 class="mb-1"><a href="{{ route('admin.users.show', $project->client->id) }}">{{ $project->client->name }}</a></h6>
                            <div>{{ $project->client->email }}</div>
                            <div>{{ $project->client->phone ?: 'Phone not provided' }}</div>
                            <span class="badge badge-{{ $project->client->is_verified ? 'success' : 'warning' }} mt-2">{{ $project->client->is_verified ? 'Verified' : 'Not verified' }}</span>
                        </div>
                    </div>
                    @php
                        $clientAddress = collect([$project->client->street_address, $project->client->city, $project->client->state, $project->client->country, $project->client->pincode])->filter()->implode(', ');
                    @endphp
                    @if($clientAddress)
                        <hr><div class="detail-label">Customer Address</div><div>{{ $clientAddress }}</div>
                    @endif
                @else
                    <div class="alert alert-warning mb-0">The customer account was deleted or is unavailable.</div>
                @endif
            </div>
        </div>
    </div>
</div>

<div class="row clearfix">
    <div class="col-lg-6 col-md-12">
        <div class="card detail-card">
            <div class="body">
                <div class="section-title">Hired Provider</div>
                @if($hiredBid)
                    <div class="media">
                        <img class="profile-avatar mr-3" src="{{ $provider?->profile_image ? asset(ltrim($provider->profile_image, '/')) : asset('assets/admin/images/user.png') }}" alt="Provider">
                        <div class="media-body">
                            <h6 class="mb-1">
                                @if($provider)<a href="{{ route('admin.users.show', $provider->id) }}">{{ $provider->name }}</a>@else{{ $hiredBid->freelancer_name ?: 'Deleted provider' }}@endif
                            </h6>
                            <div>{{ $provider?->email ?: 'Email unavailable' }}</div>
                            <div>{{ $provider?->phone ?: 'Phone not provided' }}</div>
                            <div class="mt-2"><strong>Accepted bid:</strong> AUD {{ number_format((float) $hiredBid->bid_amount, 2) }}</div>
                            @if($provider)
                                <span class="badge badge-{{ $provider->is_verified ? 'success' : 'warning' }} mt-2">{{ $provider->is_verified ? 'Verified' : 'Not verified' }}</span>
                            @endif
                        </div>
                    </div>
                    @if($provider?->skills)
                        <hr><div class="detail-label">Skills</div><div>{{ $provider->skills }}</div>
                    @endif
                @else
                    <div class="alert alert-info mb-0">No provider has been hired for this job yet.</div>
                @endif
            </div>
        </div>
    </div>

    <div class="col-lg-6 col-md-12">
        <div class="card detail-card">
            <div class="body">
                <div class="section-title">Payment Summary</div>
                @if($payment)
                    <div class="row">
                        <div class="col-6 mb-3"><div class="detail-label">Status</div><div class="detail-value">{{ ucfirst($payment->status) }}</div></div>
                        <div class="col-6 mb-3"><div class="detail-label">Total Amount</div><div class="detail-value">AUD {{ number_format((float) $payment->amount, 2) }}</div></div>
                        <div class="col-6 mb-3"><div class="detail-label">Admin Commission</div><div class="detail-value">AUD {{ number_format((float) $payment->commission_amount, 2) }}</div></div>
                        <div class="col-6 mb-3"><div class="detail-label">Provider Earnings</div><div class="detail-value">AUD {{ number_format((float) $payment->provider_earnings, 2) }}</div></div>
                        <div class="col-12 mb-3"><div class="detail-label">Transaction</div><div class="detail-value">{{ $payment->transaction_id ?: $payment->stripe_payment_intent_id ?: 'Not available' }}</div></div>
                        <div class="col-12"><div class="detail-label">Paid At</div><div class="detail-value">{{ optional($payment->paid_at)->format('d M Y, h:i A') ?: 'Not paid yet' }}</div></div>
                    </div>
                    @if($payment->failure_message)
                        <div class="alert alert-danger mt-3 mb-0">{{ $payment->failure_message }}</div>
                    @endif
                @else
                    <div class="alert alert-light border mb-0">No payment record exists for this job.</div>
                @endif
            </div>
        </div>
    </div>
</div>

@if($project->images->isNotEmpty())
<div class="row clearfix">
    <div class="col-lg-12">
        <div class="card"><div class="body">
            <div class="section-title">Job Images</div>
            <div class="row">
                @foreach($project->images as $image)
                    <div class="col-lg-3 col-md-4 col-sm-6 mb-3">
                        <a href="{{ asset(ltrim($image->image, '/')) }}" target="_blank" rel="noopener noreferrer">
                            <img class="job-image" src="{{ asset(ltrim($image->image, '/')) }}" alt="Job image">
                        </a>
                    </div>
                @endforeach
            </div>
        </div></div>
    </div>
</div>
@endif

<div class="row clearfix">
    <div class="col-lg-12">
        <div class="card"><div class="body">
            <div class="section-title">All Bids ({{ $project->bids_count }})</div>
            <div class="table-responsive">
                <table class="table table-bordered table-hover table-custom detail-table mb-0">
                    <thead><tr><th>Provider</th><th>Bid Amount</th><th>Applied</th><th>Attachment</th><th>Result</th></tr></thead>
                    <tbody>
                    @forelse($project->bids as $bid)
                        <tr>
                            <td>
                                @if($bid->user)
                                    <a href="{{ route('admin.users.show', $bid->user->id) }}">{{ $bid->user->name }}</a><br><small>{{ $bid->user->email }}</small>
                                @else
                                    {{ $bid->freelancer_name ?: 'Deleted provider' }}
                                @endif
                            </td>
                            <td class="text-nowrap">AUD {{ number_format((float) $bid->bid_amount, 2) }}</td>
                            <td class="text-nowrap">{{ optional($bid->date_time)->format('d M Y, h:i A') ?: '—' }}</td>
                            <td>
                                @if($bid->attachment)<a href="{{ asset(ltrim($bid->attachment, '/')) }}" target="_blank" rel="noopener noreferrer"><i class="fa fa-paperclip"></i> Open</a>@else<span class="text-muted">None</span>@endif
                            </td>
                            <td><span class="badge badge-{{ $bid->is_hired ? 'success' : 'light' }}">{{ $bid->is_hired ? 'Hired' : 'Not selected' }}</span></td>
                        </tr>
                    @empty
                        <tr><td colspan="5" class="text-center text-muted py-4">No providers have applied to this job.</td></tr>
                    @endforelse
                    </tbody>
                </table>
            </div>
        </div></div>
    </div>
</div>

@if($hiredBid && ($hiredBid->work_description || $hiredBid->work_attachment || $hiredBid->end_date_time))
<div class="row clearfix">
    <div class="col-lg-12">
        <div class="card"><div class="body">
            <div class="section-title">Provider Work Submission</div>
            <div class="detail-label">Completion Notes</div>
            <div style="white-space: pre-line;">{{ $hiredBid->work_description ?: 'No notes provided.' }}</div>
            <div class="mt-3">
                @if($hiredBid->work_attachment)
                    <a class="btn btn-outline-primary btn-sm" href="{{ asset(ltrim($hiredBid->work_attachment, '/')) }}" target="_blank" rel="noopener noreferrer"><i class="fa fa-paperclip"></i> Open work attachment</a>
                @endif
                @if($hiredBid->end_date_time)
                    <span class="ml-2 text-muted">Submitted {{ \Carbon\Carbon::parse($hiredBid->end_date_time)->format('d M Y, h:i A') }}</span>
                @endif
            </div>
        </div></div>
    </div>
</div>
@endif

<div class="row clearfix">
    <div class="col-lg-12">
        <div class="card"><div class="body">
            <div class="section-title">Reviews ({{ $reviews->count() }})</div>
            <div class="table-responsive">
                <table class="table table-bordered table-hover table-custom detail-table mb-0">
                    <thead><tr><th>From</th><th>To</th><th>Rating</th><th>Review</th><th>Date</th></tr></thead>
                    <tbody>
                    @forelse($reviews as $review)
                        <tr>
                            <td>{{ $review->reviewer->name ?? 'Deleted user' }}<br><small>{{ $review->reviewer->email ?? '' }}</small></td>
                            <td>{{ $review->receiver->name ?? 'Deleted user' }}<br><small>{{ ucfirst($review->review_to) }}</small></td>
                            <td class="text-nowrap text-warning">{{ str_repeat('★', max(0, min(5, (int) $review->star))) }}<span class="text-muted"> {{ $review->star }}/5</span></td>
                            <td>{{ $review->review ?: 'No written feedback.' }}</td>
                            <td class="text-nowrap">{{ optional($review->created_at)->format('d M Y, h:i A') ?: '—' }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="5" class="text-center text-muted py-4">No reviews have been submitted for this job.</td></tr>
                    @endforelse
                    </tbody>
                </table>
            </div>
        </div></div>
    </div>
</div>
@endsection
