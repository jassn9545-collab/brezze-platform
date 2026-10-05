<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Mail;
use DB;
use App\Models\Product;
use App\Traits\ApiResponse;

class HomeController extends Controller
{
    use ApiResponse;
    public function homeData(Request $request)
    {
        $data['categories'] = DB::table('categories')->limit(4)->orderBy('id', 'asc')->get();
        $data['products'] = DB::table('products')->where('is_featured', 1)->limit(10)->orderBy('id', 'asc')->get();
        $settings = DB::table('settings')->get();
        $data['gold_price'] = $settings->where('key', 'gold_price')->first()->value;
        $data['silver_price'] = $settings->where('key', 'silver_price')->first()->value;

        return response()->json(['status'  => 'success','message' => 'Home data fetched successfully.','data' => $data], 200);
    }


    public function allCategories(Request $request)
    {
        $categories = DB::table('categories')->orderBy('id', 'asc')->get();
        if(!$categories){
            return response()->json(['status'  => 'failed','message' => 'No categories found.'], 404);
        }
        return response()->json(['status'  => 'success','message' => 'Categories fetched successfully.','data' => $categories], 200);
    }

    public function productsByCategory(Request $request, $id)
    {
        $products = Product::with('images')->where('category_id', $id)->orderBy('id', 'desc')->get();
        if(!$products){
            return response()->json(['status'  => 'failed','message' => 'No products found in this category.'], 404);
        }
        return response()->json(['status'  => 'success','message' => 'Products fetched successfully.','data' => $products,'image_base_url'=>url('/')], 200);
    }

    public function productDetails(Request $request, $id)
    {
        $product = Product::with('images')->where('id', $id)->first();
        if(!$product){
            return response()->json(['status'  => 'failed','message' => 'Product not found.'], 404);
        }
        return response()->json(['status'  => 'success','message' => 'Product details fetched successfully.','data' => $product,'image_base_url'=>url('/')], 200);
    }

    public function updatePassword(Request $request)
    {
        $user = auth()->user();

        $validator = \Validator::make($request->all(), [
            'current_password' => 'required',
            'new_password' => 'required|min:6|confirmed',
            'new_password_confirmation' => 'required|min:6'
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 400, $validator->errors());
        }

        if (!Hash::check($request->current_password, $user->password)) {
            return $this->error('Current password is incorrect.', 400);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return $this->success([], 'Password updated successfully.');
    }




}
