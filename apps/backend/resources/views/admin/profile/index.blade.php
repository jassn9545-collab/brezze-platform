@extends('admin.layouts.admin')

@section('title', 'Dashboard')

@section('content')
<div class="block-header">
    <div class="row">
        <div class="col-lg-6 col-md-6 col-sm-12">
            <ul class="breadcrumb">
                <li class="breadcrumb-item active "><a href="{{ url('/admin/dashboard') }}"><i class="fa fa-dashboard"></i></a></li>
                <li class="breadcrumb-item">Profile</li>
            </ul>
        </div>
    </div>
</div>

<div class="row clearfix">
    <div class="col-lg-12">
                    <div class="card">
                       
                        <div class="tab-content">
    
                            <div class="tab-pane active" id="Settings">

                                <div class="body">
                                    <h6>Profile Photo</h6>
                                    <div class="media">
                                        <div class="media-left m-r-15">
                                            <img src="{{ asset('uploads/users/' . Auth::user()->photo) }}" class="user-photo media-object" alt="User" style="width:140px; height:140px; border-radius: 4px;">
                                        </div>
                                        <div class="media-body">
                                            <p>Upload your photo.
                                                <br> <em>Image should be at least 140px x 140px</em></p>
                                            <button type="button" class="btn btn-default" id="btn-upload-photo">Upload Photo</button>
                                            <input type="file" id="filePhoto" class="sr-only" accept="image/*" name="photo">
                                        </div>
                                    </div>
                                </div>

                                <div class="body">
                                    <h6>Basic Information</h6>
                                    <div class="row clearfix">
                                        <div class="col-lg-6 col-md-12">
                                            <div class="form-group">                                                
                                                <input type="text" class="form-control" placeholder="Name" name="name" required value="{{Auth::user()->name}}" >
                                            </div>
                                            
                                            <div class="form-group">
                                                <div>
                                                    <label class="fancy-radio">
                                                        <input name="gender" value="male" type="radio"  {{ Auth::user()->gender == 'male' ? 'checked' : '' }}>
                                                        <span><i></i>Male</span>
                                                    </label>
                                                    <label class="fancy-radio">
                                                        <input name="gender" value="female" type="radio" {{ Auth::user()->gender == 'female' ? 'checked' : '' }}>
                                                        <span><i></i>Female</span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div class="form-group">
                                                <div class="input-group">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text"><i class="icon-calendar"></i></span>
                                                    </div>
                                                    <input data-provide="datepicker" data-date-autoclose="true" class="form-control" placeholder="Birthdate" name="birthdate" value="{{Auth::user()->dob}}">
                                                </div>
                                            </div>
                                            
                                        </div>
                                        <div class="col-lg-6 col-md-12">
                                            <div class="form-group">                                                
                                                <input type="email" class="form-control" placeholder="Email" name="email" required value="{{Auth::user()->email}}">
                                            </div>
                                            <div class="form-group">                                                
                                                <input type="text" class="form-control" placeholder="Mobile Number" name="mobile" required value="{{Auth::user()->phone}}">
                                            </div>
                                            
                                            
                                        </div>
                                    </div>
                                    <button type="button" class="btn btn-primary update_basic_info">Update</button> &nbsp;&nbsp;
                                    <!-- <button type="button" class="btn btn-default">Cancel</button> -->
                                </div>

                                <div class="body">
                                    <div class="row clearfix">
                                        <div class="col-lg-12 col-md-12">
                                            <h6>Change Password</h6>
                                            <div class="form-group">
                                                <input type="password" class="form-control" placeholder="Current Password" name="current_password">
                                            </div>
                                            <div class="form-group">
                                                <input type="password" class="form-control" placeholder="New Password" name="new_password">
                                            </div>
                                            <div class="form-group">
                                                <input type="password" class="form-control" placeholder="Confirm New Password" name="confirm_new_password">
                                            </div>
                                            
                                        </div>

                                        
                                    </div>
                                    <button type="button" class="btn btn-primary update_password">Update</button> &nbsp;&nbsp;
                                    <!-- <button class="btn btn-default">Cancel</button> -->
                                </div>

                                
                            </div>
    
                        </div>
                    </div>
                </div>          
</div>
@endsection
@push('scripts')
<script>
    document.getElementById('btn-upload-photo').addEventListener('click', function() {
        document.getElementById('filePhoto').click();
    });

    document.getElementById('filePhoto').addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('photo', file);

            fetch('{{url('/admin/profile/upload-photo')}}', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': '{{ csrf_token() }}'
                },
                body: formData
            }).then(response => response.json())
            .then(data => {
                var ress = JSON.parse(data);
                if (ress.status === 'success') {
                    document.querySelector('.media-object').setAttribute('src', ress.photo_url);
                }
            }).catch(error => console.error('Error:', error));
            const reader = new FileReader();
            reader.onload = function(e) {
                document.querySelector('.media-object').setAttribute('src', e.target.result);
            }
            reader.readAsDataURL(file);
        }
    });

    document.querySelector('.update_basic_info').addEventListener('click', function() {
        const name = document.querySelector('input[name="name"]').value;
        const email = document.querySelector('input[name="email"]').value;
        const mobile = document.querySelector('input[name="mobile"]').value;
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const birthdate = document.querySelector('input[name="birthdate"]').value;
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('phone', mobile);
        formData.append('gender', gender);
        formData.append('dob', birthdate);
        fetch('{{url('/admin/profile/update')}}', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': '{{ csrf_token() }}'
            },
            body: formData
        }).then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                toastr.success('Profile updated successfully.');
            }else{
                toastr.error(ress.message);
            }
        }).catch(error => console.error('Error:', error));
    });

    document.querySelector('.update_password').addEventListener('click', function() {
        const current_password = document.querySelector('input[name="current_password"]').value;
        const new_password = document.querySelector('input[name="new_password"]').value;
        const confirm_new_password = document.querySelector('input[name="confirm_new_password"]').value;
        
        if (!current_password || !new_password || !confirm_new_password) {
            toastr.error('All fields are required.');
            return;
        }
        
        if (new_password !== confirm_new_password) {
            toastr.error('New passwords do not match.');
            return;
        }
        
        const formData = new FormData();
        formData.append('current_password', current_password);
        formData.append('new_password', new_password);
        formData.append('confirm_new_password', confirm_new_password);
        
        fetch('{{url('/admin/profile/update-password')}}', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': '{{ csrf_token() }}'
            },
            body: formData
        }).then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                toastr.success('Password updated successfully.');
                document.querySelector('input[name="current_password"]').value = '';
                document.querySelector('input[name="new_password"]').value = '';
                document.querySelector('input[name="confirm_new_password"]').value = '';
            } else {
                toastr.error(data.message);
            }
        }).catch(error => console.error('Error:', error));
    });
</script>
@endpush
