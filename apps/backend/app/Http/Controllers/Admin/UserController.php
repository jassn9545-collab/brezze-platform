<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{

    public function index()
    {
        return view('admin.users.index');
    }

    public function user_list(Request $request){
        $search  = $request->input('search.value');
        $start   = $request->input('start', 0);
        $length  = $request->input('length', 10);
        $draw    = $request->input('draw');
        $user_type = $request->input('user_type');

        $query = DB::table('users');
        if($user_type){
                $query->where('user_type', $user_type);
        }

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $totalrows = $query->count();

        $data = $query
            ->orderBy('id', 'desc')
            ->offset($start)
            ->limit($length)
            ->get();

        $final = [];

        foreach ($data as $row) {
            $profile = DB::table('user_proofs')->select('is_verified')->where('user_id', $row->id)->first();
            $status = '<select class="form-control form-control-sm user-status" data-id="'.$row->id.'">
                        <option value="0" '.($profile && $profile->is_verified == 0 ? 'selected' : '').'>Pending</option>
                        <option value="1" '.($profile && $profile->is_verified == 1 ? 'selected' : '').'>Verified</option>
                        <option value="2" '.($profile && $profile->is_verified == 2 ? 'selected' : '').'>Rejected</option>
                    </select>';
            $featured = $row->user_type === 'freelancer'
                ? '<input type="checkbox" class="user-featured" data-id="'.$row->id.'" '.($row->is_featured ? 'checked' : '').' aria-label="Show '.e($row->name).' on home screen">'
                : '<span class="text-muted">&mdash;</span>';
            $final[] = [
                "DT_RowId" => $row->id,
                $row->name,
                $row->email,
                $row->phone,
                $status,
                $featured,
                ($row->profile_image)
                ? '<img src="'.asset('public/'.$row->profile_image).'" width="50" height="50" />'
                : '<img src="https://ui-avatars.com/api/?name='.urlencode($row->name).'&background=0063b7&size=128&rounded=true&color=fff&length=1" width="50" height="50" />',
                date('M d, Y', strtotime($row->created_at)),
                '<div class="btn-group">
                    <a href="'.url("admin/users/".$row->id).'" class="btn btn-warning"><i class="fa fa-eye"></i></a>
                    <a href="'.url("admin/users/delete/".$row->id).'" class="btn btn-danger"><i class="fa fa-trash"></i></a>
                </div>'
            ];
        }

        return response()->json([
            "draw"            => intval($draw),
            "recordsTotal"    => $totalrows,
            "recordsFiltered" => $totalrows,
            "data"            => $final
        ]);
    }

    public function create()
    {
        return view('admin.users.create');
    }

    public function show($id)
    {
        $user = DB::table('users')->where('id', $id)->first();
        return view('admin.users.show', compact('user'));
    }

    public function update_status(Request $request, $id)
    {
        $status = $request->input('status');
        DB::table('user_proofs')->where('user_id', $id)->update(['is_verified' => $status]);
        return response()->json(['status' => true]);
    }

    public function update_featured(Request $request, $id)
    {
        $request->validate([
            'featured' => 'required|boolean',
        ]);

        $user = User::query()
            ->where('user_type', 'freelancer')
            ->findOrFail($id);
        $featured = $request->boolean('featured');

        if ($featured && !$user->is_featured) {
            $featuredCount = User::query()
                ->where('user_type', 'freelancer')
                ->where('is_featured', true)
                ->count();

            if ($featuredCount >= 3) {
                return response()->json([
                    'status' => false,
                    'message' => 'Only 3 professionals can be featured on the home screen.',
                ], 422);
            }
        }

        $user->update(['is_featured' => $featured]);

        return response()->json([
            'status' => true,
            'message' => $featured
                ? 'Professional added to the home screen.'
                : 'Professional removed from the home screen.',
        ]);
    }

    public function store(Request $request)
    {
        $inputs = $request->all();
        // dd($inputs);
        unset($inputs['_token']);
        $inputs['is_verified'] = 1;
        $inputs['password'] = Hash::make($request->password); // Default password
        if($request->hasFile('image')){
            $file = $request->file('image');
            $filename = time().'_'.$file->getClientOriginalName();
            $file->move(public_path('uploads/user/'), $filename);
            $inputs['profile_photo'] = $filename;
        }
        $save = DB::table('user_profiles')->insert($inputs);
        return redirect()->route('admin.users.index');
    }

    public function edit($id)
    {
        return view('admin.users.edit', compact('id'));
    }

    public function update(Request $request, $id)
    {
        $inputs = $request->all();
        $user = DB::table('users')->where('id', $id)->first();
        unset($inputs['_token']);
        if($request->hasFile('profile')){
            @unlink(public_path('uploads/user/'.$user->profile));
            $file = $request->file('profile');
            $filename = time().'_'.$file->getClientOriginalName();
            $file->move(public_path('uploads/user/'), $filename);
            $inputs['profile'] = $filename;
        }
        $update = DB::table('users')->where('id', $id)->update($inputs);
        // Handle user update logic here
        return redirect()->back()->with('toastr', [
                'type' => 'success',
                'message' => 'User updated successfully.'
            ]);
    }

    public function delete($id)
    {
        $user = DB::table('users')->where('id', $id)->first();
        if($user){
            @unlink(public_path('uploads/user/'.$user->profile));
            DB::table('users')->where('id', $id)->delete();
        }
        return redirect()->back()->with('toastr', [
            'type' => 'success',
            'message' => 'User deleted successfully.'
        ]);
    }


}
