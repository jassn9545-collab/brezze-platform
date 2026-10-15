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

                            <hr>
                            <h4>Customer Home Hero</h4>
                            <p class="text-muted">Changes saved here are loaded by the customer app automatically. An app update is not required.</p>

                            <div class="row">
                                <div class="col-md-8">
                                    <div class="form-group">
                                        <label>Hero Text</label>
                                        <textarea class="form-control" name="customer_hero_title" rows="3" maxlength="160">{{ old('customer_hero_title', $settings->has('customer_hero_title') ? $settings->get('customer_hero_title') : 'Book Expert For Your Home & Get 30% Off on First Booking.') }}</textarea>
                                        <small class="form-text text-muted">Optional. Leave empty to hide the hero text.</small>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label>Button Text</label>
                                        <input type="text" class="form-control" name="customer_hero_button_text" maxlength="40" value="{{ old('customer_hero_button_text', $settings->has('customer_hero_button_text') ? $settings->get('customer_hero_button_text') : 'Book Now') }}">
                                        <small class="form-text text-muted">Optional. Leave empty to hide the button.</small>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>Hero Image</label>
                                        <input type="file" class="form-control" name="customer_hero_image" accept="image/jpeg,image/png,image/webp" onchange="previewImage(this, 'heroImagePreview');">
                                        <small class="form-text text-muted">JPG, PNG or WebP, up to 5 MB. Leave empty to keep the current image.</small>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div id="heroImagePreview" class="d-flex flex-wrap">
                                        @if (!empty($settings['customer_hero_image']))
                                            <img src="{{ url('public') }}/{{ $settings['customer_hero_image'] }}" class="img-fluid" style="max-height: 180px; border-radius: 12px;" alt="Customer home hero">
                                        @else
                                            <div class="alert alert-secondary mb-0">The app's default placeholder image is active.</div>
                                        @endif
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>Logo</label>
                                        <input type="file" class="form-control" name="logo" accept="image/jpeg,image/png,image/webp" onchange="previewImage(this, 'imagePreview');" >
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
function previewImage(input, previewId) {
    let preview = document.getElementById(previewId);
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
</script>
@endpush
