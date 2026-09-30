<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\UserProfile;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{

/* ================================
   LIST PAGE
================================ */

public function index()
{
    return view('admin.users.index');
}


/* ================================
   AJAX DATA
================================ */

public function getUsers(Request $request)
{
    // DataTables parameters
    $draw   = $request->draw;
    $start  = $request->start;
    $length = $request->length;

    $search = $request->search['value'];

    $orderColumnIndex = $request->order[0]['column'];
    $orderDirection   = $request->order[0]['dir'];

    $columns = [
        'full_name',
        'user_type',
        'email',
        'profile_photo',
        'account_status'
    ];

    $orderColumn = $columns[$orderColumnIndex];


    // Base Query
    $query = UserProfile::query();


    /* =====================
       Filters
    ====================== */

    if ($request->user_type) {
        $query->where('user_type', $request->user_type);
    }

    if ($request->status) {
        $query->where('account_status', $request->status);
    }


    /* =====================
       Search
    ====================== */

    if ($search) {

        $query->where(function ($q) use ($search) {

            $q->where('full_name', 'like', "%$search%")
              ->orWhere('email', 'like', "%$search%")
              ->orWhere('phone', 'like', "%$search%");
        });
    }


    /* =====================
       Total Records
    ====================== */

    $totalRecords = UserProfile::count();

    $filteredRecords = $query->count();


    /* =====================
       Pagination + Order
    ====================== */

    $users = $query

        ->orderBy($orderColumn, $orderDirection)

        ->skip($start)
        ->take($length)

        ->get();


    /* =====================
       Format Data
    ====================== */

    $data = [];

    foreach ($users as $user) {

        $photo = $user->profile_photo
            ? '<img src="'.asset($user->profile_photo).'" width="40">'
            : '-';

        $action = '
        <a href="'.route('users.edit',$user->id).'" 
           class="btn btn-sm btn-info">Edit</a>

        <a href="'.route('users.destroy',$user->id).'"
           onclick="return confirm(\'Delete?\')"
           class="btn btn-sm btn-danger">Delete</a>
        ';


        $data[] = [

            'full_name'      => $user->full_name,
            'user_type'      => ucfirst($user->user_type),
            'email'          => $user->email,
            'photo'          => $photo,
            'account_status' => ucfirst($user->account_status),
            'action'         => $action
        ];
    }


    /* =====================
       Response
    ====================== */

    return response()->json([

        "draw"            => intval($draw),
        "recordsTotal"    => $totalRecords,
        "recordsFiltered" => $filteredRecords,
        "data"            => $data
    ]);
}


/* ================================
   CREATE
================================ */

public function create()
{
    return view('admin.users.create');
}


/* ================================
   STORE
================================ */

public function store(Request $request)
{
    $request->validate([

        'full_name'=>'required',
        'email'=>'required|unique:user_profiles',
        'password'=>'required|min:6',
        'user_type'=>'required'
    ]);

    $data = $request->all();

    $data['password'] = Hash::make($request->password);

    if($request->hasFile('profile_photo')){

        $file = $request->file('profile_photo');
        $name = time().'.'.$file->getClientOriginalExtension();

        $file->move('uploads/users',$name);

        $data['profile_photo'] = 'uploads/users/'.$name;
    }

    if($request->skills){
        $data['skills'] = explode(',',$request->skills);
    }

    UserProfile::create($data);

    return redirect()->route('users.index')
    ->with('success','User Created');
}


/* ================================
   EDIT
================================ */

public function edit($id)
{
    $user = UserProfile::findOrFail($id);

    return view('admin.users.edit',compact('user'));
}


/* ================================
   UPDATE
================================ */

public function update(Request $request,$id)
{
    $user = UserProfile::findOrFail($id);

    $data = $request->all();

    if($request->password){
        $data['password'] = Hash::make($request->password);
    }else{
        unset($data['password']);
    }

    if($request->hasFile('profile_photo')){

        $file = $request->file('profile_photo');
        $name = time().'.'.$file->getClientOriginalExtension();

        $file->move('uploads/users',$name);

        $data['profile_photo'] = 'uploads/users/'.$name;
    }

    if($request->skills){
        $data['skills'] = explode(',',$request->skills);
    }

    $user->update($data);

    return redirect()->back()->with('success','Updated');
}


/* ================================
   DELETE
================================ */

public function destroy($id)
{
    UserProfile::find($id)->delete();

    return redirect()->back()->with('success','Deleted');
}

}