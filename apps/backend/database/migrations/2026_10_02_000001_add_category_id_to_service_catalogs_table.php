<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_catalogs', function (Blueprint $table) {
            $table->unsignedBigInteger('category_id')->nullable()->after('provider_id')->index();
        });

        $categories = DB::table('categories')->orderBy('id')->get();
        $users = DB::table('users')->select('id', 'skills')->get()->keyBy('id');

        DB::table('service_catalogs')->orderBy('id')->get()->each(function ($catalog) use ($categories, $users) {
            $skills = collect(preg_split('/\s*,\s*/', (string) ($users->get($catalog->provider_id)?->skills ?? '')))
                ->map(fn ($value) => mb_strtolower(trim((string) $value)))
                ->filter();
            $providerCategories = $categories->filter(function ($category) use ($skills) {
                return $skills->contains((string) $category->id)
                    || $skills->contains(mb_strtolower((string) $category->slug))
                    || $skills->contains(mb_strtolower((string) $category->name));
            })->values();

            if ($providerCategories->isEmpty()) {
                return;
            }

            $text = mb_strtolower($catalog->heading.' '.$catalog->description);
            $matched = $providerCategories->first(function ($category) use ($text) {
                $identity = mb_strtolower($category->name.' '.$category->slug);
                $keywords = match (true) {
                    str_contains($identity, 'plumb') => ['plumb', 'pipe', 'tap', 'water', 'drain', 'toilet', 'sink'],
                    str_contains($identity, 'barber') => ['barber', 'hair', 'shave', 'beard', 'salon'],
                    str_contains($identity, 'electr') => ['electr', 'wire', 'switch', 'power', 'light', 'socket'],
                    default => [mb_strtolower((string) $category->name), mb_strtolower((string) $category->slug)],
                };

                return collect($keywords)->filter()->contains(fn ($keyword) => str_contains($text, $keyword));
            });

            DB::table('service_catalogs')
                ->where('id', $catalog->id)
                ->update(['category_id' => ($matched ?? $providerCategories->first())->id]);
        });
    }

    public function down(): void
    {
        Schema::table('service_catalogs', function (Blueprint $table) {
            $table->dropColumn('category_id');
        });
    }
};
