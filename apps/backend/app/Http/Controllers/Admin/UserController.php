<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\UserProfile;
use App\Models\Bid;
use App\Models\Dispute;
use App\Models\Payment;
use App\Models\Project;
use App\Models\Review;
use App\Models\ServiceBooking;
use App\Models\ServiceCatalog;
use App\Models\WithdrawalRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{

    public function index()
    {
        $userType = request('type');
        $userType = in_array($userType, ['client', 'freelancer'], true) ? $userType : null;

        return view('admin.users.index', [
            'userType' => $userType,
            'pageTitle' => $userType === 'freelancer'
                ? 'Professionals'
                : ($userType === 'client' ? 'Clients' : 'Users'),
            'counts' => [
                'clients' => User::query()->where('user_type', 'client')->count(),
                'freelancers' => User::query()->where('user_type', 'freelancer')->count(),
                'verified' => User::query()->whereIn('user_type', ['client', 'freelancer'])->where('is_verified', 1)->count(),
                'pending' => User::query()->whereIn('user_type', ['client', 'freelancer'])->where('is_verified', 0)->count(),
            ],
        ]);
    }

    public function user_list(Request $request){
        $search  = $request->input('search.value');
        $start   = $request->input('start', 0);
        $length  = $request->input('length', 10);
        $draw    = $request->input('draw');
        $user_type = $request->input('user_type');

        $query = User::query()->with('proof')->whereIn('user_type', ['client', 'freelancer']);
        if (in_array($user_type, ['client', 'freelancer'], true)) {
            $query->where('user_type', $user_type);
        }

        $totalrows = (clone $query)->count();

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $filteredRows = (clone $query)->count();

        $data = $query
            ->orderBy('id', 'desc')
            ->offset($start)
            ->limit($length)
            ->get();

        $final = [];

        foreach ($data as $row) {
            $verificationStatus = $row->proof?->is_verified ?? $row->is_verified ?? 0;
            $status = '<select class="form-control form-control-sm user-status" data-id="'.$row->id.'">
                        <option value="0" '.($verificationStatus == 0 ? 'selected' : '').'>Pending</option>
                        <option value="1" '.($verificationStatus == 1 ? 'selected' : '').'>Verified</option>
                        <option value="2" '.($verificationStatus == 2 ? 'selected' : '').'>Rejected</option>
                    </select>';
            $featured = $row->user_type === 'freelancer'
                ? '<input type="checkbox" class="user-featured" data-id="'.$row->id.'" '.($row->is_featured ? 'checked' : '').' aria-label="Show '.e($row->name).' on home screen">'
                : '<span class="text-muted">&mdash;</span>';
            $photo = $row->profile_image
                ? asset(ltrim($row->profile_image, '/'))
                : 'https://ui-avatars.com/api/?name='.urlencode($row->name).'&background=0063b7&size=128&rounded=true&color=fff&length=1';
            $final[] = [
                "DT_RowId" => $row->id,
                e($row->name),
                e($row->email),
                e($row->phone ?: '—'),
                $status,
                $featured,
                '<img src="'.e($photo).'" width="50" height="50" class="rounded-circle" style="object-fit:cover" alt="'.e($row->name).'">',
                $row->created_at ? $row->created_at->format('M d, Y') : '—',
                '<a href="'.route('admin.users.show', $row->id).'" class="btn btn-warning" title="View full details"><i class="fa fa-eye"></i> View</a>'
            ];
        }

        return response()->json([
            "draw"            => intval($draw),
            "recordsTotal"    => $totalrows,
            "recordsFiltered" => $filteredRows,
            "data"            => $final
        ]);
    }

    public function create()
    {
        return view('admin.users.create');
    }

    public function show($id)
    {
        $user = User::query()
            ->with('proof')
            ->whereIn('user_type', ['client', 'freelancer'])
            ->findOrFail($id);

        $reviewsReceived = Review::query()
            ->with(['reviewer:id,name,profile_image', 'job:id,title,status'])
            ->where('given_to', $user->id)
            ->latest('id')
            ->limit(50)
            ->get();
        $reviewsGiven = Review::query()
            ->with(['receiver:id,name,profile_image', 'job:id,title,status'])
            ->where('given_by', $user->id)
            ->latest('id')
            ->limit(50)
            ->get();
        $disputes = Dispute::query()
            ->with(['project:id,title,status', 'openedBy:id,name', 'againstUser:id,name'])
            ->where(fn ($query) => $query->where('opened_by', $user->id)->orWhere('against_user_id', $user->id))
            ->latest()
            ->limit(50)
            ->get();

        $viewData = compact('user', 'reviewsReceived', 'reviewsGiven', 'disputes');

        if ($user->user_type === 'freelancer') {
            $bids = Bid::query()
                ->with(['project.client:id,name,email', 'project.payment'])
                ->where('user_id', $user->id)
                ->orderByDesc('id')
                ->limit(50)
                ->get();
            $payments = Payment::query()
                ->with(['project:id,title,status', 'customer:id,name,email'])
                ->where('provider_id', $user->id)
                ->latest('id')
                ->limit(50)
                ->get();
            $serviceCatalogs = ServiceCatalog::query()
                ->with('category')
                ->where('provider_id', $user->id)
                ->latest('id')
                ->get();
            $bookings = ServiceBooking::query()
                ->with(['catalog:id,heading', 'client:id,name,email', 'project:id,title,status'])
                ->where('provider_id', $user->id)
                ->latest('id')
                ->limit(50)
                ->get();
            $withdrawals = WithdrawalRequest::query()
                ->where('provider_id', $user->id)
                ->latest()
                ->limit(50)
                ->get();

            $viewData += compact('bids', 'payments', 'serviceCatalogs', 'bookings', 'withdrawals');
            $viewData['stats'] = [
                'bids' => Bid::query()->where('user_id', $user->id)->count(),
                'hired' => Bid::query()->where('user_id', $user->id)->where('is_hired', true)->count(),
                'completed' => Bid::query()->where('user_id', $user->id)->whereHas('project', fn ($query) => $query->where('status', 'completed'))->count(),
                'earnings' => (float) Payment::query()->where('provider_id', $user->id)->where('status', Payment::STATUS_SUCCEEDED)->sum('provider_earnings'),
                'rating' => round((float) Review::query()->where('given_to', $user->id)->avg('star'), 1),
                'reviews' => Review::query()->where('given_to', $user->id)->count(),
            ];
        } else {
            $projects = Project::query()
                ->withCount('bids')
                ->with(['hiredBid.user:id,name,email', 'payment'])
                ->where('user_id', $user->id)
                ->orderByDesc('id')
                ->limit(50)
                ->get();
            $payments = Payment::query()
                ->with(['project:id,title,status', 'provider:id,name,email'])
                ->where('customer_id', $user->id)
                ->latest('id')
                ->limit(50)
                ->get();
            $bookings = ServiceBooking::query()
                ->with(['catalog:id,heading', 'provider:id,name,email', 'project:id,title,status'])
                ->where('client_id', $user->id)
                ->latest('id')
                ->limit(50)
                ->get();

            $viewData += compact('projects', 'payments', 'bookings');
            $viewData['stats'] = [
                'jobs' => Project::query()->where('user_id', $user->id)->count(),
                'open' => Project::query()->where('user_id', $user->id)->whereIn('status', ['active', 'pause'])->count(),
                'in_progress' => Project::query()->where('user_id', $user->id)->where('status', 'in progress')->count(),
                'completed' => Project::query()->where('user_id', $user->id)->where('status', 'completed')->count(),
                'spent' => (float) Payment::query()->where('customer_id', $user->id)->where('status', Payment::STATUS_SUCCEEDED)->sum('amount'),
                'reviews' => Review::query()->where('given_to', $user->id)->count(),
            ];
        }

        return view('admin.users.details', $viewData);
    }

    public function update_status(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => ['required', 'integer', 'in:0,1,2'],
        ]);
        $user = User::query()->whereIn('user_type', ['client', 'freelancer'])->findOrFail($id);

        DB::transaction(function () use ($user, $validated) {
            $user->update(['is_verified' => $validated['status']]);
            if ($user->proof) {
                $user->proof->update(['is_verified' => $validated['status']]);
            }
        });

        return response()->json(['status' => true]);
    }

    public function update_featured(Request $request, $id)
    {
        $request->validate([
            'featured' => 'required|boolean',
        ]);

        $user = User::query()
            ->where('user_type', 'freelancer')
            ->findOrFail($id);
        $featured = $request->boolean('featured');

        if ($featured && !$user->is_featured) {
            $featuredCount = User::query()
                ->where('user_type', 'freelancer')
                ->where('is_featured', true)
                ->count();

            if ($featuredCount >= 3) {
                return response()->json([
                    'status' => false,
                    'message' => 'Only 3 professionals can be featured on the home screen.',
                ], 422);
            }
        }

        $user->update(['is_featured' => $featured]);

        return response()->json([
            'status' => true,
            'message' => $featured
                ? 'Professional added to the home screen.'
                : 'Professional removed from the home screen.',
        ]);
    }

    public function store(Request $request)
    {
        $inputs = $request->all();
        // dd($inputs);
        unset($inputs['_token']);
        $inputs['is_verified'] = 1;
        $inputs['password'] = Hash::make($request->password); // Default password
        if($request->hasFile('image')){
            $file = $request->file('image');
            $filename = time().'_'.$file->getClientOriginalName();
            $file->move(public_path('uploads/user/'), $filename);
            $inputs['profile_photo'] = $filename;
        }
        $save = DB::table('user_profiles')->insert($inputs);
        return redirect()->route('admin.users.index');
    }

    public function edit($id)
    {
        return view('admin.users.edit', compact('id'));
    }

    public function update(Request $request, $id)
    {
        $inputs = $request->all();
        $user = DB::table('users')->where('id', $id)->first();
        unset($inputs['_token']);
        if($request->hasFile('profile')){
            @unlink(public_path('uploads/user/'.$user->profile));
            $file = $request->file('profile');
            $filename = time().'_'.$file->getClientOriginalName();
            $file->move(public_path('uploads/user/'), $filename);
            $inputs['profile'] = $filename;
        }
        $update = DB::table('users')->where('id', $id)->update($inputs);
        // Handle user update logic here
        return redirect()->back()->with('toastr', [
                'type' => 'success',
                'message' => 'User updated successfully.'
            ]);
    }

    public function delete($id)
    {
        $user = DB::table('users')->where('id', $id)->first();
        if($user){
            @unlink(public_path('uploads/user/'.$user->profile));
            DB::table('users')->where('id', $id)->delete();
        }
        return redirect()->back()->with('toastr', [
            'type' => 'success',
            'message' => 'User deleted successfully.'
        ]);
    }


}
