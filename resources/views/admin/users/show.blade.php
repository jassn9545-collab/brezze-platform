@extends('admin.layouts.admin')

@section('title', 'Dashboard')

@section('content')
<style>
img.user-photo.media-object {
    width: 100px;
}
</style>
<div class="block-header">
                <div class="row">
                    <div class="col-lg-6 col-md-6 col-sm-12">
                        <h2 class="user-name">{{ $user->name }}</h2>
                        <ul class="breadcrumb">
                            <li class="breadcrumb-item"><a href="{{ route('admin.dashboard') }}"><i class="fa fa-dashboard"></i></a></li>
                            <li class="breadcrumb-item"><a href="{{ route('admin.users.index') }}"><i class="fa fa-users"></i></a></li>
                            <li class="breadcrumb-item active">User Detail</li>
                        </ul>
                    </div>
                    <div class="col-lg-6 col-md-6 col-sm-12">
                        <div class="d-flex flex-row-reverse">
                            <div class="page_action">
                                <a class="btn btn-create" href="{{ route('admin.users.index') }}"><i class="fa fa-arrow-left"></i>Back</a>
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
                            <ul class="nav nav-tabs">                                
                                <li class="nav-item"><a class="nav-link active" data-toggle="tab" href="#Settings">Profile</a></li>
                            </ul>
                        </div>
                        <div class="tab-content">
    
                            <div class="tab-pane active" id="Settings">

                                <div class="body">
                                    <h6>Profile Photo</h6>
                                    <div class="media">
                                        <div class="media-left m-r-15">
                                            @if($user->profile)
                                                <img src="{{ asset('uploads/user/'.$user->profile) }}" class="user-photo media-object" alt="User">
                                            @else
                                                <img src="{{ asset('assets/admin/images/user.png') }}" class="user-photo media-object" alt="User">
                                            @endif
                                        </div>
                                        <div class="media-body">
                                            <p>Upload your photo.
                                                <br> <em>Image should be at least 140px x 140px</em></p>
                                            <button type="button" class="btn btn-default" id="btn-upload-photo">Upload Photo</button>

                                            
                                            
                                        </div>
                                    </div>
                                </div>

                                <div class="body">
                                    <h6>Basic Information</h6>
                                    <form class="row clearfix" method="post" action="{{ route('admin.users.update', $user->id) }}" enctype="multipart/form-data">
                                        <input type="file" id="filePhoto" class="sr-only" name="profile">
                                        @csrf
                                        <div class="col-lg-6 col-md-12">
                                            <div class="form-group"> 
                                                <label for="name">Full Name</label>
                                                <input type="text" class="form-control" placeholder="Full Name" name="name" value="{{ $user->name }}">
                                            </div>
                                        </div>
                                        <div class="col-lg-6 col-md-12">
                                            <div class="form-group">
                                                <label for="email">Email</label>
                                                <input type="email" class="form-control" placeholder="Email" name="email" value="{{ $user->email }}">
                                            </div>
                                        </div>
                                        <div class="col-lg-6 col-md-12">
                                            <div class="form-group">
                                                <label for="dob">Birthdate</label>
                                                <input data-provide="datepicker" data-date-autoclose="true" class="form-control" placeholder="Birthdate" value="{{ $user->dob }}" name="dob">
                                            </div>
                                        </div>
                                        <div class="col-lg-6 col-md-12">
                                            <div class="form-group">
                                                <label for="phone">Phone</label>
                                                <input type="text" class="form-control" placeholder="Phone" name="phone" value="{{ $user->phone }}">
                                            </div>
                                        </div>
                                        <div class="col-lg-6 col-md-12">
                                            <div class="form-group">
                                                <label for="alternate_phone">Alternate Phone</label>
                                                <input type="text" class="form-control" placeholder="Alternate Phone" name="alternate_phone" value="{{ $user->alternate_phone }}">
                                            </div>
                                        </div>
                                        <div class="col-lg-6 col-md-12">
                                            <div class="form-group">
                                                <label for="gender">Gender</label>
                                                <select class="form-control" name="gender">
                                                    <option value="male" {{ $user->gender == 'male' ? 'selected' : '' }}>Male</option>
                                                    <option value="female" {{ $user->gender == 'female' ? 'selected' : '' }}>Female</option>
                                                    <option value="other" {{ $user->gender == 'other' ? 'selected' : '' }}>Other</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="col-lg-6 col-md-12">
                                            <div class="form-group">
                                                <label for="nominee_name">Nominee Name</label>
                                                <input type="text" class="form-control" placeholder="Nominee Name" name="nominee_name" value="{{ $user->nominee_name }}">
                                            </div>
                                        </div>
                                        <div class="col-lg-6 col-md-12">
                                            <div class="form-group">
                                                <label for="nominee_dob">Nominee DOB</label>
                                                <input type="text" class="form-control" placeholder="Nominee DOB" name="nominee_dob" value="{{ $user->nominee_dob }}" data-provide="datepicker" data-date-autoclose="true" >
                                            </div>
                                        </div>
                                        <div class="col-lg-6 col-md-12">
                                            <div class="form-group">
                                                <label for="nominee_phone">Nominee Phone</label>
                                                <input type="text" class="form-control" placeholder="Nominee Phone" name="nominee_phone" value="{{ $user->nominee_phone }}">
                                            </div>
                                        </div>
                                        <div class="col-lg-6 col-md-12">
                                            <div class="form-group">
                                                <label for="relation_with_nominee">Relation with Nominee</label>
                                                <input type="text" class="form-control" placeholder="Relation with Nominee" name="relation_with_nominee" value="{{ $user->relation_with_nominee }}">
                                            </div>
                                        </div>

                                    <button type="submit" class="btn btn-primary">Update</button> 
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>  
@endsection
@push('scripts')
<script>
                                            (function(){
                                                var btn = document.getElementById('btn-upload-photo');
                                                var fileInput = document.getElementById('filePhoto');
                                                var img = document.querySelector('.user-photo.media-object') || document.querySelector('.user-photo');

                                                if(btn && fileInput){
                                                    btn.addEventListener('click', function(e){
                                                        e.preventDefault();
                                                        fileInput.click();
                                                    });

                                                    fileInput.addEventListener('change', function(){
                                                        var file = this.files && this.files[0];
                                                        if(!file) return;
                                                        if(!file.type.match('image.*')){
                                                            alert('Please select an image file.');
                                                            this.value = '';
                                                            return;
                                                        }
                                                        var reader = new FileReader();
                                                        reader.onload = function(e){
                                                            if(img) img.src = e.target.result;
                                                        };
                                                        reader.readAsDataURL(file);
                                                    });
                                                }
                                            })();
                                            </script>
@endpush
