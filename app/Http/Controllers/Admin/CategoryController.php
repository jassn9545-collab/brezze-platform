<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{

    public function index()
    {
        return view('admin.category.index');
    }

    public function category_list(Request $request){
        $search  = $request->input('search.value');
        $start   = $request->input('start', 0);
        $length  = $request->input('length', 10);
        $draw    = $request->input('draw');

        $query = DB::table('categories');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                ->orWhere('slug', 'like', "%{$search}%");
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
            $final[] = [
                "DT_RowId" => $row->id,
                $row->name,
                $row->slug,
                '<img src="'.asset('uploads/category/'.$row->photo).'" width="50" height="50"/>',
                date('M d, Y', strtotime($row->created_at)),
                '<div class="btn-group">
                    <a href="'.url("admin/category/edit/".$row->id).'" class="btn btn-warning"><i class="fa fa-edit"></i></a>
                    <a href="'.url("admin/category/delete/".$row->id).'" class="btn btn-danger"><i class="fa fa-trash"></i></a>
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
        return view('admin.category.create');
    }

    public function store(Request $request)
    {
        $inputs = $request->all();
        $inputs['slug'] = strtolower(str_replace(' ', '-', $inputs['name']));
        unset($inputs['_token']);

        if($request->hasFile('photo')){
            $file = $request->file('photo');
            $filename = time().'_'.$file->getClientOriginalName();
            $file->move(public_path('uploads/category/'), $filename);
            $inputs['photo'] = $filename;
        } else {
            $inputs['photo'] = null;
        }
        $save = DB::table('categories')->insert($inputs);
        return redirect()->route('admin.category.index')->with('toastr', [
                'type' => 'success',
                'message' => 'Category created successfully.'
            ]);
    }

    public function edit($id)
    {
        $category = DB::table('categories')->where('id', $id)->first();
        return view('admin.category.edit', compact('category'));
    }

    public function update(Request $request, $id)
    {
        $inputs = $request->all();
        $category = DB::table('categories')->where('id', $id)->first();
        $inputs['slug'] = strtolower(str_replace(' ', '-', $inputs['name']));
        unset($inputs['_token']);
        if($request->hasFile('photo')){
            @unlink(public_path('uploads/category/'.$category->photo));
            $file = $request->file('photo');
            $filename = time().'_'.$file->getClientOriginalName();
            $file->move(public_path('uploads/category/'), $filename);
            $inputs['photo'] = $filename;
        }
        $update = DB::table('categories')->where('id', $id)->update($inputs);
        // Handle category update logic here
        return redirect()->route('admin.category.index')->with('toastr', [
                'type' => 'success',
                'message' => 'Category updated successfully.'
            ]);
    }

    public function delete($id)
    {
        $category = DB::table('categories')->where('id', $id)->first();
        if($category){
            @unlink(public_path('uploads/category/'.$category->photo));
            DB::table('categories')->where('id', $id)->delete();
        }
        return redirect()->route('admin.category.index')->with('toastr', [
                'type' => 'success',
                'message' => 'Category deleted successfully.'
            ]);
    }
       


}
