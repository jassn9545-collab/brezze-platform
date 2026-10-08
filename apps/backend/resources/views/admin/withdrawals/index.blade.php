@extends('admin.layouts.admin')

@section('title', 'Withdrawal Requests')

@section('content')
<div class="block-header"><div class="row"><div class="col-12"><h2 class="user-name">Withdrawal Requests</h2><ul class="breadcrumb"><li class="breadcrumb-item"><a href="{{ route('admin.dashboard') }}"><i class="fa fa-dashboard"></i></a></li><li class="breadcrumb-item active">Withdrawal Requests</li></ul></div></div></div>

<div class="alert alert-info"><i class="fa fa-info-circle"></i> This page tracks withdrawal reviews only. Approving or marking a request paid does not automatically send money through Stripe.</div>

<div class="row clearfix">
    <div class="col-lg-2 col-md-4"><div class="card"><div class="body"><small>All</small><h4>{{ $counts['all'] }}</h4></div></div></div>
    <div class="col-lg-2 col-md-4"><div class="card"><div class="body"><small>Pending</small><h4 class="text-warning">{{ $counts['pending'] }}</h4></div></div></div>
    <div class="col-lg-2 col-md-4"><div class="card"><div class="body"><small>Approved</small><h4 class="text-primary">{{ $counts['approved'] }}</h4></div></div></div>
    <div class="col-lg-2 col-md-4"><div class="card"><div class="body"><small>Paid</small><h4 class="text-success">{{ $counts['paid'] }}</h4></div></div></div>
    <div class="col-lg-2 col-md-4"><div class="card"><div class="body"><small>Pending Amount</small><h5>AUD {{ number_format((float) $pendingAmount, 2) }}</h5></div></div></div>
    <div class="col-lg-2 col-md-4"><div class="card"><div class="body"><small>Paid Amount</small><h5>AUD {{ number_format((float) $paidAmount, 2) }}</h5></div></div></div>
</div>

<div class="card"><div class="body">
    <form method="GET" action="{{ route('admin.withdrawals.index') }}" class="row align-items-end mb-4">
        <div class="col-md-6"><label for="search">Search provider/reference</label><input id="search" name="search" class="form-control" value="{{ request('search') }}" placeholder="Provider name, email or payment reference"></div>
        <div class="col-md-3"><label for="status">Status</label><select id="status" name="status" class="form-control"><option value="">All statuses</option>@foreach(['pending' => 'Pending', 'approved' => 'Approved', 'paid' => 'Paid', 'rejected' => 'Rejected'] as $value => $label)<option value="{{ $value }}" @selected(request('status') === $value)>{{ $label }}</option>@endforeach</select></div>
        <div class="col-md-3"><button class="btn btn-primary" type="submit"><i class="fa fa-search"></i> Filter</button> <a href="{{ route('admin.withdrawals.index') }}" class="btn btn-light">Reset</a></div>
    </form>
    <div class="table-responsive"><table class="table table-bordered table-hover table-custom mb-0"><thead><tr><th>ID</th><th>Provider</th><th>Amount</th><th>Stripe Setup</th><th>Status</th><th>Reference</th><th>Requested</th><th>Action</th></tr></thead><tbody>
        @forelse($withdrawals as $withdrawal)
            @php $statusClass = ['pending' => 'warning', 'approved' => 'primary', 'paid' => 'success', 'rejected' => 'danger'][$withdrawal->status] ?? 'secondary'; @endphp
            <tr><td>#{{ $withdrawal->id }}</td><td>@if($withdrawal->provider)<a href="{{ route('admin.users.show', $withdrawal->provider_id) }}">{{ $withdrawal->provider->name }}</a><br><small>{{ $withdrawal->provider->email }}</small>@else<span class="text-muted">Deleted provider</span>@endif</td><td class="text-nowrap">{{ strtoupper($withdrawal->currency) }} {{ number_format((float) $withdrawal->requested_amount, 2) }}</td><td><span class="badge badge-{{ $withdrawal->provider?->stripe_account_id ? 'success' : 'warning' }}">{{ $withdrawal->provider?->stripe_account_id ? 'Connected' : 'Not connected' }}</span></td><td><span class="badge badge-{{ $statusClass }}">{{ ucfirst($withdrawal->status) }}</span></td><td>{{ $withdrawal->payment_reference ?: '—' }}</td><td class="text-nowrap">{{ $withdrawal->created_at?->format('d M Y, h:i A') }}</td><td><a class="btn btn-sm btn-primary" href="{{ route('admin.withdrawals.show', $withdrawal) }}"><i class="fa fa-eye"></i> View</a></td></tr>
        @empty<tr><td colspan="8" class="text-center text-muted py-4">No withdrawal requests found.</td></tr>@endforelse
    </tbody></table></div><div class="mt-3">{{ $withdrawals->links() }}</div>
</div></div>
@endsection
