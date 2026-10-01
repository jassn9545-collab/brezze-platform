<?php

namespace App\Http\Controllers\Api\Client;

use App\Models\ServiceCatalog;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class ServiceCatalogController extends BaseClientController
{
    use ApiResponse;

    public function index(Request $request, User $provider)
    {
        if ($check = $this->checkClient()) {
            return $check;
        }

        if ($provider->user_type !== 'freelancer') {
            return $this->error('Freelancer not found.', 404);
        }

        $catalogs = ServiceCatalog::query()
            ->where('provider_id', $provider->id)
            ->where('status', true)
            ->latest()
            ->get()
            ->map(function (ServiceCatalog $catalog) use ($request) {
                $images = $catalog->images ?? [];
                $origin = $request->root();

                return [
                    'id' => $catalog->id,
                    'heading' => $catalog->heading,
                    'description' => $catalog->description,
                    'price' => $catalog->price,
                    'images' => $images,
                    'image_urls' => array_map(
                        fn (string $image) => $origin.'/public/'.ltrim(preg_replace('#^/?public/#', '', $image), '/'),
                        $images
                    ),
                    'created_at' => $catalog->created_at?->toISOString(),
                ];
            });

        return $this->success([
            'provider' => [
                'id' => $provider->id,
                'name' => $provider->name,
                'profile_image' => $provider->profile_image,
            ],
            'catalogs' => $catalogs,
        ], 'Service catalogs retrieved successfully.');
    }
}
