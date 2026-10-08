@extends('admin.layouts.admin')

@section('title', 'Dispute Details')

@section('content')
@php
    $statusClass = ['open' => 'danger', 'in_review' => 'warning', 'resolved' => 'success', 'rejected' => 'secondary'][$dispute->status] ?? 'light';
    $priorityClass = ['urgent' => 'danger', 'high' => 'warning', 'normal' => 'info', 'low' => 'secondary'][$dispute->priority] ?? 'secondary';
@endphp
<div class="block-header"><div class="row align-items-center"><div class="col-md-8">
    <h2 class="user-name">Dispute #{{ $dispute->id }}</h2>
    <ul class="breadcrumb"><li class="breadcrumb-item"><a href="{{ route('admin.dashboard') }}"><i class="fa fa-dashboard"></i></a></li><li class="breadcrumb-item"><a href="{{ route('admin.disputes.index') }}">Disputes</a></li><li class="breadcrumb-item active">Details</li></ul>
</div><div class="col-md-4 text-right"><a href="{{ route('admin.disputes.index') }}" class="btn btn-outline-primary"><i class="fa fa-arrow-left"></i> Back</a></div></div></div>

<div class="row clearfix">
    <div class="col-lg-8"><div class="card"><div class="body">
        <div class="d-flex justify-content-between"><div><h4>{{ $dispute->subject }}</h4><small>Opened {{ $dispute->created_at?->format('d M Y, h:i A') }}</small></div><div><span class="badge badge-{{ $priorityClass }} mr-1">{{ ucfirst($dispute->priority) }}</span><span class="badge badge-{{ $statusClass }}">{{ ucwords(str_replace('_', ' ', $dispute->status)) }}</span></div></div>
        <hr><h6>Description</h6><div style="white-space: pre-line;">{{ $dispute->description }}</div>
        @if($dispute->resolution_notes)<hr><h6>Resolution Notes</h6><div style="white-space: pre-line;">{{ $dispute->resolution_notes }}</div><small class="text-muted">Handled by {{ $dispute->resolvedBy->name ?? 'Admin' }} {{ $dispute->resolved_at?->format('d M Y, h:i A') }}</small>@endif
    </div></div></div>
    <div class="col-lg-4"><div class="card"><div class="body">
        <h6>Update Status</h6>
        <form method="POST" action="{{ route('admin.disputes.update_status', $dispute) }}">@csrf @method('PATCH')
            <div class="form-group"><label>Status</label><select name="status" class="form-control" required>
                @foreach(['open' => 'Open', 'in_review' => 'In Review', 'resolved' => 'Resolved', 'rejected' => 'Rejected'] as $value => $label)<option value="{{ $value }}" @selected(old('status', $dispute->status) === $value)>{{ $label }}</option>@endforeach
            </select></div>
            <div class="form-group"><label>Resolution / Admin Notes</label><textarea name="resolution_notes" rows="5" class="form-control" placeholder="Required when resolving or rejecting">{{ old('resolution_notes', $dispute->resolution_notes) }}</textarea>@error('resolution_notes')<small class="text-danger">{{ $message }}</small>@enderror</div>
            <button class="btn btn-primary btn-block" type="submit">Save Dispute Status</button>
        </form>
    </div></div></div>
</div>

<div class="row clearfix">
    @foreach([['Opened By', $dispute->openedBy], ['Against User', $dispute->againstUser]] as [$label, $user])
        <div class="col-lg-6"><div class="card"><div class="body"><h6>{{ $label }}</h6>
            @if($user)<h5><a href="{{ route('admin.users.show', $user->id) }}">{{ $user->name }}</a></h5><div>{{ $user->email }}</div><div>{{ $user->phone ?: 'Phone not provided' }}</div><span class="badge badge-light mt-2">{{ ucfirst($user->user_type) }}</span>@else<div class="text-muted">User not specified or deleted.</div>@endif
        </div></div></div>
    @endforeach
</div>

<div class="row clearfix">
    <div class="col-lg-6"><div class="card"><div class="body"><h6>Related Job</h6>
        @if($dispute->project)<h5><a href="{{ route('admin.jobs.project_view', $dispute->project_id) }}">#{{ $dispute->project_id }} {{ $dispute->project->title }}</a></h5><div>Status: {{ ucwords($dispute->project->status) }}</div><div>Customer: {{ $dispute->project->client->name ?? 'Unavailable' }}</div><div>Provider: {{ $dispute->project->hiredBid?->user?->name ?? 'Not assigned' }}</div>@else<div class="text-muted">No job linked.</div>@endif
    </div></div></div>
    <div class="col-lg-6"><div class="card"><div class="body"><h6>Related Payment</h6>
        @if($dispute->payment)<h5>AUD {{ number_format((float) $dispute->payment->amount, 2) }}</h5><div>Status: {{ ucfirst($dispute->payment->status) }}</div><div>Transaction: {{ $dispute->payment->transaction_id ?: 'Not available' }}</div><div>Commission: AUD {{ number_format((float) $dispute->payment->commission_amount, 2) }}</div>@else<div class="text-muted">No payment linked.</div>@endif
    </div></div></div>
</div>
@endsection
