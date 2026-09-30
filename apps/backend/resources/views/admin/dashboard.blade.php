@extends('admin.layouts.admin')

@section('title', 'Dashboard')

@section('content')
<div class="block-header">
    <div class="row">
        <div class="col-lg-6 col-md-6 col-sm-12">
            <h2 class="user-name">Welcome {{ Auth::user()->name }}</h2>
            <ul class="breadcrumb">
                <li class="breadcrumb-item active "><a href="{{ url('/admin/dashboard') }}"><i class="fa fa-dashboard"></i></a></li>
                <li class="breadcrumb-item">Dashboard</li>
            </ul>
        </div>
        <div class="col-lg-6 col-md-6 col-sm-12">
            <div class="d-flex flex-row-reverse">
                <div class="page_action">
                    <!-- <button type="button" class="btn btn-primary"><i class="fa fa-download"></i> Download report</button> -->
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row clearfix dashboard-card-sec">
                <div class="col-lg-3 col-md-6 col-sm-6">
                    <div class="card text-center dashboard-card">
                        <div class="body">
                            <div class="p-15 text-light">
                                <h3>521</h3>
                                <span>Total Freelancer</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6 col-sm-6">
                    <div class="card text-center dashboard-card">
                        <div class="body">
                            <div class="p-15 text-light">
                                <h3>902</h3>
                                <span>Total Client</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6 col-sm-6">
                    <div class="card text-center dashboard-card">
                        <div class="body">
                            <div class="p-15 text-light">
                                <h3>1,025</h3>
                                <span>Total Jobs</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6 col-sm-6">
                    <div class="card text-center dashboard-card">
                        <div class="body">
                            <div class="p-15 text-light">
                                <h3>318</h3>
                                <span>Total Category</span>
                            </div>
                        </div>
                    </div>
                </div> 
                <div class="col-lg-3 col-md-6 col-sm-6">
                    <div class="card text-center dashboard-card">
                        <div class="body">
                            <div class="p-15 text-light">
                                <h3>318</h3>
                                <span>Completed Jobs</span>
                            </div>
                        </div>
                    </div>
                </div> 
                <div class="col-lg-3 col-md-6 col-sm-6">
                    <div class="card text-center dashboard-card">
                        <div class="body">
                            <div class="p-15 text-light">
                                <h3>318</h3>
                                <span>Assigned Jobs</span>
                            </div>
                        </div>
                    </div>
                </div>  
                <div class="col-lg-3 col-md-6 col-sm-6">
                    <div class="card text-center dashboard-card">
                        <div class="body">
                            <div class="p-15 text-light">
                                <h3>318</h3>
                                <span>Unassigned Jobs</span>
                            </div>
                        </div>
                    </div>
                </div>              
            </div>  
@endsection
