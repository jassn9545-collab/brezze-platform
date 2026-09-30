<div id="left-sidebar" class="sidebar">
    <button type="button" class="btn-toggle-offcanvas"><i class="fa fa-arrow-left"></i></button>
    <div class="sidebar-scroll">
        <div class="user-account">
            <img src="{{ asset('uploads/users/' . Auth::user()->photo) }}" class="rounded-circle user-photo" alt="User Profile Picture" width="50" height="50">
            <div class="dropdown">
                <span>Welcome,</span>
                <a href="javascript:void(0);" class="dropdown-toggle user-name" data-toggle="dropdown">
                    <strong>{{ auth()->user()->name ?? 'User' }}</strong>
                </a>
                <ul class="dropdown-menu dropdown-menu-right account">
                    <li><a href="{{ url('admin/profile') }}"><i class="fa fa-user"></i> My Profile</a></li>
                    
                    <li><a href="{{ url('admin/logout') }}"><i class="fa fa-sign-out"></i> Logout</a></li>
                </ul>
            </div>
            
        </div>
        <!-- Sidebar Menu -->
        @include('admin.partials.sidebar-menu')
    </div>
</div>
