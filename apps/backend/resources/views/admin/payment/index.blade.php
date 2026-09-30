@extends('admin.layouts.admin')

@section('title', 'Payments')

@section('content')
<div class="block-header">
    <div class="row">
        <div class="col-lg-6 col-md-6 col-sm-12">
            <h2 class="user-name">Payments</h2>
            <ul class="breadcrumb">
                <li class="breadcrumb-item"><a href="{{ route('admin.dashboard') }}"><i class="fa fa-dashboard"></i></a></li>
                <li class="breadcrumb-item active">Payment History</li>
            </ul>
        </div>
    </div>
</div>

<div class="row clearfix">
    <div class="col-lg-4 col-md-6 col-sm-12">
        <div class="card"><div class="body"><small>Total Collected</small><h4 class="mb-0">AUD {{ number_format((float) $totalCollected, 2) }}</h4></div></div>
    </div>
    <div class="col-lg-4 col-md-6 col-sm-12">
        <div class="card"><div class="body"><small>Admin Commission (10%)</small><h4 class="mb-0 text-success">AUD {{ number_format((float) $totalCommission, 2) }}</h4></div></div>
    </div>
    <div class="col-lg-4 col-md-6 col-sm-12">
        <div class="card"><div class="body"><small>Provider Earnings (90%)</small><h4 class="mb-0">AUD {{ number_format((float) $totalProviderEarnings, 2) }}</h4></div></div>
    </div>
</div>

<div class="row clearfix">
    <div class="col-lg-12">
        <div class="card">
            <div class="body">
                <div class="table-responsive">
                    <table class="table table-bordered table-hover table-custom mb-0">
                        <thead>
                            <tr>
                                <th>Transaction</th>
                                <th>Job</th>
                                <th>Customer</th>
                                <th>Provider</th>
                                <th>Amount</th>
                                <th>Commission</th>
                                <th>Provider Earnings</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($payments as $payment)
                                <tr>
                                    <td class="text-nowrap">{{ $payment->transaction_id ?: $payment->stripe_payment_intent_id ?: '—' }}</td>
                                    <td>#{{ $payment->project_id }} {{ $payment->project->title ?? 'Deleted job' }}</td>
                                    <td>{{ $payment->customer->name ?? '—' }}<br><small>{{ $payment->customer->email ?? '' }}</small></td>
                                    <td>{{ $payment->provider->name ?? '—' }}<br><small>{{ $payment->provider->email ?? '' }}</small></td>
                                    <td class="text-nowrap">AUD {{ number_format((float) $payment->amount, 2) }}</td>
                                    <td class="text-nowrap">AUD {{ number_format((float) $payment->commission_amount, 2) }}</td>
                                    <td class="text-nowrap">AUD {{ number_format((float) $payment->provider_earnings, 2) }}</td>
                                    <td><span class="badge badge-{{ $payment->status === 'succeeded' ? 'success' : ($payment->status === 'failed' ? 'danger' : ($payment->status === 'cancelled' ? 'secondary' : 'warning')) }}">{{ ucfirst($payment->status) }}</span></td>
                                    <td class="text-nowrap">{{ optional($payment->paid_at ?: $payment->created_at)->format('d M Y, h:i A') }}</td>
                                </tr>
                            @empty
                                <tr><td colspan="9" class="text-center py-4">No payments found.</td></tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                <div class="mt-3">{{ $payments->links() }}</div>
            </div>
        </div>
    </div>
</div>
@endsection
