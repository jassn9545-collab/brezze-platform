@extends('admin.layouts.admin')

@section('title', 'Disputes')

@section('content')
<div class="block-header">
    <div class="row"><div class="col-12">
        <h2 class="user-name">Disputes</h2>
        <ul class="breadcrumb"><li class="breadcrumb-item"><a href="{{ route('admin.dashboard') }}"><i class="fa fa-dashboard"></i></a></li><li class="breadcrumb-item active">Disputes</li></ul>
    </div></div>
</div>

<div class="row clearfix">
    @foreach([
        ['All', $counts['all'], 'secondary'],
        ['Open', $counts['open'], 'danger'],
        ['In Review', $counts['in_review'], 'warning'],
        ['Resolved', $counts['resolved'], 'success'],
    ] as [$label, $count, $color])
        <div class="col-lg-3 col-md-6"><div class="card"><div class="body"><small>{{ $label }}</small><h4 class="mb-0 text-{{ $color }}">{{ number_format($count) }}</h4></div></div></div>
    @endforeach
</div>

<div class="card"><div class="body">
    <form method="GET" action="{{ route('admin.disputes.index') }}" class="row align-items-end mb-4">
        <div class="col-md-6"><label for="search">Search dispute, job or user</label><input id="search" name="search" class="form-control" value="{{ request('search') }}" placeholder="Subject, customer, provider or job"></div>
        <div class="col-md-3"><label for="status">Status</label><select id="status" name="status" class="form-control">
            <option value="">All statuses</option>
            @foreach(['open' => 'Open', 'in_review' => 'In Review', 'resolved' => 'Resolved', 'rejected' => 'Rejected'] as $value => $label)
                <option value="{{ $value }}" @selected(request('status') === $value)>{{ $label }}</option>
            @endforeach
        </select></div>
        <div class="col-md-3"><button class="btn btn-primary" type="submit"><i class="fa fa-search"></i> Filter</button> <a href="{{ route('admin.disputes.index') }}" class="btn btn-light">Reset</a></div>
    </form>

    <div class="table-responsive">
        <table class="table table-bordered table-hover table-custom mb-0">
            <thead><tr><th>ID</th><th>Dispute</th><th>Job</th><th>Opened By</th><th>Against</th><th>Priority</th><th>Status</th><th>Created</th><th>Action</th></tr></thead>
            <tbody>
            @forelse($disputes as $dispute)
                @php
                    $statusClass = ['open' => 'danger', 'in_review' => 'warning', 'resolved' => 'success', 'rejected' => 'secondary'][$dispute->status] ?? 'light';
                    $priorityClass = ['urgent' => 'danger', 'high' => 'warning', 'normal' => 'info', 'low' => 'secondary'][$dispute->priority] ?? 'secondary';
                @endphp
                <tr>
                    <td>#{{ $dispute->id }}</td>
                    <td><strong>{{ $dispute->subject }}</strong><br><small class="text-muted">{{ \Illuminate\Support\Str::limit($dispute->description, 80) }}</small></td>
                    <td>@if($dispute->project)<a href="{{ route('admin.jobs.project_view', $dispute->project_id) }}">#{{ $dispute->project_id }} {{ $dispute->project->title }}</a>@else<span class="text-muted">Not linked</span>@endif</td>
                    <td>{{ $dispute->openedBy->name ?? 'Deleted user' }}<br><small>{{ ucfirst($dispute->openedBy->user_type ?? '') }}</small></td>
                    <td>{{ $dispute->againstUser->name ?? 'Not specified' }}<br><small>{{ ucfirst($dispute->againstUser->user_type ?? '') }}</small></td>
                    <td><span class="badge badge-{{ $priorityClass }}">{{ ucfirst($dispute->priority) }}</span></td>
                    <td><span class="badge badge-{{ $statusClass }}">{{ ucwords(str_replace('_', ' ', $dispute->status)) }}</span></td>
                    <td class="text-nowrap">{{ $dispute->created_at?->format('d M Y, h:i A') }}</td>
                    <td><a class="btn btn-sm btn-primary" href="{{ route('admin.disputes.show', $dispute) }}"><i class="fa fa-eye"></i> View</a></td>
                </tr>
            @empty
                <tr><td colspan="9" class="text-center text-muted py-4">No disputes found.</td></tr>
            @endforelse
            </tbody>
        </table>
    </div>
    <div class="mt-3">{{ $disputes->links() }}</div>
</div></div>
@endsection
