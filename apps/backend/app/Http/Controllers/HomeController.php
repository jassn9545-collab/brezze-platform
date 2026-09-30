<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Mail;
use DB;
class HomeController extends Controller
{

    public function update_price()
    {
        $apiKey = config('services.metal_price.key');
        if (!$apiKey) {
            return response()->json(['message' => 'Metal price API is not configured.'], 503);
        }

        $response = Http::timeout(10)->get('https://api.metalpriceapi.com/v1/latest', [
            'api_key' => $apiKey,
            'base' => 'INR',
            'currencies' => 'XAU,XAG',
        ]);

        if ($response->failed() || !$response->has(['rates.INRXAU', 'rates.INRXAG'])) {
            return response()->json(['message' => 'Unable to retrieve metal prices.'], 502);
        }

        $data = $response->json();
        $pricePerOunce = $data['rates']['INRXAU'];
        $pricePerOunceSilver = $data['rates']['INRXAG'];
        $gold_price = $pricePerOunce / 31.1035;
        $silver_price = $pricePerOunceSilver / 31.1035;
        DB::table('settings')->where('key', 'gold_price')->update(['value' => round($gold_price, 2)]);
        DB::table('settings')->where('key', 'silver_price')->update(['value' => round($silver_price, 2)]);

        return response()->json(['message' => 'Prices updated successfully'], 200);
    }
}
