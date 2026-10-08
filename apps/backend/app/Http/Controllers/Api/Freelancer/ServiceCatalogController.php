<?php

namespace App\Http\Controllers\Api\Freelancer;

use App\Models\ServiceCatalog;
use App\Models\Category;
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
            'category_id' => 'nullable|integer|exists:categories,id',
            'description' => 'required|string|max:2000',
            'price' => 'required|numeric|min:0.01|max:9999999999.99',
            'images' => 'required|array|min:1|max:6',
            'images.*' => 'required|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        if ($validator->fails()) {
            return $this->error('Validation error.', 422, $validator->errors());
        }

        $categoryId = $request->filled('category_id')
            ? (int) $request->integer('category_id')
            : $this->defaultCategoryId($request);

        if ($categoryId && !$this->providerHasCategory($request, $categoryId)) {
            return $this->error('Please select a category from your registered skills.', 422);
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
            'category_id' => $categoryId,
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
        $origin = rtrim((string) config('app.asset_url'), '/');

        return [
            'id' => $catalog->id,
            'category_id' => $catalog->category_id,
            'heading' => $catalog->heading,
            'description' => $catalog->description,
            'price' => $catalog->price,
            'images' => $images,
            'image_urls' => array_map(
                fn (string $image) => $origin.'/'.ltrim(preg_replace('#^/?public/#', '', $image), '/'),
                $images
            ),
            'created_at' => $catalog->created_at?->toISOString(),
        ];
    }

    private function defaultCategoryId(Request $request): ?int
    {
        $skills = collect(preg_split('/\s*,\s*/', (string) $request->user()->skills))
            ->map(fn ($value) => mb_strtolower(trim((string) $value)))
            ->filter();

        $providerCategories = Category::query()->orderBy('id')->get()->filter(function (Category $category) use ($skills) {
            return $skills->contains((string) $category->id)
                || $skills->contains(mb_strtolower((string) $category->slug))
                || $skills->contains(mb_strtolower((string) $category->name));
        })->values();

        $text = mb_strtolower($request->string('heading').' '.$request->string('description'));
        $category = $providerCategories->first(function (Category $category) use ($text) {
            $identity = mb_strtolower($category->name.' '.$category->slug);
            $keywords = match (true) {
                str_contains($identity, 'plumb') => ['plumb', 'pipe', 'tap', 'water', 'drain', 'toilet', 'sink'],
                str_contains($identity, 'barber') => ['barber', 'hair', 'shave', 'beard', 'salon'],
                str_contains($identity, 'electr') => ['electr', 'wire', 'switch', 'power', 'light', 'socket'],
                default => [mb_strtolower((string) $category->name), mb_strtolower((string) $category->slug)],
            };

            return collect($keywords)->filter()->contains(fn ($keyword) => str_contains($text, $keyword));
        });

        return ($category ?? $providerCategories->first())?->id;
    }

    private function providerHasCategory(Request $request, int $categoryId): bool
    {
        $category = Category::query()->find($categoryId);

        if (!$category) {
            return false;
        }

        $skills = collect(preg_split('/\s*,\s*/', (string) $request->user()->skills))
            ->map(fn ($value) => mb_strtolower(trim((string) $value)))
            ->filter();

        return $skills->contains((string) $category->id)
            || $skills->contains(mb_strtolower((string) $category->slug))
            || $skills->contains(mb_strtolower((string) $category->name));
    }
}
