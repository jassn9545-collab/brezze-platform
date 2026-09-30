<!doctype html>
<html lang="en">
<?php
?>
<head>
    <title><?php echo \App\Helpers\CommonHelper::get_setting()['company_name'] ?? ''; ?></title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="Iconic Bootstrap 4.5.0 Admin Template">
    <meta name="author" content="WrapTheme, design by: ThemeMakker.com">

    <link rel="icon" href="{{ asset('favicon.ico') }}" type="image/x-icon">

    <!-- VENDOR CSS -->
    <link rel="stylesheet" href="{{ asset('assets/admin/vendor/bootstrap/css/bootstrap.min.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/admin/vendor/font-awesome/css/font-awesome.min.css') }}">

    <!-- MAIN CSS -->
    <link rel="stylesheet" href="{{ asset('assets/admin/css/main.css') }}">
    
    <script src="{{ asset('assets/admin/vendor/jquery/jquery-3.5.1.min.js') }}"></script>
    <link rel="stylesheet" href="{{ asset('assets/admin/vendor/toastr/toastr.min.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/admin/vendor/bootstrap-datepicker/css/bootstrap-datepicker3.min.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/admin/vendor/jquery-datatable/dataTables.bootstrap4.min.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/admin/vendor/jquery-datatable/fixedeader/dataTables.fixedcolumns.bootstrap4.min.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/admin/vendor/jquery-datatable/fixedeader/dataTables.fixedheader.bootstrap4.min.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/admin/vendor/sweetalert/sweetalert.css') }}"/>
    <link rel="stylesheet" href="{{ asset('assets/admin/vendor/summernote/dist/summernote.min.css') }}">
</head>

<body data-theme="light" class="font-nunito">

<div id="wrapper" class="theme-cyan">

    <!-- Page Loader -->
    <!-- @include('admin.partials.loader') -->

    <!-- Top Navbar -->
    @include('admin.partials.navbar')

    <!-- Left Sidebar -->
    @include('admin.partials.sidebar')

    <!-- Rightbar -->
    @include('admin.partials.rightbar')

    <!-- Main Content -->
    <div id="main-content">
        <div class="container-fluid">
            @yield('content')
        </div>
    </div>
</div>

<!-- Javascript -->
<script src="{{ asset('assets/admin/bundles/libscripts.bundle.js') }}"></script>
<script src="{{ asset('assets/admin/bundles/vendorscripts.bundle.js') }}"></script>
<script src="{{ asset('assets/admin/bundles/mainscripts.bundle.js') }}"></script>
<script src="{{ asset('assets/admin/vendor/bootstrap-datepicker/js/bootstrap-datepicker.min.js') }}"></script>
<script src="{{ asset('assets/admin/vendor/toastr/toastr.js') }}"></script>
<script src="{{ asset('assets/admin/bundles/datatablescripts.bundle.js') }}"></script>
<script src="{{ asset('assets/admin/vendor/jquery-datatable/buttons/dataTables.buttons.min.js') }}"></script>
<script src="{{ asset('assets/admin/vendor/jquery-datatable/buttons/buttons.bootstrap4.min.js') }}"></script>
<script src="{{ asset('assets/admin/vendor/sweetalert/sweetalert.min.js') }}"></script>
<script src="{{ asset('assets/admin/vendor/summernote/dist/summernote.min.js') }}"></script>

<script>
summernote = $('.summernote').summernote({
    height: 200,
    tabsize: 2
});
toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: "toast-top-right",
    timeOut: "5000"
};
@if(session()->has('toastr'))
toastr["{{ session('toastr.type') }}"]("{{ session('toastr.message') }}");
@endif
</script>
@stack('scripts')
</body>
</html>
