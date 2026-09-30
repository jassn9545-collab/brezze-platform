<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use DB;

class SettingsController extends Controller
{

    public function index()
    {
        $settings = DB::table('settings')->pluck('value', 'key');
        return view('admin.settings.index', compact('settings'));

    }

    public function update(Request $request)
    {
        $data = $request->only(['address', 'mobile', 'whatsapp_number', 'company_name', 'gst', 'timing', 'logo']);
        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            $filename = time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads'), $filename);
            $data['logo'] = 'uploads/' . $filename;
        }
        foreach ($data as $key => $value) {
            DB::table('settings')->updateOrInsert(
                ['key' => $key],
                ['value' => $value]
            );
        }
        return redirect()->back()->with('toastr', [
            'type' => 'success',
            'message' => 'Settings updated successfully.'
        ]);
    }
}