<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Models\Project;
use Illuminate\Support\Str;


class JobController extends Controller
{

    public function index()
    {
        return view('admin.job.index');
    }

    public function create()
    {
        $data['categories'] = DB::table('categories')->get();
        return view('admin.product.create', $data);
    }

    public function store(Request $request){
        $validator = Validator::make($request->all(), [
            'title' => 'required',
            'price' => 'required',
            'weight' => 'required',
            'type' => 'required',
            'images.*' => 'image|mimes:jpg,jpeg,png,webp'
        ]);
        // if validation fails, redirect back with errors and show toastr error notification
        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput()
                ->with('toastr', [
                    'type' => 'error',
                    'message' => 'Please correct the highlighted errors and try again.'
                ]);
        }
        // dd($request->all());
        $product = Product::create([
            'title' => $request->title,
            'slug' => Str::slug($request->title),
            'type' => $request->type,
            'carat' => $request->carat,
            'price' => $request->price,
            'weight' => $request->weight,
            'description' => $request->description,
            'specification' => $request->specification,
        ]);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $extension = $image->getClientOriginalExtension();
                $filename = time() . rand(1000, 9999) . '.' . $extension;

                $image->move(public_path('uploads/products'), $filename);

                $product->images()->create([
                    'image' => 'uploads/products/' . $filename
                ]);
            }
        }

        return redirect()->route('admin.product.index')->with('toastr', [
            'type' => 'success',
            'message' => 'Product created successfully.'
        ]);
    }

    public function job_list(Request $request){
        $search  = $request->input('search.value');
        $start   = $request->input('start', 0);
        $length  = $request->input('length', 10);
        $draw    = $request->input('draw');

        $query = Project::with('client')->select('id', 'title', 'slug', 'budget', 'created_at','status','user_id');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
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
                $row->title,
                $row->budget,
                $row->status,
                '<a href="'.route('admin.users.show', $row->client->id).'" target="_blank">'.$row->client->name.'</a>',
                date('M d, Y', strtotime($row->created_at)),
                '<div class="btn-group">
                    <a href="'.url("admin/project/view/".$row->id).'" class="btn btn-warning"><i class="fa fa-eye"></i></a>
                    <a href="'.url("admin/project/delete/".$row->id).'" class="btn btn-danger"><i class="fa fa-trash"></i></a>
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

    public function edit($id)
    {
        $data['product'] = Product::with('images')->findOrFail($id);
        $data['categories'] = DB::table('categories')->get();
        return view('admin.product.edit', $data);
    }

    public function deleteImage(Request $request, $id)
    {
        $image = DB::table('product_images')->where('id', $id)->first();
        if ($image) {
            // Delete the image file from storage
            if (file_exists(public_path($image->image))) {
                @unlink(public_path($image->image));
            }
            // Delete the database record
            DB::table('product_images')->where('id', $id)->delete();

            return response()->json(['success' => true, 'message' => 'Image deleted successfully.']);
        } else {
            return response()->json(['success' => false, 'message' => 'Image not found.'], 404);
        }
    }

    // update
    public function update(Request $request, $id){
        $product = Product::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'required',
            'price' => 'required|numeric',
            'weight' => 'required|numeric',
            'type' => 'required',
            'images.*' => 'image|mimes:jpg,jpeg,png,webp'
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput()
                ->with('toastr', [
                    'type' => 'error',
                    'message' => 'Please correct the highlighted errors and try again.'
                ]);
        }

        // Update product fields
        $product->update([
            'title' => $request->title,
            'type' => $request->type,
            'carat' => $request->carat,
            'price' => $request->price,
            'weight' => $request->weight,
            'description' => $request->description,
            'specification' => $request->specification,
            'category_id' => $request->category_id,
        ]);

        // Optional: update slug only if title changed
        if ($product->isDirty('title')) {
            $product->slug = Str::slug($request->title);
            $product->save();
        }

        // Handle new images (append)
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {

                $extension = $image->getClientOriginalExtension();
                $filename = time() . rand(1000, 9999) . '.' . $extension;

                $image->move(public_path('uploads/products'), $filename);

                $product->images()->create([
                    'image' => 'uploads/products/' . $filename
                ]);
            }
        }

        return redirect()->route('admin.product.index')->with('toastr', [
            'type' => 'success',
            'message' => 'Product updated successfully.'
        ]);
    }

    // delete
    public function delete($id)
    {
        $product = Product::with('images')->findOrFail($id);

        // Delete image files from public folder
        if ($product->images->count()) {
            foreach ($product->images as $img) {
                $filePath = public_path($img->image);

                if (file_exists($filePath)) {
                    unlink($filePath);
                }
            }
        }

        // Delete product (images will be deleted via FK or manually)
        $product->delete();

        return redirect()->route('admin.product.index')->with('toastr', [
            'type' => 'success',
            'message' => 'Product deleted successfully.'
        ]);
    }

}