<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Models\Project;
use App\Models\Category;
use App\Models\Review;
use Illuminate\Support\Str;
use Throwable;


class JobController extends Controller
{

    public function index()
    {
        return $this->renderIndex('all');
    }

    public function openJobs()
    {
        return $this->renderIndex('open');
    }

    public function closedJobs()
    {
        return $this->renderIndex('closed');
    }

    private function renderIndex(string $scope)
    {
        return view('admin.job.index', [
            'scope' => $scope,
            'pageTitle' => match ($scope) {
                'open' => 'Open Jobs',
                'closed' => 'Closed Jobs',
                default => 'All Jobs',
            },
            'allCount' => Project::query()->count(),
            'openCount' => Project::query()->where('status', 'active')->count(),
            'inProgressCount' => Project::query()->where('status', 'in progress')->count(),
            'closedCount' => Project::query()->whereIn('status', ['completed', 'deleted'])->count(),
        ]);
    }

    public function create()
    {
        $data['categories'] = DB::table('categories')->get();
        return view('admin.product.create', $data);
    }

    public function store(Request $request){
        $validator = Validator::make($request->all(), [
            'title' => 'required',
            'price' => 'required',
            'weight' => 'required',
            'type' => 'required',
            'images.*' => 'image|mimes:jpg,jpeg,png,webp'
        ]);
        // if validation fails, redirect back with errors and show toastr error notification
        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput()
                ->with('toastr', [
                    'type' => 'error',
                    'message' => 'Please correct the highlighted errors and try again.'
                ]);
        }
        // dd($request->all());
        $product = Product::create([
            'title' => $request->title,
            'slug' => Str::slug($request->title),
            'type' => $request->type,
            'carat' => $request->carat,
            'price' => $request->price,
            'weight' => $request->weight,
            'description' => $request->description,
            'specification' => $request->specification,
        ]);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $extension = $image->getClientOriginalExtension();
                $filename = time() . rand(1000, 9999) . '.' . $extension;

                $image->move(public_path('uploads/products'), $filename);

