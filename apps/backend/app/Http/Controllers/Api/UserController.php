<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Mail;
use DB;

class UserController extends Controller
{

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $validated = \Validator::make($request->all(), [
            'name'                   => 'sometimes|required|string|max:255',
            'email'                  => 'sometimes|required|email|max:255|unique:users,email,' . $user->id,
            'dob'                    => 'sometimes|nullable|date',
            'phone'                  => 'sometimes|nullable|string|max:20',
            'gender'                 => 'sometimes|nullable|string|max:10',
            'alternate_phone'        => 'sometimes|nullable|string|max:20',
            'nominee_name'           => 'sometimes|nullable|string|max:255',
            'nominee_dob'            => 'sometimes|nullable|date',
            'nominee_phone'          => 'sometimes|nullable|string|max:20',
            'relation_with_nominee'  => 'sometimes|nullable|string|max:50',
            'profile'                => 'sometimes|nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ])->validate();

        // 2. Normalize date fields
        foreach (['dob', 'nominee_dob'] as $dateKey) {
            if (!empty($validated[$dateKey])) {
                $validated[$dateKey] = \Carbon\Carbon::parse($validated[$dateKey])->format('Y-m-d');
            }
        }

        // handle profile file upload if present
        if ($request->hasFile('profile')) {
            $file = $request->file('profile');
            $destination = public_path('uploads/users');
            $filename = time() . '_' . preg_replace('/\s+/', '_', $file->getClientOriginalName());
            $file->move($destination, $filename);
            $input['profile'] = 'uploads/users/' . $filename;
        }

        $user->update($validated);
        return response()->json(['status'  => 'success','message' => 'Profile updated successfully.'], 200);
    }

    public function contactUs(Request $request)
    {
        $contactData = DB::table('settings')->get();
        return response()->json([
            'status'  => 'success',
            'message' => 'Contact us data fetched successfully.',
            'data'    => $contactData,
        ],200);
    }

    public function addressAdd(Request $request)
    {
        $validated = \Validator::make($request->all(), [
            'fullname'                 => 'required|string|max:255',
            'address'                  => 'required|string',
            'landmark'                 => 'sometimes|nullable|string|max:255',
            'pincode'                  => 'required|string|max:20',
            'city'                     => 'required|string|max:100',
            'state'                    => 'required|string|max:100',
            'mobile_number'            => 'required|string|max:20',
            'alternate_mobile_number'  => 'sometimes|nullable|string|max:20',
        ])->validate();

        $user = $request->user();

        $addressData = [
            'user_id'                  => $user ? $user->id : null,
            'fullname'                 => $validated['fullname'],
            'address'                  => $validated['address'],
            'landmark'                 => $validated['landmark'] ?? null,
            'pincode'                  => $validated['pincode'],
            'city'                     => $validated['city'],
            'state'                    => $validated['state'],
            'mobile_number'            => $validated['mobile_number'],
            'alternate_mobile_number'  => $validated['alternate_mobile_number'] ?? null
        ];

        DB::table('user_address')->insert($addressData);
        return response()->json(['status'  => 'success','message' => 'Address added successfully.'], 200);
    }

    public function addressList(Request $request)
    {
        $user = $request->user();
        $addresses = DB::table('user_address')->where('user_id', $user->id)->get();

        return response()->json([
            'status'  => 'success',
            'message' => 'Address list fetched successfully.',
            'data'    => $addresses,
        ],200);
    }

}
