<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use DB;

class ProfileController extends Controller
{

    public function index()
    {
        return view('admin.profile.index');
        
    }

    public function uploadPhoto(Request $request)
    {
        
        // $request->validate(['photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048']);

        $folder = public_path('uploads/users');
        if (!file_exists($folder)) {
            mkdir($folder, 0777, true);
        }

        $file = $request->file('photo');
        // dd($file);
        $filename = time() . '.' . $file->getClientOriginalExtension();
        $file->move($folder, $filename);

        DB::table('users')->where('id', auth()->user()->id)->update(['photo' => $filename]);

        return json_encode(['status' => 'success', 'photo_url' => asset('uploads/users/' . $filename)]);
    }

    public function update(Request $request)
    {
        
        if(DB::table('users')->where('email', $request->email)->where('id', '!=', auth()->user()->id)->exists()){
            return json_encode(['status' => 'error', 'message' => 'Email already exists.']);
        }
        $data = request()->only(['name', 'email', 'phone', 'dob', 'gender']);
        DB::table('users')->where('id', auth()->user()->id)->update($data);
        return json_encode(['status' => 'success']);
    }

    public function updatePassword(Request $request)
    {
        $current_password = $request->input('current_password');
        $new_password = $request->input('new_password');

        $user = DB::table('users')->where('id', auth()->user()->id)->first();

        if (!password_verify($current_password, $user->password)) {
            return json_encode(['status' => 'error', 'message' => 'Current password is incorrect.']);
        }

        $hashed_new_password = password_hash($new_password, PASSWORD_BCRYPT);
        DB::table('users')->where('id', auth()->user()->id)->update(['password' => $hashed_new_password]);

        return json_encode(['status' => 'success']);
    }

    public function logout(){
        auth()->logout();
        return redirect('/admin');
    }
}
