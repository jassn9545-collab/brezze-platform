<nav class="navbar navbar-fixed-top">
    <div class="container-fluid">
        <div class="navbar-brand">
            <div class="logo-sec">
                <button type="button" class="btn-toggle-offcanvas"><i class="fa fa-bars"></i></button>
                <button type="button" class="btn-toggle-fullwidth"><i class="fa fa-bars"></i></button>
            </div>
        </div>
        
        <div class="navbar-right">
            <form id="navbar-search" class="navbar-form search-form">
                <input class="form-control" placeholder="Search here..." type="text">
                <button type="button" class="btn btn-default"><i class="fa fa-search"></i></button>
            </form>                

            <div id="navbar-menu">
                <ul class="nav navbar-nav">
                    <li class="dropdown">
                        <a href="javascript:void(0);" class="dropdown-toggle icon-menu" data-toggle="dropdown">
                            <i class="fa fa-bell"></i>
                            <span class="notification-dot"></span>
                        </a>
                        <!-- Notifications dropdown can also be moved to a partial -->
                        @include('admin.partials.notifications')
                    </li>
                    <li>
                        <a href="{{ route('admin.logout') }}" class="icon-menu" onclick="return confirm('Are you sure you want to logout?');"><i class="fa fa-power-off"></i></a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</nav>
