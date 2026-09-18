@extends('admin.layouts.admin')

@section('title', 'Dashboard')

@section('content')
<div class="block-header">
    @if ($errors->any())
        <div class="alert alert-danger">
            <ul class="mb-0">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif
                <div class="row">
                    <div class="col-lg-6 col-md-6 col-sm-12">
                        <h2 class="user-name">Settings</h2>
                        <ul class="breadcrumb">
                            <li class="breadcrumb-item"><a href="{{ route('admin.dashboard') }}"><i class="fa fa-dashboard"></i></a></li>                            
                            <li class="breadcrumb-item active">Settings</li>
                        </ul>
                    </div>
                    <div class="col-lg-6 col-md-6 col-sm-12">
                        <div class="d-flex flex-row-reverse">
                            
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row clearfix">
                <div class="col-lg-12">
                    <div class="card">
                        <div class="body">
                            <form action="{{ route('admin.settings.update') }}" method="POST" enctype="multipart/form-data">
                            @csrf

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>Company Name <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" name="company_name" required value="{{ $settings['company_name'] ?? '' }}">
                                    </div>
                                </div>

                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>Address <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" name="address" required value="{{ $settings['address'] ?? '' }}">
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>Mobile <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" name="mobile" required value="{{ $settings['mobile'] ?? '' }}">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>Whatsapp Number <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" name="whatsapp_number" required value="{{ $settings['whatsapp_number'] ?? '' }}">
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>Timing <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" name="timing" required value="{{ $settings['timing'] ?? '' }}">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>GST Number<span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" name="gst" required value="{{ $settings['gst'] ?? '' }}">
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>Logo <span class="text-danger">*</span></label>
                                        <input type="file" class="form-control" name="logo" required onchange="previewImages(this);" >
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <!-- view here -->
                                    <div id="imagePreview" class="d-flex flex-wrap">
                                        <img src="{{ url('public') }}/{{ $settings['logo'] ?? '' }}" class="img-fluid" alt="Logo">
                                    </div>
                                </div>
                            </div>

                            <br>
                            <button type="submit" class="btn btn-primary">Update</button>
                            </form>
                        </div>
                    </div>
                </div>
                
            </div>  
@endsection
@push('scripts')
<script>
   function previewImages(input) {
    let preview = document.getElementById('imagePreview');
    preview.innerHTML = '';

    Array.from(input.files).forEach(file => {
        let reader = new FileReader();
        reader.onload = e => {
            let img = document.createElement('img');
            img.src = e.target.result;
            img.style.width = '100px';
            img.classList.add('m-2');
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

document.querySelector('input[name="title"]').addEventListener('keyup', function () {
    document.getElementById('slug').value =
        this.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}); 


</script>
@endpush