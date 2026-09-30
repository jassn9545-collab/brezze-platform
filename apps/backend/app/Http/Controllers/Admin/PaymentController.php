<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;

class PaymentController extends Controller
{
    public function index()
    {
        $payments = Payment::query()
            ->with([
                'project:id,title',
                'customer:id,name,email',
                'provider:id,name,email',
            ])
            ->latest()
            ->paginate(25);

        $successful = Payment::query()->where('status', Payment::STATUS_SUCCEEDED);

        return view('admin.payment.index', [
            'payments' => $payments,
            'totalCollected' => (clone $successful)->sum('amount'),
            'totalCommission' => (clone $successful)->sum('commission_amount'),
            'totalProviderEarnings' => (clone $successful)->sum('provider_earnings'),
        ]);
    }
}
