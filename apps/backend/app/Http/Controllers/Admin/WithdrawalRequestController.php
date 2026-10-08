<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\WithdrawalRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class WithdrawalRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = WithdrawalRequest::query()->with('provider:id,name,email,phone,stripe_account_id');
        $status = $request->string('status')->toString();
        if (in_array($status, $this->statuses(), true)) {
            $query->where('status', $status);
        }

        $search = trim($request->string('search')->toString());
        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder->where('payment_reference', 'like', "%{$search}%")
                    ->orWhereHas('provider', fn ($provider) => $provider
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%"));
            });
        }

        return view('admin.withdrawals.index', [
            'withdrawals' => $query->latest()->paginate(25)->withQueryString(),
            'counts' => [
                'all' => WithdrawalRequest::query()->count(),
                'pending' => WithdrawalRequest::query()->where('status', WithdrawalRequest::STATUS_PENDING)->count(),
                'approved' => WithdrawalRequest::query()->where('status', WithdrawalRequest::STATUS_APPROVED)->count(),
                'paid' => WithdrawalRequest::query()->where('status', WithdrawalRequest::STATUS_PAID)->count(),
            ],
            'pendingAmount' => WithdrawalRequest::query()
                ->whereIn('status', [WithdrawalRequest::STATUS_PENDING, WithdrawalRequest::STATUS_APPROVED])
                ->sum('requested_amount'),
            'paidAmount' => WithdrawalRequest::query()
                ->where('status', WithdrawalRequest::STATUS_PAID)
                ->sum('requested_amount'),
        ]);
    }

    public function show(WithdrawalRequest $withdrawal)
    {
        $withdrawal->load([
            'provider:id,name,email,phone,profile_image,stripe_account_id,is_verified,street_address,city,state,country,pincode',
            'processedBy:id,name,email',
        ]);

        $payments = Payment::query()
            ->with('project:id,title,status')
            ->where('provider_id', $withdrawal->provider_id)
            ->where('status', Payment::STATUS_SUCCEEDED)
            ->latest('paid_at')
            ->limit(25)
            ->get();
        $balance = $this->providerBalance((int) $withdrawal->provider_id, $withdrawal->id);

        return view('admin.withdrawals.show', compact('withdrawal', 'payments', 'balance'));
    }

    public function updateStatus(Request $request, WithdrawalRequest $withdrawal)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in($this->statuses())],
            'payment_reference' => [
                Rule::requiredIf($request->input('status') === WithdrawalRequest::STATUS_PAID),
                'nullable',
                'string',
                'max:255',
            ],
            'admin_notes' => [
                Rule::requiredIf($request->input('status') === WithdrawalRequest::STATUS_REJECTED),
                'nullable',
                'string',
                'max:5000',
            ],
        ]);

        $messages = [
            WithdrawalRequest::STATUS_APPROVED => 'Withdrawal request approved. No automatic Stripe transfer was initiated.',
            WithdrawalRequest::STATUS_PAID => 'Withdrawal request marked as paid. No automatic Stripe transfer was initiated.',
            WithdrawalRequest::STATUS_REJECTED => 'Withdrawal request rejected.',
            WithdrawalRequest::STATUS_PENDING => 'Withdrawal request moved back to pending.',
        ];

        DB::transaction(function () use ($request, $withdrawal, $validated) {
            $locked = WithdrawalRequest::query()->lockForUpdate()->findOrFail($withdrawal->id);
            $allowedTransitions = [
                WithdrawalRequest::STATUS_PENDING => [WithdrawalRequest::STATUS_PENDING, WithdrawalRequest::STATUS_APPROVED, WithdrawalRequest::STATUS_REJECTED],
                WithdrawalRequest::STATUS_APPROVED => [WithdrawalRequest::STATUS_APPROVED, WithdrawalRequest::STATUS_PAID, WithdrawalRequest::STATUS_REJECTED],
                WithdrawalRequest::STATUS_PAID => [WithdrawalRequest::STATUS_PAID],
                WithdrawalRequest::STATUS_REJECTED => [WithdrawalRequest::STATUS_REJECTED, WithdrawalRequest::STATUS_PENDING],
            ];

            if (!in_array($validated['status'], $allowedTransitions[$locked->status] ?? [], true)) {
                throw ValidationException::withMessages([
                    'status' => 'This withdrawal status transition is not allowed.',
                ]);
            }

            if ($validated['status'] === WithdrawalRequest::STATUS_APPROVED) {
                $balance = $this->providerBalance((int) $locked->provider_id, $locked->id);
                if ((float) $locked->requested_amount > $balance['available']) {
                    throw ValidationException::withMessages([
                        'status' => 'The requested amount is greater than the provider available earnings.',
                    ]);
                }
            }

            $processed = in_array($validated['status'], [WithdrawalRequest::STATUS_PAID, WithdrawalRequest::STATUS_REJECTED], true);
            $locked->update([
                'status' => $validated['status'],
                'payment_reference' => $validated['payment_reference'] ?? $locked->payment_reference,
                'admin_notes' => $validated['admin_notes'] ?? null,
                'processed_by' => $processed ? $request->user()->id : null,
                'processed_at' => $processed ? now() : null,
            ]);
        });

        return redirect()->route('admin.withdrawals.show', $withdrawal)->with('toastr', [
            'type' => 'success',
            'message' => $messages[$validated['status']],
        ]);
    }

    private function providerBalance(int $providerId, ?int $exceptWithdrawalId = null): array
    {
        $totalEarnings = (float) Payment::query()
            ->where('provider_id', $providerId)
            ->where('status', Payment::STATUS_SUCCEEDED)
            ->sum('provider_earnings');

        $committedQuery = WithdrawalRequest::query()
            ->where('provider_id', $providerId)
            ->whereIn('status', [WithdrawalRequest::STATUS_APPROVED, WithdrawalRequest::STATUS_PAID]);
        if ($exceptWithdrawalId) {
            $committedQuery->where('id', '!=', $exceptWithdrawalId);
        }
        $committed = (float) $committedQuery->sum('requested_amount');

        return [
            'total_earnings' => $totalEarnings,
            'committed' => $committed,
            'available' => max(0, $totalEarnings - $committed),
        ];
    }

    private function statuses(): array
    {
        return [
            WithdrawalRequest::STATUS_PENDING,
            WithdrawalRequest::STATUS_APPROVED,
            WithdrawalRequest::STATUS_PAID,
            WithdrawalRequest::STATUS_REJECTED,
        ];
    }
}
