<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Client\BaseClientController;
use App\Models\Bid;
use App\Models\ChatConversation;
use App\Models\Project;
use App\Models\ServiceBooking;
use App\Models\ServiceCatalog;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ServiceBookingController extends BaseClientController
{
    use ApiResponse;

    public function clientIndex(Request $request)
    {
        if ($check = $this->checkClient()) {
            return $check;
        }

        $validator = Validator::make($request->all(), [
            'catalog_id' => 'nullable|integer|exists:service_catalogs,id',
        ]);
        if ($validator->fails()) {
            return $this->error('Validation error.', 422, $validator->errors());
        }

        $query = ServiceBooking::query()
            ->where('client_id', $request->user()->id)
            ->with(['catalog', 'client:id,name,profile_image', 'provider:id,name,profile_image'])
            ->latest();

        if ($request->filled('catalog_id')) {
            $query->where('service_catalog_id', (int) $request->integer('catalog_id'));
        }

        $bookings = $query->get()->map(fn (ServiceBooking $booking) => $this->bookingData($booking, $request));

        return $this->success(['bookings' => $bookings], 'Service bookings retrieved successfully.');
    }

    public function store(Request $request)
    {
        if ($check = $this->checkClient()) {
            return $check;
        }

        $validator = Validator::make($request->all(), [
            'catalog_id' => 'required|integer|exists:service_catalogs,id',
            'note' => 'nullable|string|max:2000',
        ]);
        if ($validator->fails()) {
            return $this->error('Validation error.', 422, $validator->errors());
        }

        $catalog = ServiceCatalog::query()
            ->where('status', true)
            ->with('provider:id,name,user_type,profile_image')
            ->find((int) $request->integer('catalog_id'));

        if (!$catalog || !$catalog->provider || $catalog->provider->user_type !== 'freelancer') {
            return $this->error('Service is not available.', 404);
        }

        $existing = ServiceBooking::query()
            ->where('client_id', $request->user()->id)
            ->where('service_catalog_id', $catalog->id)
            ->whereIn('status', ['pending', 'accepted'])
            ->latest()
            ->first();

        if ($existing) {
            $message = $existing->status === 'pending'
                ? 'A booking request for this service is already pending.'
                : 'This service booking has already been accepted.';

            return $this->error($message, 409, [
                'booking' => $this->bookingData($existing->load(['catalog', 'client', 'provider']), $request),
            ]);
        }

        $note = trim((string) $request->input('note', ''));
        $booking = ServiceBooking::create([
            'service_catalog_id' => $catalog->id,
            'client_id' => $request->user()->id,
            'provider_id' => $catalog->provider_id,
            'note' => $note !== '' ? $note : null,
            'price' => $catalog->price,
            'status' => 'pending',
        ]);
        $booking->load(['catalog', 'client:id,name,profile_image', 'provider:id,name,profile_image']);

        return $this->success(
            ['booking' => $this->bookingData($booking, $request)],
            'Service request sent to the freelancer.',
            201
        );
    }

    public function providerIndex(Request $request)
    {
        if (!$request->user() || $request->user()->user_type !== 'freelancer') {
            return $this->error('Only freelancers can view service requests.', 403);
        }

        $bookings = ServiceBooking::query()
            ->where('provider_id', $request->user()->id)
            ->with(['catalog', 'client:id,name,profile_image', 'provider:id,name,profile_image'])
            ->orderByRaw("CASE WHEN status = 'pending' THEN 0 ELSE 1 END")
            ->latest()
            ->get()
            ->map(fn (ServiceBooking $booking) => $this->bookingData($booking, $request));

        return $this->success([
            'bookings' => $bookings,
            'pending_count' => $bookings->where('status', 'pending')->count(),
        ], 'Service requests retrieved successfully.');
    }

    public function respond(Request $request, ServiceBooking $booking)
    {
        if (!$request->user() || $request->user()->user_type !== 'freelancer') {
            return $this->error('Only freelancers can respond to service requests.', 403);
        }
        if ((int) $booking->provider_id !== (int) $request->user()->id) {
            return $this->error('Service request not found.', 404);
        }

        $validator = Validator::make($request->all(), [
            'action' => 'required|in:accept,reject',
        ]);
        if ($validator->fails()) {
            return $this->error('Validation error.', 422, $validator->errors());
        }
        if ($booking->status !== 'pending') {
            return $this->error('This service request has already been answered.', 409);
        }

        $action = (string) $request->input('action');
        $booking = DB::transaction(function () use ($booking, $action, $request) {
            $locked = ServiceBooking::query()->lockForUpdate()->findOrFail($booking->id);
            if ($locked->status !== 'pending') {
                return $locked;
            }

            if ($action === 'reject') {
                $locked->update(['status' => 'rejected', 'responded_at' => now()]);
                return $locked;
            }

            $catalog = ServiceCatalog::query()->findOrFail($locked->service_catalog_id);
            $description = $catalog->description;
            if ($locked->note) {
                $description .= "\n\nCustomer instructions: ".$locked->note;
            }

            $project = Project::create([
                'title' => $catalog->heading,
                'slug' => Str::slug($catalog->heading).'-booking-'.$locked->id.'-'.time(),
                'category' => $catalog->category_id ? (string) $catalog->category_id : null,
                'description' => $description,
                'budget' => $locked->price,
                'status' => 'in progress',
                'user_id' => $locked->client_id,
            ]);

            Bid::create([
                'user_id' => $locked->provider_id,
                'project_id' => $project->id,
                'bid_amount' => $locked->price,
                'freelancer_name' => $request->user()->name,
                'freelancer_image' => $request->user()->profile_image,
                'date_time' => now(),
                'is_hired' => 1,
            ]);

            $conversation = ChatConversation::query()->firstOrCreate(
                ['conversation_key' => "booking:{$locked->id}:{$locked->client_id}:{$locked->provider_id}"],
                [
                    'project_id' => $project->id,
                    'client_id' => $locked->client_id,
                    'provider_id' => $locked->provider_id,
                ]
            );

            $locked->update([
                'status' => 'accepted',
                'project_id' => $project->id,
                'conversation_id' => $conversation->id,
                'responded_at' => now(),
            ]);

            return $locked;
        });

        $booking->load(['catalog', 'client:id,name,profile_image', 'provider:id,name,profile_image']);
        $message = $booking->status === 'accepted'
            ? 'Service request accepted. The job and chat are now active.'
            : 'Service request rejected.';

        return $this->success(['booking' => $this->bookingData($booking, $request)], $message);
    }

    private function bookingData(ServiceBooking $booking, Request $request): array
    {
        $images = $booking->catalog?->images ?? [];

        return [
            'id' => $booking->id,
            'catalog_id' => $booking->service_catalog_id,
            'service_title' => $booking->catalog?->heading,
            'service_image' => isset($images[0]) ? $this->absoluteUrl($request, $images[0]) : null,
            'price' => $booking->price,
            'note' => $booking->note,
            'status' => $booking->status,
            'project_id' => $booking->project_id,
            'conversation_id' => $booking->conversation_id,
            'client' => [
                'id' => $booking->client?->id,
                'name' => $booking->client?->name,
                'profile_image' => $this->absoluteUrl($request, $booking->client?->profile_image),
            ],
            'provider' => [
                'id' => $booking->provider?->id,
                'name' => $booking->provider?->name,
                'profile_image' => $this->absoluteUrl($request, $booking->provider?->profile_image),
            ],
            'responded_at' => $booking->responded_at?->toISOString(),
            'created_at' => $booking->created_at?->toISOString(),
            'updated_at' => $booking->updated_at?->toISOString(),
        ];
    }

    private function absoluteUrl(Request $request, ?string $path): ?string
    {
        if (!$path || filter_var($path, FILTER_VALIDATE_URL)) {
            return $path;
        }

        return $request->root().'/'.ltrim(preg_replace('#^/?public/#', '', $path), '/');
    }
}