                $product->images()->create([
                    'image' => 'uploads/products/' . $filename
                ]);
            }
        }

        return redirect()->route('admin.product.index')->with('toastr', [
            'type' => 'success',
            'message' => 'Product created successfully.'
        ]);
    }

    public function job_list(Request $request)
    {
        $scope = in_array($request->string('scope')->toString(), ['all', 'open', 'closed'], true)
            ? $request->string('scope')->toString()
            : 'all';
        $search = trim((string) $request->input('search.value', ''));
        $start = max((int) $request->input('start', 0), 0);
        $length = min(max((int) $request->input('length', 10), 1), 100);
        $draw = (int) $request->input('draw', 0);

        $query = Project::query();
        $this->applyScope($query, $scope);
        $recordsTotal = (clone $query)->count();

        if ($scope === 'all') {
            $requestedStatus = $request->string('status')->toString();
            if (in_array($requestedStatus, ['draft', 'active', 'pause', 'in progress', 'completed', 'deleted'], true)) {
                $query->where('status', $requestedStatus);
            }
        }

        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('title', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('budget', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%")
                    ->orWhereHas('client', function ($client) use ($search) {
                        $client->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('bids.user', function ($provider) use ($search) {
                        $provider->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        $recordsFiltered = (clone $query)->count();
        $orderableColumns = [
            0 => 'id',
            1 => 'title',
            2 => 'budget',
            3 => 'status',
            8 => 'created_at',
        ];
        $orderColumn = $orderableColumns[(int) $request->input('order.0.column', 0)] ?? 'id';
        $orderDirection = strtolower((string) $request->input('order.0.dir', 'desc')) === 'asc' ? 'asc' : 'desc';

        $jobs = $query
            ->select(['id', 'title', 'slug', 'budget', 'created_at', 'status', 'user_id'])
            ->with([
                'client:id,name,email',
                'hiredBid.user:id,name,email',
                'payment:id,project_id,status,amount',
            ])
            ->withCount('bids')
            ->orderBy($orderColumn, $orderDirection)
            ->offset($start)
            ->limit($length)
            ->get();

        $data = $jobs->map(function (Project $job) {
            $client = $job->client
                ? '<a href="'.route('admin.users.show', $job->client->id).'">'.e($job->client->name).'</a><br><small>'.e($job->client->email).'</small>'
                : '<span class="text-muted">Deleted client</span>';

            $provider = $job->hiredBid?->user;
            $providerName = $provider?->name ?: $job->hiredBid?->freelancer_name;
            $providerHtml = $provider
                ? '<a href="'.route('admin.users.show', $provider->id).'">'.e($providerName).'</a><br><small>'.e($provider->email).'</small>'
                : ($providerName ? e($providerName) : '<span class="text-muted">Not assigned</span>');

            $paymentHtml = $job->payment
                ? $this->paymentBadge($job->payment->status).'<br><small>AUD '.number_format((float) $job->payment->amount, 2).'</small>'
                : '<span class="badge badge-light">Not paid</span>';

            return [
                'DT_RowId' => 'job-'.$job->id,
                '#'.$job->id,
                '<strong>'.e($job->title ?: 'Untitled job').'</strong>',
                'AUD '.number_format((float) $job->budget, 2),
                $this->statusBadge($job->status),
                $client,
                $providerHtml,
                (string) $job->bids_count,
                $paymentHtml,
                $this->formatDate($job->created_at),
                '<a href="'.route('admin.jobs.project_view', $job->id).'" class="btn btn-sm btn-primary" title="View job details"><i class="fa fa-eye"></i> View</a>',
            ];
        })->values();

        return response()->json([
            'draw' => $draw,
            'recordsTotal' => $recordsTotal,
            'recordsFiltered' => $recordsFiltered,
            'data' => $data,
        ]);
    }

    public function project_view(int $id)
    {
        $project = Project::query()
            ->with([
                'client:id,name,email,phone,profile_image,street_address,city,state,country,pincode,is_verified,created_at',
                'images',
                'bids' => fn ($query) => $query
                    ->with('user:id,name,email,phone,profile_image,is_verified')
                    ->orderByDesc('is_hired')
                    ->orderByDesc('id'),
                'hiredBid.user:id,name,email,phone,profile_image,is_verified,skills,experience,street_address,city,state,country,pincode',
                'payment.customer:id,name,email',
                'payment.provider:id,name,email',
            ])
            ->withCount('bids')
            ->findOrFail($id);

        $categoryIds = collect(explode(',', (string) $project->category))
            ->map(fn ($id) => trim($id))
            ->filter(fn ($id) => ctype_digit($id))
            ->values();
        $categories = $categoryIds->isEmpty()
            ? collect()
            : Category::query()->whereIn('id', $categoryIds)->orderBy('name')->get(['id', 'name']);

        $reviews = Review::query()
            ->with([
                'reviewer:id,name,email',
                'receiver:id,name,email',
            ])
            ->where('job_id', $project->id)
            ->latest('id')
            ->get();

        return view('admin.job.show', compact('project', 'categories', 'reviews'));
    }

    private function applyScope($query, string $scope): void
    {
        if ($scope === 'open') {
            $query->where('status', 'active');
        } elseif ($scope === 'closed') {
            $query->whereIn('status', ['completed', 'deleted']);
        }
    }

    private function statusBadge(?string $status): string
    {
        $status = strtolower(trim((string) $status));
        $class = match ($status) {
            'active' => 'success',
            'in progress' => 'primary',
            'completed' => 'info',
            'pause' => 'warning',
            'deleted' => 'danger',
            default => 'secondary',
        };

        return '<span class="badge badge-'.$class.'">'.e(ucwords($status ?: 'unknown')).'</span>';
    }

    private function paymentBadge(?string $status): string
    {
        $status = strtolower(trim((string) $status));
        $class = match ($status) {
            'succeeded' => 'success',
            'failed' => 'danger',
            'cancelled' => 'secondary',
            default => 'warning',
        };

        return '<span class="badge badge-'.$class.'">'.e(ucfirst($status ?: 'unknown')).'</span>';
    }

    private function formatDate($value): string
    {
        if (!$value) {
            return '<span class="text-muted">&mdash;</span>';
        }

        try {
            return e(\Carbon\Carbon::parse($value)->format('d M Y, h:i A'));
        } catch (Throwable) {
            return e((string) $value);
        }
    }

    public function edit($id)
    {
        $data['product'] = Product::with('images')->findOrFail($id);
        $data['categories'] = DB::table('categories')->get();
        return view('admin.product.edit', $data);
    }

    public function deleteImage(Request $request, $id)
    {
        $image = DB::table('product_images')->where('id', $id)->first();
        if ($image) {
            // Delete the image file from storage
            if (file_exists(public_path($image->image))) {
                @unlink(public_path($image->image));
            }
            // Delete the database record
            DB::table('product_images')->where('id', $id)->delete();

            return response()->json(['success' => true, 'message' => 'Image deleted successfully.']);
        } else {
            return response()->json(['success' => false, 'message' => 'Image not found.'], 404);
        }
    }

    // update
    public function update(Request $request, $id){
        $product = Product::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'required',
            'price' => 'required|numeric',
            'weight' => 'required|numeric',
            'type' => 'required',
            'images.*' => 'image|mimes:jpg,jpeg,png,webp'
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput()
                ->with('toastr', [
                    'type' => 'error',
                    'message' => 'Please correct the highlighted errors and try again.'
                ]);
        }

        // Update product fields
        $product->update([
            'title' => $request->title,
            'type' => $request->type,
            'carat' => $request->carat,
            'price' => $request->price,
            'weight' => $request->weight,
            'description' => $request->description,
            'specification' => $request->specification,
            'category_id' => $request->category_id,
        ]);

        // Optional: update slug only if title changed
        if ($product->isDirty('title')) {
            $product->slug = Str::slug($request->title);
            $product->save();
        }

        // Handle new images (append)
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {

                $extension = $image->getClientOriginalExtension();
                $filename = time() . rand(1000, 9999) . '.' . $extension;

                $image->move(public_path('uploads/products'), $filename);

                $product->images()->create([
                    'image' => 'uploads/products/' . $filename
                ]);
            }
        }

        return redirect()->route('admin.product.index')->with('toastr', [
            'type' => 'success',
            'message' => 'Product updated successfully.'
        ]);
    }

    // delete
    public function delete($id)
    {
        $product = Product::with('images')->findOrFail($id);

        // Delete image files from public folder
        if ($product->images->count()) {
            foreach ($product->images as $img) {
                $filePath = public_path($img->image);

                if (file_exists($filePath)) {
                    unlink($filePath);
                }
            }
        }

        // Delete product (images will be deleted via FK or manually)
        $product->delete();

        return redirect()->route('admin.product.index')->with('toastr', [
            'type' => 'success',
            'message' => 'Product deleted successfully.'
        ]);
    }

}
