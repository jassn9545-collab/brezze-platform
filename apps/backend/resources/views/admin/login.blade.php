<!doctype html>
<html lang="en">

<head>
@php($settings = \App\Helpers\CommonHelper::get_setting())
<title>{{ $settings['company_name'] ?? '' }} | Login</title>
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
</head>

<body data-theme="light" class="font-nunito">
	<!-- WRAPPER -->
	<div id="wrapper" class="theme-cyan">
		<div class="vertical-align-wrap">
			<div class="vertical-align-middle auth-main">
				<div class="auth-box">
                    <div class="top mb-0">
                        <img src="{{ asset($settings['logo'] ?? '') }}" alt="Iconic">
                    </div>
					<div class="card">
                        <div class="header">
                            <p class="lead">Login to your account</p>
                        </div>
                        <div class="body">
                            <form class="form-auth-small" action="index.html">
                                <div class="form-group">
                                    <label for="signin-email" class="control-label sr-only">Email</label>
                                    <input type="email" class="form-control" id="signin-email" value="" placeholder="Email">
                                </div>
                                <div class="form-group">
                                    <label for="signin-password" class="control-label sr-only">Password</label>
                                    <input type="password" class="form-control" id="signin-password" value="" placeholder="Password">
                                </div>
                                <!-- <div class="form-group clearfix">
                                    <label class="fancy-checkbox element-left">
                                        <input type="checkbox">
                                        <span>Remember me</span>
                                    </label>								
                                </div> -->
                                <button type="submit" class="login-button btn btn-primary btn-lg btn-block">LOGIN</button>
                            </form>
                        </div>
                    </div>
				</div>
			</div>
		</div>
	</div>
    <script src="{{ asset('assets/admin/vendor/toastr/toastr.js') }}"></script>
    <script>
        toastr.options = {
            closeButton: true,
            progressBar: true,
            positionClass: "toast-top-right",
            timeOut: "5000"
        };
        $(document).ready(function(){
            $('.form-auth-small').on('submit', function(e) {
                e.preventDefault();
                
                let email = $('#signin-email').val();
                let password = $('#signin-password').val();
                
                $.ajax({
                    url: "{{ route('admin_login') }}",
                    type: 'POST',
                    data: {
                        email: email,
                        password: password,
                        _token: "{{ csrf_token() }}"
                    },
                    success: function(response) {
                        const ress = typeof response === 'string'
                            ? JSON.parse(response)
                            : response;
                        if(ress.status === 'success') {
                            toastr.success('Login successful');
                            window.location.href = "{{ url('admin/dashboard') }}";
                        } else {
                            toastr.error(ress.message || 'Login failed. Please check your credentials.');
                        }
                        // toastr.success('Login successful');
                        // window.location.href = "{{ url('admin/dashboard') }}";
                    },
                    error: function(xhr) {
                        toastr.error(xhr.responseJSON?.message || 'Login failed. Please check your credentials.');
                    }
                });
            });
        });
    </script>
	<!-- END WRAPPER -->
</body>
</html>
