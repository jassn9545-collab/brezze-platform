<?php

namespace App\Http\Controllers\Api\Freelancer;

use App\Models\ServiceCatalog;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ServiceCatalogController extends BaseFreelancerController
{
    use ApiResponse;

    public function index(Request $request)
    {
        if ($check = $this->checkFreelancer()) {
            return $check;
        }

        $catalogs = ServiceCatalog::query()
            ->where('provider_id', $request->user()->id)
            ->where('status', true)
            ->latest()
            ->get()
            ->map(fn (ServiceCatalog $catalog) => $this->catalogData($catalog, $request));

        return $this->success(['catalogs' => $catalogs], 'Service catalogs retrieved successfully.');
    }

    public function store(Request $request)
    {
        if ($check = $this->checkFreelancer()) {
            return $check;
        }

        $validator = Validator::make($request->all(), [
            'heading' => 'required|string|max:150',
            'description' => 'required|string|max:2000',
            'price' => 'required|numeric|min:0.01|max:9999999999.99',
            'images' => 'required|array|min:1|max:6',
            'images.*' => 'required|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        if ($validator->fails()) {
            return $this->error('Validation error.', 422, $validator->errors());
        }

        $uploadPath = public_path('uploads/catalogs');
        File::ensureDirectoryExists($uploadPath);
        $images = [];

        foreach ($request->file('images', []) as $image) {
            $filename = Str::uuid().'.'.$image->getClientOriginalExtension();
            $image->move($uploadPath, $filename);
            $images[] = 'uploads/catalogs/'.$filename;
        }

        $catalog = ServiceCatalog::create([
            'provider_id' => $request->user()->id,
            'heading' => $request->string('heading')->trim()->toString(),
            'description' => $request->string('description')->trim()->toString(),
            'price' => $request->input('price'),
            'images' => $images,
            'status' => true,
        ]);

        return $this->success(
            ['catalog' => $this->catalogData($catalog, $request)],
            'Service catalog added successfully.',
            201
        );
    }

    private function catalogData(ServiceCatalog $catalog, Request $request): array
    {
        $images = $catalog->images ?? [];
        $origin = $request->getSchemeAndHttpHost();

        return [
            'id' => $catalog->id,
            'heading' => $catalog->heading,
            'description' => $catalog->description,
            'price' => $catalog->price,
            'images' => $images,
            'image_urls' => array_map(
                fn (string $image) => $origin.'/'.ltrim($image, '/'),
                $images
            ),
            'created_at' => $catalog->created_at?->toISOString(),
        ];
    }
}
