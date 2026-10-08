@extends('admin.layouts.admin')

@section('title', $pageTitle)

@section('content')
<input type="hidden" id="user_type" value="{{ $userType }}">
<div class="block-header">
                <div class="row">
                    <div class="col-lg-6 col-md-6 col-sm-12">
                        <h2 class="user-name">{{ $pageTitle }}</h2>
                        <ul class="breadcrumb">
                            <li class="breadcrumb-item"><a href="{{ route('admin.dashboard') }}"><i class="fa fa-dashboard"></i></a></li>                            
                            <li class="breadcrumb-item active">{{ $pageTitle }}</li>
                        </ul>
                    </div>
                    <div class="col-lg-6 col-md-6 col-sm-12 text-right text-muted pt-2">
                        Select <strong>View</strong> to see jobs, payments, reviews and account activity.
                    </div>
                </div>
            </div>

            <div class="row clearfix">
                @foreach([
                    ['Clients', $counts['clients'], 'fa-user', 'primary'],
                    ['Professionals', $counts['freelancers'], 'fa-briefcase', 'info'],
                    ['Verified', $counts['verified'], 'fa-check-circle', 'success'],
                    ['Pending', $counts['pending'], 'fa-clock-o', 'warning'],
                ] as [$label, $value, $icon, $colour])
                    <div class="col-lg-3 col-md-6 col-sm-6">
                        <div class="card">
                            <div class="body d-flex align-items-center justify-content-between">
                                <div><small class="text-muted">{{ $label }}</small><h4 class="mb-0">{{ number_format($value) }}</h4></div>
                                <i class="fa {{ $icon }} text-{{ $colour }} fa-2x"></i>
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>
            
            <div class="row clearfix">
                <div class="col-lg-12">
                    <div class="card">
                        <div class="body">
                            <div class="table-responsive">
                                <table class="table table-bordered table-hover js-basic-example dataTable table-custom">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Verification</th>
                                            <th>Featured on Home</th>
                                            <th>Image</th>
                                            <th>Date</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    
                                    <tbody>
                                        
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                
            </div>  
@endsection
@push('scripts')
<script>
    $(document).ready(function() {
        var table = $(".js-basic-example").DataTable({
            language: {"processing": "Please wait..."},
            dom: "frtip",
            serverSide: true,
            processing: true,
            stateSave: true,
            ajax: {
            url: '{{ route("admin.users.index_users") }}', // json datasource
            type: "POST", // method, by default get
            cache: false,
            data: function(data) {
                data.status = $('#status').val();
                data._token = '{{ csrf_token() }}'; // Add CSRF token
                var user_type = $('#user_type').val();
                if(user_type) {
                    data.user_type = user_type;
                }
            },
            error: function(xhr, error, thrown) { // error handling
                $(".table-grid-error").html("");
                $(".js-basic-example tbody").html('<tr class="table-grid-error"><th colspan="8">No data found!</th></tr>');
                $(".js-basic-example_processing").css("display", "none");
            },
            complete: function(data) {
                // Optional: handle completion
            }
            },
        });

        // search
        $('#key-search').on('keyup', function() {
            table.search(this.value).draw();
        });
        // account status
        $('#status').on('change', function() {
            table.draw();
        });
        $('body').on('change','.user-status', function(e) {
            e.preventDefault();
            var userId = $(this).data('id');
            var status = $(this).val();
            $.ajax({
                url: '{{ url("admin/users/update_status") }}/'+userId,
                type: 'POST',
                data: {
                    _token: '{{ csrf_token() }}',
                    status: status
                },
                success: function(response) {
                    if(response.status) {
                        toastr.success('User status updated successfully');
                    } else {
                        toastr.error('Failed to update user status');
                    }
                },
                error: function(xhr, status, error) {
                    toastr.error('An error occurred while updating user status');
                }
        });
    });

        $('body').on('change','.user-featured', function() {
            var checkbox = $(this);
            var featured = checkbox.is(':checked') ? 1 : 0;
            checkbox.prop('disabled', true);

            $.ajax({
                url: '{{ url("admin/users/update_featured") }}/' + checkbox.data('id'),
                type: 'POST',
                data: {
                    _token: '{{ csrf_token() }}',
                    featured: featured
                },
                success: function(response) {
                    if (response.status) {
                        toastr.success(response.message);
                    } else {
                        checkbox.prop('checked', !featured);
                        toastr.error(response.message || 'Failed to update featured professional');
                    }
                },
                error: function(xhr) {
                    checkbox.prop('checked', !featured);
                    toastr.error(
                        xhr.responseJSON && xhr.responseJSON.message
                            ? xhr.responseJSON.message
                            : 'An error occurred while updating featured professional'
                    );
                },
                complete: function() {
                    checkbox.prop('disabled', false);
                }
            });
        });
});
    
</script>
@endpush
