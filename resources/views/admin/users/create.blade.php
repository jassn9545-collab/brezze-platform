@extends('admin.layouts.admin')

@section('title', 'Dashboard')

@section('content')
<div class="block-header">
                <div class="row">
                    <div class="col-lg-6 col-md-6 col-sm-12">
                        <h2 class="user-name">Users</h2>
                        <ul class="breadcrumb">
                            <li class="breadcrumb-item"><a href="{{ route('admin.dashboard') }}"><i class="fa fa-dashboard"></i></a></li>                            
                            <li class="breadcrumb-item active">New Users</li>
                        </ul>
                    </div>
                    <div class="col-lg-6 col-md-6 col-sm-12">
                        <div class="d-flex flex-row-reverse">
                            <div class="page_action">
                                <a class="btn btn-create" href="{{ route('admin.users.index') }}"><i class="fa fa-arrow-left"></i> Back</a>
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
                            <form action="{{ route('admin.users.store') }}"
                                    method="POST"
                                    enctype="multipart/form-data">
                                    @csrf
                                    <input type="hidden" name="user_type" value="freelancer">
                                    {{-- ================= Personal Info ================= --}}
                                    <h5 class="mb-3"><b>Personal Information</b></h5>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>Full Name *</label>
                                                <input type="text" class="form-control" name="full_name" required>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>Email *</label>
                                                <input type="email" class="form-control" name="email" required>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>Phone *</label>
                                                <input type="text" class="form-control" name="phone" required>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>Password *</label>
                                                <input type="password" class="form-control" name="password" required>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>Date of Birth</label>
                                                <input type="date" class="form-control" name="dob">
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>Profile Photo</label>
                                                <input type="file" class="form-control" name="image">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>Gender</label>
                                                <select name="gender" class="form-control">
                                                <option value="">Select</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <hr>
                                    {{-- ================= Professional Info ================= --}}
                                    <h5 class="mb-3"><b>Professional Information</b></h5>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>Skills (Comma separated)</label>
                                                <input type="text"
                                                class="form-control"
                                                name="skills"
                                                placeholder="PHP, Laravel, React">
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>Experience (Years)</label>
                                                <input type="number"
                                                class="form-control"
                                                name="experience_years">
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>Hourly Rate (₹/hr)</label>
                                                <input type="number"
                                                class="form-control"
                                                name="hourly_rate">
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>Category</label>
                                                <select name="category" class="form-control">
                                                <option value="">Select</option>
                                                <option>Web Developer</option>
                                                <option>Designer</option>
                                                <option>SEO</option>
                                                <option>Content Writer</option>
                                                <option>App Developer</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>Portfolio URL</label>
                                                <input type="url"
                                                class="form-control"
                                                name="portfolio_url">
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>LinkedIn Profile</label>
                                                <input type="url"
                                                class="form-control"
                                                name="linkedin_url">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>Resume (PDF)</label>
                                                <input type="file"
                                                class="form-control"
                                                name="resume"
                                                accept="application/pdf">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-12">
                                            <div class="form-group">
                                                <label>Bio / About Freelancer</label>
                                                <textarea name="bio"
                                                class="form-control"
                                                rows="4"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                    <hr>
                                    {{-- ================= Address ================= --}}
                                    <h5 class="mb-3"><b>Address Information</b></h5>
                                    <div class="row">
                                        <div class="col-md-4">
                                            <div class="form-group">
                                                <label>Country</label>
                                                <input type="text" class="form-control" name="country">
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="form-group">
                                                <label>City</label>
                                                <input type="text" class="form-control" name="city">
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="form-group">
                                                <label>Zip Code</label>
                                                <input type="text" class="form-control" name="zipcode">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-12">
                                            <div class="form-group">
                                                <label>Full Address</label>
                                                <textarea name="address"
                                                class="form-control"
                                                rows="2"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                    <hr>
                                    {{-- ================= Account Settings ================= --}}
                                    <h5 class="mb-3"><b>Account Settings</b></h5>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>Status</label>
                                                <select name="account_status" class="form-control">
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                                <option value="suspended">Suspended</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>Verified</label>
                                                <select name="is_verified" class="form-control">
                                                <option value="0">No</option>
                                                <option value="1">Yes</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <hr>
                                    <button type="submit" class="btn btn-primary btn-lg">
                                    Save Freelancer
                                    </button>
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