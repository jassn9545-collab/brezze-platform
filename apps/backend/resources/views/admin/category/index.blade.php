@extends('admin.layouts.admin')

@section('title', 'Dashboard')

@section('content')
<div class="block-header">
                <div class="row">
                    <div class="col-lg-6 col-md-6 col-sm-12">
                        <h2 class="user-name">Categories</h2>
                        <ul class="breadcrumb">
                            <li class="breadcrumb-item"><a href="{{ route('admin.dashboard') }}"><i class="fa fa-dashboard"></i></a></li>                            
                            <li class="breadcrumb-item active">Categories</li>
                        </ul>
                    </div>
                    <div class="col-lg-6 col-md-6 col-sm-12">
                        <div class="d-flex flex-row-reverse">
                            <div class="page_action">
                                <a class="btn btn-create" href="{{ route('admin.category.create') }}"><i class="fa fa-plus"></i> Create Category</a>
                            </div>
                            <div class="p-2 d-flex">
                                
                            </div>
                        </div>
                    </div>
                </div>
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
                                            <th>Slug</th>
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
            url: '{{ route("admin.category.get_categories") }}', // json datasource
            type: "POST", // method, by default get
            cache: false,
            data: function(data) {
                data.status = $('#status').val();
                data._token = '{{ csrf_token() }}'; // Add CSRF token
            },
            error: function(xhr, error, thrown) { // error handling
                $(".table-grid-error").html("");
                $(".js-basic-example tbody").html('<tr class="table-grid-error"><th colspan="6">No data found!</th></tr>');
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
        $('body').on('click','.btn-danger', function(e) {
            e.preventDefault();
            var link = $(this).attr('href');
            if(!confirm("Are you sure to delete this category?")) {
                return false;
            }
            window.location.href = link;
        });
    });
    
</script>
@endpush