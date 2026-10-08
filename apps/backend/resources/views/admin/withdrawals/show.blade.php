@extends('admin.layouts.admin')

@section('title', 'Withdrawal Details')

@section('content')
@php $provider = $withdrawal->provider; $statusClass = ['pending' => 'warning', 'approved' => 'primary', 'paid' => 'success', 'rejected' => 'danger'][$withdrawal->status] ?? 'secondary'; @endphp
<div class="block-header"><div class="row align-items-center"><div class="col-md-8"><h2 class="user-name">Withdrawal Request #{{ $withdrawal->id }}</h2><ul class="breadcrumb"><li class="breadcrumb-item"><a href="{{ route('admin.dashboard') }}"><i class="fa fa-dashboard"></i></a></li><li class="breadcrumb-item"><a href="{{ route('admin.withdrawals.index') }}">Withdrawal Requests</a></li><li class="breadcrumb-item active">Details</li></ul></div><div class="col-md-4 text-right"><a href="{{ route('admin.withdrawals.index') }}" class="btn btn-outline-primary"><i class="fa fa-arrow-left"></i> Back</a></div></div></div>

<div class="alert alert-warning"><strong>Important:</strong> Updating this record does not initiate a Stripe or bank transfer. Mark it paid only after confirming the external payout and entering its reference.</div>

<div class="row clearfix">
    <div class="col-lg-8"><div class="card"><div class="body"><div class="d-flex justify-content-between"><div><small>Requested Amount</small><h3>{{ strtoupper($withdrawal->currency) }} {{ number_format((float) $withdrawal->requested_amount, 2) }}</h3></div><span class="badge badge-{{ $statusClass }} align-self-start px-3 py-2">{{ ucfirst($withdrawal->status) }}</span></div><hr>
        <div class="row"><div class="col-md-4"><small>Total Provider Earnings</small><h5>AUD {{ number_format($balance['total_earnings'], 2) }}</h5></div><div class="col-md-4"><small>Other Approved/Paid Requests</small><h5>AUD {{ number_format($balance['committed'], 2) }}</h5></div><div class="col-md-4"><small>Available Before This Request</small><h5 class="text-success">AUD {{ number_format($balance['available'], 2) }}</h5></div></div>
        <hr><div><strong>Provider Notes</strong><div style="white-space: pre-line;">{{ $withdrawal->provider_notes ?: 'No notes provided.' }}</div></div>
        @if($withdrawal->admin_notes)<hr><div><strong>Admin Notes</strong><div style="white-space: pre-line;">{{ $withdrawal->admin_notes }}</div></div>@endif
        @if($withdrawal->payment_reference)<hr><div><strong>Payment Reference:</strong> {{ $withdrawal->payment_reference }}</div>@endif
    </div></div></div>
    <div class="col-lg-4"><div class="card"><div class="body"><h6>Review Request</h6>
        <form method="POST" action="{{ route('admin.withdrawals.update_status', $withdrawal) }}">@csrf @method('PATCH')
            <div class="form-group"><label>Status</label><select name="status" class="form-control" required>@foreach(['pending' => 'Pending', 'approved' => 'Approved', 'paid' => 'Paid', 'rejected' => 'Rejected'] as $value => $label)<option value="{{ $value }}" @selected(old('status', $withdrawal->status) === $value)>{{ $label }}</option>@endforeach</select>@error('status')<small class="text-danger">{{ $message }}</small>@enderror</div>
            <div class="form-group"><label>External Payment Reference</label><input name="payment_reference" class="form-control" value="{{ old('payment_reference', $withdrawal->payment_reference) }}" placeholder="Required when marked paid">@error('payment_reference')<small class="text-danger">{{ $message }}</small>@enderror</div>
            <div class="form-group"><label>Admin Notes</label><textarea name="admin_notes" rows="4" class="form-control" placeholder="Required when rejected">{{ old('admin_notes', $withdrawal->admin_notes) }}</textarea>@error('admin_notes')<small class="text-danger">{{ $message }}</small>@enderror</div>
            <button class="btn btn-primary btn-block" type="submit">Save Request Status</button>
        </form>
    </div></div></div>
</div>

<div class="row clearfix"><div class="col-lg-12"><div class="card"><div class="body"><h6>Provider</h6>
    @if($provider)<h4><a href="{{ route('admin.users.show', $provider->id) }}">{{ $provider->name }}</a></h4><div>{{ $provider->email }} · {{ $provider->phone ?: 'No phone' }}</div><div class="mt-2"><span class="badge badge-{{ $provider->stripe_account_id ? 'success' : 'warning' }}">Stripe {{ $provider->stripe_account_id ? 'Connected' : 'Not connected' }}</span> <span class="badge badge-{{ $provider->is_verified ? 'success' : 'warning' }}">{{ $provider->is_verified ? 'Verified' : 'Not verified' }}</span></div>@else<div class="alert alert-warning mb-0">Provider account is unavailable.</div>@endif
</div></div></div></div>

<div class="row clearfix"><div class="col-lg-12"><div class="card"><div class="body"><h6>Successful Job Earnings</h6><div class="table-responsive"><table class="table table-bordered table-hover table-custom mb-0"><thead><tr><th>Job</th><th>Transaction</th><th>Total Paid</th><th>Commission</th><th>Provider Earnings</th><th>Paid At</th></tr></thead><tbody>
    @forelse($payments as $payment)<tr><td>@if($payment->project)<a href="{{ route('admin.jobs.project_view', $payment->project_id) }}">#{{ $payment->project_id }} {{ $payment->project->title }}</a>@else#{{ $payment->project_id }}@endif</td><td>{{ $payment->transaction_id ?: $payment->stripe_payment_intent_id ?: '—' }}</td><td>AUD {{ number_format((float) $payment->amount, 2) }}</td><td>AUD {{ number_format((float) $payment->commission_amount, 2) }}</td><td>AUD {{ number_format((float) $payment->provider_earnings, 2) }}</td><td>{{ $payment->paid_at?->format('d M Y, h:i A') ?: '—' }}</td></tr>@empty<tr><td colspan="6" class="text-center text-muted py-4">No successful provider payments found.</td></tr>@endforelse
</tbody></table></div></div></div></div></div>
@endsection
