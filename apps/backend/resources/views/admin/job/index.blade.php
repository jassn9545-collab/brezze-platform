@extends('admin.layouts.admin')

@section('title', $pageTitle)

@section('content')
<style>
    .job-stat-card { border-left: 4px solid #17a2b8; }
    .job-stat-card.active { border-left-color: #28a745; }
    .job-stat-card.progress-card { border-left-color: #007bff; }
    .job-stat-card.closed { border-left-color: #6c757d; }
    .job-stat-card a { color: inherit; }
    .jobs-table td { vertical-align: middle; }
    .jobs-table small { color: #6c757d; }
</style>

<div class="block-header">
    <div class="row align-items-center">
        <div class="col-lg-6 col-md-6 col-sm-12">
            <h2 class="user-name">{{ $pageTitle }}</h2>
            <ul class="breadcrumb">
                <li class="breadcrumb-item"><a href="{{ route('admin.dashboard') }}"><i class="fa fa-dashboard"></i></a></li>
                <li class="breadcrumb-item active">{{ $pageTitle }}</li>
            </ul>
        </div>
        <div class="col-lg-6 col-md-6 col-sm-12 text-right">
            <div class="btn-group" role="group" aria-label="Job views">
                <a href="{{ route('admin.jobs.index') }}" class="btn {{ $scope === 'all' ? 'btn-primary' : 'btn-outline-primary' }}">All</a>
                <a href="{{ route('admin.jobs.open') }}" class="btn {{ $scope === 'open' ? 'btn-success' : 'btn-outline-success' }}">Open</a>
                <a href="{{ route('admin.jobs.closed') }}" class="btn {{ $scope === 'closed' ? 'btn-secondary' : 'btn-outline-secondary' }}">Closed</a>
            </div>
        </div>
    </div>
</div>

<div class="row clearfix">
    <div class="col-lg-3 col-md-6 col-sm-12">
        <div class="card job-stat-card"><div class="body"><small>All Jobs</small><h4 class="mb-0">{{ number_format($allCount) }}</h4></div></div>
    </div>
    <div class="col-lg-3 col-md-6 col-sm-12">
        <div class="card job-stat-card active"><div class="body"><small>Open for Bids</small><h4 class="mb-0 text-success">{{ number_format($openCount) }}</h4></div></div>
    </div>
    <div class="col-lg-3 col-md-6 col-sm-12">
        <div class="card job-stat-card progress-card"><div class="body"><small>In Progress</small><h4 class="mb-0 text-primary">{{ number_format($inProgressCount) }}</h4></div></div>
    </div>
    <div class="col-lg-3 col-md-6 col-sm-12">
        <div class="card job-stat-card closed"><div class="body"><small>Closed / Completed</small><h4 class="mb-0">{{ number_format($closedCount) }}</h4></div></div>
    </div>
</div>

<div class="row clearfix">
    <div class="col-lg-12">
        <div class="card">
            <div class="body">
                @if($scope === 'all')
                    <div class="row mb-3">
                        <div class="col-md-4 ml-auto">
                            <label for="status">Filter by status</label>
                            <select id="status" class="form-control">
                                <option value="">All statuses</option>
                                <option value="draft">Draft</option>
                                <option value="active">Open</option>
                                <option value="pause">Paused</option>
                                <option value="in progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="deleted">Deleted</option>
                            </select>
                        </div>
                    </div>
                @endif

                <div class="table-responsive">
                    <table class="table table-bordered table-hover dataTable table-custom jobs-table w-100">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Job</th>
                                <th>Budget</th>
                                <th>Status</th>
                                <th>Client</th>
                                <th>Hired Provider</th>
                                <th>Bids</th>
                                <th>Payment</th>
                                <th>Created</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
$(function () {
    var table = $('.jobs-table').DataTable({
        language: { processing: 'Loading jobs...', emptyTable: 'No jobs found.' },
        dom: 'frtip',
        serverSide: true,
        processing: true,
        stateSave: false,
        pageLength: 25,
        order: [[0, 'desc']],
        columnDefs: [
            { targets: [4, 5, 6, 7, 9], orderable: false },
            { targets: [0, 2, 3, 6, 7, 8, 9], className: 'text-nowrap' }
        ],
        ajax: {
            url: '{{ route('admin.jobs.job_list') }}',
            type: 'POST',
            cache: false,
            data: function (data) {
                data.scope = @json($scope);
                data.status = $('#status').val() || '';
                data._token = '{{ csrf_token() }}';
            },
            error: function (xhr) {
                var message = xhr.responseJSON && xhr.responseJSON.message
                    ? xhr.responseJSON.message
                    : 'Jobs could not be loaded. Please refresh and try again.';
                $('.jobs-table tbody').html('<tr><td colspan="10" class="text-center text-danger py-4"></td></tr>');
                $('.jobs-table tbody td').text(message);
                $('.dataTables_processing').hide();
            }
        }
    });

    $('#status').on('change', function () {
        table.ajax.reload();
    });
});
</script>
@endpush
