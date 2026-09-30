<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Mail;
use DB;
class HomeController extends Controller
{

    public function update_price()
    {
        $response = file_get_contents("https://api.metalpriceapi.com/v1/latest?api_key=3ca429ce18af4f488b2fc3a5aa466e9d&base=INR&currencies=XAU,XAG");
        $data = json_decode($response, true);
        $pricePerOunce = $data['rates']['INRXAU'];
        $pricePerOunceSilver = $data['rates']['INRXAG'];
        $gold_price = $pricePerOunce / 31.1035;
        $silver_price = $pricePerOunceSilver / 31.1035;
        DB::table('settings')->where('key', 'gold_price')->update(['value' => round($gold_price, 2)]);
        DB::table('settings')->where('key', 'silver_price')->update(['value' => round($silver_price, 2)]);

        return response()->json(['message' => 'Prices updated successfully'], 200);
    }
}
