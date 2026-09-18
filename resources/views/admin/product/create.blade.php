@extends('admin.layouts.admin')

@section('title', 'Dashboard')

@section('content')
<style>
#imagePreview {
    display: none; /* hidden by default */
    gap: 10px;
}

#imagePreview.active {
    display: flex;
    flex-wrap: wrap;
}

#imagePreview img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid #ddd;
    background: #f8f8f8;
    padding: 4px;
}
</style>
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
                        <h2 class="user-name">Products</h2>
                        <ul class="breadcrumb">
                            <li class="breadcrumb-item"><a href="{{ route('admin.dashboard') }}"><i class="fa fa-dashboard"></i></a></li>                            
                            <li class="breadcrumb-item active">New Products</li>
                        </ul>
                    </div>
                    <div class="col-lg-6 col-md-6 col-sm-12">
                        <div class="d-flex flex-row-reverse">
                            <div class="page_action">
                                <a class="btn btn-create" href="{{ route('admin.product.index') }}"><i class="fa fa-arrow-left"></i> Back</a>
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
                            <form action="{{ route('admin.product.store') }}" method="POST" enctype="multipart/form-data">
                            @csrf

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>Product Title <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" name="title" required>
                                        <input type="hidden" name="slug" id="slug">
                                    </div>
                                </div>

                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>Type <span class="text-danger">*</span></label>
                                        <select class="form-control" name="type" required>
                                            <option value="">Select</option>
                                            <option value="gold">Gold</option>
                                            <option value="silver">Silver</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>Carat</label>
                                        <select class="form-control" name="carat">
                                            <option value="24ct">24 CT</option>
                                            <option value="22ct">22 CT</option>
                                            <option value="18ct">18 CT</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>Weight (grams)</label>
                                        <input type="number" step="0.001" class="form-control" name="weight">
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>Price</label>
                                        <input type="number" step="0.01" class="form-control" name="price">
                                    </div>
                                </div>

                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>Product Images</label>
                                        <input type="file" class="form-control" name="images[]" multiple onchange="previewImages(this)">
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>Category</label>
                                        <select class="form-control" name="category_id" >
                                            <option value="">Select Category</option>
                                            @foreach($categories as $category)
                                                <option value="{{ $category->id }}">{{ $category->name }}</option>
                                            @endforeach
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-12">
                                    <div id="imagePreview" class="d-flex flex-wrap"></div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-12">
                                    <div class="form-group">
                                        <label>Product Description</label>
                                        <textarea class="form-control summernote" name="description" rows="3"></textarea>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-12">
                                    <div class="form-group">
                                        <label>Specification</label>
                                        <textarea class="form-control summernote" name="specification" rows="3"></textarea>
                                    </div>
                                </div>
                            </div>

                            <br>
                            <button type="submit" class="btn btn-primary">Save Product</button>
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