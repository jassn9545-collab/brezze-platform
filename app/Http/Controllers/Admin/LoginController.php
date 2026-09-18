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

        if (auth()->attempt($credentials)) {
            return json_encode(['status' => 'success', 'message' => 'Login successful']);
        }else{
            return json_encode(['status' => 'error', 'message' => 'Invalid credentials']);
        }

        
    }

    public function logout()
    {
        auth()->logout();
        return redirect('/admin/login');
    }
}