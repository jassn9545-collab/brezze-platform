<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
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
        $request->validate([
            'customer_hero_title' => ['nullable', 'string', 'max:160'],
            'customer_hero_button_text' => ['nullable', 'string', 'max:40'],
            'customer_hero_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $data = $request->only([
            'address',
            'mobile',
            'whatsapp_number',
            'company_name',
            'gst',
            'timing',
            'customer_hero_title',
            'customer_hero_button_text',
        ]);

        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            $filename = time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads'), $filename);
            $data['logo'] = 'uploads/' . $filename;
        }

        if ($request->hasFile('customer_hero_image')) {
            $file = $request->file('customer_hero_image');
            $directory = public_path('uploads/heroes');
            File::ensureDirectoryExists($directory);
            $filename = 'customer-home-' . now()->format('YmdHis') . '-' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move($directory, $filename);
            $data['customer_hero_image'] = 'uploads/heroes/' . $filename;
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
