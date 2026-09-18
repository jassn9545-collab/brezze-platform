@extends('admin.layouts.admin')

@section('title', 'Edit Product')

@section('content')
<style>
#imagePreview {
    display: none;
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
.existing-images img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    margin: 5px;
    border-radius: 6px;
    border: 1px solid #ddd;
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
        <div class="col-lg-6">
            <h2 class="user-name">Edit Product</h2>
            <ul class="breadcrumb">
                <li class="breadcrumb-item">
                    <a href="{{ route('admin.dashboard') }}">
                        <i class="fa fa-dashboard"></i>
                    </a>
                </li>
                <li class="breadcrumb-item active">Edit Product</li>
            </ul>
        </div>
        <div class="col-lg-6">
            <div class="d-flex flex-row-reverse">
                <a class="btn btn-create" href="{{ route('admin.product.index') }}">
                    <i class="fa fa-arrow-left"></i> Back
                </a>
            </div>
        </div>
    </div>
</div>

<div class="row clearfix">
    <div class="col-lg-12">
        <div class="card">
            <div class="body">
                <form action="{{ route('admin.product.update', $product->id) }}" method="POST" enctype="multipart/form-data">
                    @csrf

                    <input type="hidden" name="slug" value="{{ $product->slug }}">

                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Product Title</label>
                                <input type="text" class="form-control" name="title"
                                    value="{{ old('title', $product->title) }}" required>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Type</label>
                                <select class="form-control" name="type" required>
                                    <option value="gold" {{ $product->type == 'gold' ? 'selected' : '' }}>Gold</option>
                                    <option value="silver" {{ $product->type == 'silver' ? 'selected' : '' }}>Silver</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Carat</label>
                                <select class="form-control" name="carat">
                                    <option value="24ct" {{ $product->carat == '24ct' ? 'selected' : '' }}>24 CT</option>
                                    <option value="22ct" {{ $product->carat == '22ct' ? 'selected' : '' }}>22 CT</option>
                                    <option value="18ct" {{ $product->carat == '18ct' ? 'selected' : '' }}>18 CT</option>
                                </select>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Weight (grams)</label>
                                <input type="number" step="0.001" class="form-control"
                                    name="weight" value="{{ old('weight', $product->weight) }}">
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Price</label>
                                <input type="number" step="0.01" class="form-control"
                                    name="price" value="{{ old('price', $product->price) }}">
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Add More Images</label>
                                <input type="file" class="form-control" name="images[]" multiple onchange="previewImages(this)">
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Category</label>
                                <select class="form-control" name="category_id">
                                    <option value="">Select Category</option>
                                    @foreach($categories as $category)
                                        <option value="{{ $category->id }}"
                                            {{ $product->category_id == $category->id ? 'selected' : '' }}>
                                            {{ $category->name }}
                                        </option>
                                    @endforeach
                                </select>
                            </div>
                        </div>
                    </div>

                    {{-- Existing Images --}}
                    @if($product->images->count())
                    <style>
                    .existing-images .img-wrap {
                        position: relative;
                        display: inline-block;
                    }
                    .existing-images .img-wrap img {
                        display: block;
                    }
                    .existing-images .img-wrap .del-btn {
                        position: absolute;
                        top: 6px;
                        right: 6px;
                        background: rgba(0,0,0,0.6);
                        color: #fff;
                        border: none;
                        border-radius: 50%;
                        width: 26px;
                        height: 26px;
                        line-height: 24px;
                        text-align: center;
                        cursor: pointer;
                        font-weight: bold;
                    }
                    </style>

                    @push('scripts')
                    <script>
                    document.addEventListener('DOMContentLoaded', function () {
                        // IDs of images in the same order as the displayed <img> tags
                        const imageIds = @json($product->images->pluck('id')->values());
                        const csrfToken = @json(csrf_token());
                        const deleteBaseUrl = @json(url('admin/product/image-delete')); // will call DELETE /admin/product/image/{id}

                        const container = document.querySelector('.existing-images');
                        if (!container) return;

                        const imgs = Array.from(container.querySelectorAll('img'));

                        imgs.forEach((img, idx) => {
                            const id = imageIds[idx];
                            if (!id) return;

                            // wrap img
                            const wrap = document.createElement('div');
                            wrap.className = 'img-wrap';
                            img.parentNode.insertBefore(wrap, img);
                            wrap.appendChild(img);

                            // add delete button
                            const btn = document.createElement('button');
                            btn.type = 'button';
                            btn.className = 'del-btn';
                            btn.title = 'Delete image';
                            btn.innerHTML = '&times;';
                            btn.dataset.id = id;
                            wrap.appendChild(btn);

                            btn.addEventListener('click', function () {
                                if (!confirm('Are you sure you want to delete this image?')) return;

                                const imageId = this.dataset.id;
                                fetch(`${deleteBaseUrl}/${imageId}`, {
                                    method: 'DELETE',
                                    headers: {
                                        'X-CSRF-TOKEN': csrfToken,
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/json'
                                    },
                                    credentials: 'same-origin'
                                })
                                .then(response => {
                                    if (response.ok) return response.json().catch(()=>({}));
                                    return response.json().then(err => Promise.reject(err));
                                })
                                .then(data => {
                                    // remove from DOM
                                    wrap.remove();
                                })
                                .catch(err => {
                                    console.error(err);
                                    alert((err && err.message) || 'Failed to delete image. Please try again.');
                                });
                            });
                        });
                    });
                    </script>
                    @endpush
                        <div class="row">
                            <div class="col-md-12">
                                <label>Existing Images</label>
                                <div class="existing-images">
                                    @foreach($product->images as $img)
                                        <img src="{{ asset('public/'.$img->image) }}">
                                    @endforeach
                                </div>
                            </div>
                        </div>
                    @endif

                    {{-- New Preview --}}
                    <div class="row">
                        <div class="col-md-12">
                            <div id="imagePreview"></div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-12">
                            <div class="form-group">
                                <label>Description</label>
                                <textarea class="form-control summernote" name="description">
                                    {{ old('description', $product->description) }}
                                </textarea>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-12">
                            <div class="form-group">
                                <label>Specification</label>
                                <textarea class="form-control summernote" name="specification">
                                    {{ old('specification', $product->specification) }}
                                </textarea>
                            </div>
                        </div>
                    </div>

                    <br>
                    <button type="submit" class="btn btn-primary">Update Product</button>
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

    if (!input.files.length) {
        preview.classList.remove('active');
        return;
    }

    preview.classList.add('active');

    Array.from(input.files).forEach(file => {
        let reader = new FileReader();
        reader.onload = e => {
            let img = document.createElement('img');
            img.src = e.target.result;
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}
</script>
@endpush