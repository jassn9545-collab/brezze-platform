<?php

namespace App\Http\Controllers\Api\Client;

use App\Models\Category;
use App\Models\Review;
use App\Models\ServiceCatalog;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

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

    public function discovery(Request $request)
    {
        if ($check = $this->checkClient()) {
            return $check;
        }

        $validator = Validator::make($request->all(), [
            'category_id' => 'nullable|integer|exists:categories,id',
            'search' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 422, $validator->errors());
        }

        $categories = Category::query()->orderBy('id')->get();
        $selectedCategory = $request->filled('category_id')
            ? $categories->firstWhere('id', (int) $request->integer('category_id'))
            : null;
        $search = mb_strtolower(trim((string) $request->input('search', '')));

        $providers = User::query()
            ->where('user_type', 'freelancer')
            ->with(['serviceCatalogs' => fn ($query) => $query->where('status', true)->latest()])
            ->orderBy('name')
            ->get();

        $providerIds = $providers->pluck('id');
        $ratings = Review::query()
            ->where('review_to', 'freelancer')
            ->whereIn('given_to', $providerIds)
            ->selectRaw('given_to, AVG(star) as average_rating, COUNT(*) as review_count')
            ->groupBy('given_to')
            ->get()
            ->keyBy(fn ($review) => (int) $review->given_to);
        $completedJobs = DB::table('bids')
            ->join('projects', 'projects.id', '=', 'bids.project_id')
            ->where('bids.is_hired', 1)
            ->where('projects.status', 'completed')
            ->whereIn('bids.user_id', $providerIds)
            ->selectRaw('bids.user_id, COUNT(*) as total_jobs')
            ->groupBy('bids.user_id')
            ->pluck('total_jobs', 'bids.user_id');

        $professionals = $providers
            ->filter(fn (User $provider) => !$selectedCategory || $this->providerMatchesCategory($provider, $selectedCategory))
            ->map(function (User $provider) use ($categories, $ratings, $completedJobs, $request) {
                $providerCategories = $this->providerCategories($provider, $categories);
                $rating = $ratings->get($provider->id);
                $prices = $provider->serviceCatalogs->pluck('price')->map(fn ($price) => (float) $price);

                return [
                    'id' => $provider->id,
                    'name' => $provider->name,
                    'profile_title' => $provider->profile_title,
                    'profile_description' => $provider->profile_description,
                    'profile_image' => $this->absoluteUrl($request, $provider->profile_image),
                    'location' => collect([$provider->city, $provider->state, $provider->country])->filter()->implode(', '),
                    'experience' => $provider->experience,
                    'is_verified' => (bool) $provider->is_verified,
                    'is_featured' => (bool) $provider->is_featured,
                    'is_top_rated' => ((float) ($rating?->average_rating ?? 0)) >= 4.5,
                    'rating' => round((float) ($rating?->average_rating ?? 0), 1),
                    'review_count' => (int) ($rating?->review_count ?? 0),
                    'total_jobs' => (int) ($completedJobs[$provider->id] ?? 0),
                    'job_success_score' => 100,
                    'catalog_count' => $provider->serviceCatalogs->count(),
                    'starting_price' => $prices->isEmpty() ? null : number_format($prices->min(), 2, '.', ''),
                    'categories' => $providerCategories->map(fn (Category $category) => [
                        'id' => $category->id,
                        'name' => $category->name,
                        'slug' => $category->slug,
                    ])->values(),
                ];
            })
            ->filter(function (array $professional) use ($search) {
                if ($search === '') {
                    return true;
                }

                $haystack = mb_strtolower(implode(' ', [
                    $professional['name'],
                    $professional['profile_title'],
                    $professional['profile_description'],
                    collect($professional['categories'])->pluck('name')->implode(' '),
                ]));

                return str_contains($haystack, $search);
            })
            ->values();

        $featuredProfessionals = $professionals
            ->filter(fn (array $professional) => $professional['is_featured'])
            ->take(3)
            ->values();

        $visibleProviderIds = $professionals->pluck('id');
        $services = $providers
            ->whereIn('id', $visibleProviderIds)
            ->flatMap(function (User $provider) use ($request, $ratings, $selectedCategory, $categories) {
                return $provider->serviceCatalogs
                    ->filter(fn (ServiceCatalog $catalog) => !$selectedCategory
                        || $this->serviceMatchesCategory($catalog, $provider, $selectedCategory, $categories))
                    ->map(function (ServiceCatalog $catalog) use ($provider, $request, $ratings) {
                    $rating = $ratings->get($provider->id);
                    $images = $catalog->images ?? [];

                    return [
                        'id' => $catalog->id,
                        'category_id' => $catalog->category_id,
                        'provider_id' => $provider->id,
                        'provider_name' => $provider->name,
                        'provider_title' => $provider->profile_title,
                        'provider_image' => $this->absoluteUrl($request, $provider->profile_image),
                        'provider_rating' => round((float) ($rating?->average_rating ?? 0), 1),
                        'review_count' => (int) ($rating?->review_count ?? 0),
                        'heading' => $catalog->heading,
                        'description' => $catalog->description,
                        'price' => $catalog->price,
                        'images' => $images,
                        'image_urls' => array_map(
                            fn (string $image) => $this->absoluteUrl($request, $image),
                            $images
                        ),
                        'created_at' => $catalog->created_at?->toISOString(),
                    ];
                });
            })
            ->filter(function (array $service) use ($search) {
                if ($search === '') {
                    return true;
                }

                return str_contains(mb_strtolower(implode(' ', [
                    $service['heading'],
                    $service['description'],
                    $service['provider_name'],
                    $service['provider_title'],
                ])), $search);
            })
            ->values();

        return $this->success([
            'categories' => $categories->map(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'photo' => $category->photo,
                'image_url' => $this->absoluteUrl($request, 'uploads/category/'.$category->photo),
            ])->values(),
            'featured_professionals' => $featuredProfessionals,
            'professionals' => $professionals,
            'services' => $services,
        ], 'Discovery data retrieved successfully.');
    }

    private function providerMatchesCategory(User $provider, Category $category): bool
    {
        $tokens = collect(preg_split('/\s*,\s*/', (string) $provider->skills))
            ->map(fn ($value) => mb_strtolower(trim((string) $value)))
            ->filter();

        return $tokens->contains((string) $category->id)
            || $tokens->contains(mb_strtolower((string) $category->slug))
            || $tokens->contains(mb_strtolower((string) $category->name));
    }

    private function providerCategories(User $provider, $categories)
    {
        return $categories->filter(fn (Category $category) => $this->providerMatchesCategory($provider, $category));
    }

    private function serviceMatchesCategory(
        ServiceCatalog $catalog,
        User $provider,
        Category $category,
        $categories
    ): bool {
        if ($catalog->category_id) {
            return (int) $catalog->category_id === (int) $category->id;
        }

        $providerCategories = $this->providerCategories($provider, $categories)->values();

        if ($providerCategories->count() === 1) {
            return (int) $providerCategories->first()->id === (int) $category->id;
        }

        $text = mb_strtolower($catalog->heading.' '.$catalog->description);
        $terms = collect([
            mb_strtolower((string) $category->name),
            mb_strtolower((string) $category->slug),
            ...$this->categoryKeywords($category),
        ])->filter()->unique();

        return $terms->contains(fn (string $term) => str_contains($text, $term));
    }

    private function categoryKeywords(Category $category): array
    {
        $identity = mb_strtolower($category->name.' '.$category->slug);

        return match (true) {
            str_contains($identity, 'plumb') => ['plumb', 'pipe', 'tap', 'water', 'drain', 'toilet', 'sink'],
            str_contains($identity, 'barber') => ['barber', 'hair', 'shave', 'beard', 'salon'],
            str_contains($identity, 'electr') => ['electr', 'wire', 'switch', 'power', 'light', 'socket'],
            default => [],
        };
    }

    private function absoluteUrl(Request $request, ?string $path): ?string
    {
        if (!$path || filter_var($path, FILTER_VALIDATE_URL)) {
            return $path;
        }

        return $request->root().'/'.ltrim(preg_replace('#^/?public/#', '', $path), '/');
    }
}
