<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Dispute;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DisputeController extends Controller
{
    public function index(Request $request)
    {
        $query = Dispute::query()->with([
            'project:id,title,status',
            'openedBy:id,name,email,user_type',
            'againstUser:id,name,email,user_type',
        ]);

        $status = $request->string('status')->toString();
        if (in_array($status, $this->statuses(), true)) {
            $query->where('status', $status);
        }

        $search = trim($request->string('search')->toString());
        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder->where('subject', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('project', fn ($project) => $project->where('title', 'like', "%{$search}%"))
                    ->orWhereHas('openedBy', fn ($user) => $user->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"))
                    ->orWhereHas('againstUser', fn ($user) => $user->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
            });
        }

        return view('admin.disputes.index', [
            'disputes' => $query->latest()->paginate(25)->withQueryString(),
            'counts' => [
                'all' => Dispute::query()->count(),
                'open' => Dispute::query()->where('status', Dispute::STATUS_OPEN)->count(),
                'in_review' => Dispute::query()->where('status', Dispute::STATUS_IN_REVIEW)->count(),
                'resolved' => Dispute::query()->where('status', Dispute::STATUS_RESOLVED)->count(),
            ],
        ]);
    }

    public function show(Dispute $dispute)
    {
        $dispute->load([
            'project.client:id,name,email,phone,user_type',
            'project.hiredBid.user:id,name,email,phone,user_type',
            'payment:id,project_id,transaction_id,amount,commission_amount,provider_earnings,status,paid_at',
            'openedBy:id,name,email,phone,user_type',
            'againstUser:id,name,email,phone,user_type',
            'resolvedBy:id,name,email',
        ]);

        return view('admin.disputes.show', compact('dispute'));
    }

    public function updateStatus(Request $request, Dispute $dispute)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in($this->statuses())],
            'resolution_notes' => [
                Rule::requiredIf(in_array($request->input('status'), [Dispute::STATUS_RESOLVED, Dispute::STATUS_REJECTED], true)),
                'nullable',
                'string',
                'max:5000',
            ],
        ]);

        $isClosed = in_array($validated['status'], [Dispute::STATUS_RESOLVED, Dispute::STATUS_REJECTED], true);
        $dispute->update([
            'status' => $validated['status'],
            'resolution_notes' => $validated['resolution_notes'] ?? null,
            'resolved_by' => $isClosed ? $request->user()->id : null,
            'resolved_at' => $isClosed ? now() : null,
        ]);

        return redirect()->route('admin.disputes.show', $dispute)->with('toastr', [
            'type' => 'success',
            'message' => 'Dispute status updated successfully.',
        ]);
    }

    private function statuses(): array
    {
        return [
            Dispute::STATUS_OPEN,
            Dispute::STATUS_IN_REVIEW,
            Dispute::STATUS_RESOLVED,
            Dispute::STATUS_REJECTED,
        ];
    }
}
