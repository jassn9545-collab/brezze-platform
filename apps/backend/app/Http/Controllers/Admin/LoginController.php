<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LoginController extends Controller
{
    public function index()
    {
        if (auth()->check()) {
            return redirect()->to('admin/dashboard');
        }
        return view('admin.login');
    }

    public function admin_login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $credentials['user_type'] = 'admin';

        if (auth()->attempt($credentials)) {
            $request->session()->regenerate();

            return response()->json(['status' => 'success', 'message' => 'Login successful']);
        }

        return response()->json(['status' => 'error', 'message' => 'Invalid credentials'], 401);
    }

    public function logout()
    {
        auth()->logout();
        return redirect('/admin/login');
    }
}
