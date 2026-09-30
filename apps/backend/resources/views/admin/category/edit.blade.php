@extends('admin.layouts.admin')

@section('title', 'Dashboard')

@section('content')
<div class="block-header">
                <div class="row">
                    <div class="col-lg-6 col-md-6 col-sm-12">
                        <h2 class="user-name">Edit Category</h2>
                        <ul class="breadcrumb">
                            <li class="breadcrumb-item"><a href="{{ route('admin.dashboard') }}"><i class="fa fa-dashboard"></i></a></li>                            
                            <li class="breadcrumb-item active">Edit Category</li>
                        </ul>
                    </div>
                    <div class="col-lg-6 col-md-6 col-sm-12">
                        <div class="d-flex flex-row-reverse">
                            <div class="page_action">
                                <a class="btn btn-create" href="{{ route('admin.category.index') }}"><i class="fa fa-arrow-left"></i> Back</a>
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
                            <form action="{{ route('admin.category.update', $category->id) }}" method="POST" enctype="multipart/form-data">
                            @csrf
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>Category Name <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" required="" name="name" value="{{ isset($category) ? $category->name : '' }}">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <div class="image-preview mb-2">
                                            @if(isset($category) && $category->photo)
                                                <img src="{{ asset('uploads/category/'.$category->photo) }}" alt="Category Photo" width="100" height="100">
                                            @endif

                                        </div>
                                        <label>Category Photo <span class="text-danger">*</span></label>
                                        <input type="file" class="form-control" name="photo" accept="image/*">
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
    
</script>
@endpush
