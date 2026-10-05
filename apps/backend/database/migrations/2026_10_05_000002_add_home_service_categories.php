<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();
        $categories = [
            ['name' => 'Electrician', 'slug' => 'electrician', 'photo' => 'electrician.png'],
            ['name' => 'Plumbing', 'slug' => 'plumbing', 'photo' => 'plumbing.png'],
            ['name' => 'Carpenter', 'slug' => 'carpenter', 'photo' => 'carpenter.png'],
            ['name' => 'Cleaning', 'slug' => 'cleaning', 'photo' => 'cleaning.png'],
            ['name' => 'Carpet maker', 'slug' => 'carpet-maker', 'photo' => 'carpet.png'],
            ['name' => 'Appliance', 'slug' => 'appliance', 'photo' => 'appliance.png'],
            ['name' => 'AC Repair', 'slug' => 'ac-repair', 'photo' => 'acrepair.png'],
            ['name' => 'Garden', 'slug' => 'garden', 'photo' => 'garden.png'],
        ];

        DB::table('categories')
            ->where('slug', 'plumber')
            ->update(['name' => 'Plumbing', 'slug' => 'plumbing', 'photo' => 'plumbing.png']);
        DB::table('categories')
            ->where('slug', 'electririon')
            ->update(['name' => 'Electrician', 'slug' => 'electrician', 'photo' => 'electrician.png']);

        foreach ($categories as $category) {
            if (!DB::table('categories')->where('slug', $category['slug'])->exists()) {
                DB::table('categories')->insert([
                    ...$category,
                    'created_at' => $now,
                    'modify_at' => $now,
                ]);
            }

            $source = base_path('../customer/src/assets/images/'.$category['photo']);
            $destination = public_path('uploads/category/'.$category['photo']);

            if (File::isFile($source) && !File::isFile($destination)) {
                File::ensureDirectoryExists(dirname($destination));
                File::copy($source, $destination);
            }
        }
    }

    public function down(): void
    {
        // Keep category records and images because they may already be in use by services.
    }
};
