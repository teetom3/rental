<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\BookingRequest;
use App\Models\BookingItem;
use App\Models\Equipment;
use Illuminate\Http\Request;
use App\Models\Booking;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{

    /**
     * Liste toutes les réservations de la company avec filtres
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $companyId = $user->company_id;

        $query = Booking::where('company_id', $companyId)
            ->with(['items.equipment']);

        // Filtre par statut
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filtre par période
        if ($request->has('start_date')) {
            $query->where('start_date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->where('end_date', '<=', $request->end_date);
        }

        // Tri par date de début (plus récentes en premier)
        $query->orderBy('start_date', 'desc');

        // Pagination (15 éléments par page)
        $bookings = $query->paginate(15);

        return response()->json($bookings);
    }

    /**
     * Crée une nouvelle réservation
     */
    public function store (BookingRequest $request){

        $user = $request->user();
        $companyId = $user->company_id;

        $data = $request->validated();

        $blockingStatuses = ['confirmed'];


        //Validation de la disponibilité 

        return DB::transaction(function() use ($companyId, $data, $blockingStatuses){


                   foreach($data['items'] as $item) {
            $equipmentId = (int) $item['equipment_id'];
            $qtyRequested = (int) $item['qty'];

            $equipment = Equipment::where('company_id', $companyId)
                ->where('id', $equipmentId)
                ->firstOrFail();


                        $alreadyBookedQty = BookingItem::query()
            ->join('bookings', 'bookings.id', '=', 'booking_items.booking_id')
            ->where('bookings.company_id' , $companyId)
            ->where('booking_items.equipment_id', $equipmentId)
            ->whereIn('bookings.status', $blockingStatuses)
            ->where('bookings.start_date', '<', $data['end_date'])
            ->where('bookings.end_date', '>', $data['start_date'])
            ->sum('booking_items.qty');

        $available = $equipment->total_qty - $alreadyBookedQty;

        if($qtyRequested >$available) {
            return response()->json(
                [ 'message' => 'Insufficient stock for one or more items',
                    'errors' => [
                        'items' => [[
                            'equipment_id' => $equipmentId,
                            'requested' => $qtyRequested,
                            'available' => $available
                        ]],
                    ]

                        ],422
                    );
        }
        }




                    $booking = Booking::create([
                'company_id' => $companyId,
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'status' => 'confirmed',
            ]);

            foreach ($data['items'] as $item){
                BookingItem::create([
                    'booking_id' => $booking->id,
                    'equipment_id' => (int) $item['equipment_id'],
                    'qty' => (int) $item['qty'],
                ]);
            }

            $booking->load('items.equipment');
            return response()->json($booking, 201);

        });
    }

    /**
     * Affiche une réservation spécifique
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $companyId = $user->company_id;

        $booking = Booking::where('company_id', $companyId)
            ->where('id', $id)
            ->with(['items.equipment'])
            ->firstOrFail();

        return response()->json($booking);
    }

    /**
     * Vérifie la disponibilité des équipements pour une période donnée
     * (sans créer de réservation)
     */
    public function checkAvailability(BookingRequest $request)
    {
        $user = $request->user();
        $companyId = $user->company_id;
        $data = $request->validated();

        $blockingStatuses = ['confirmed'];
        $availabilityDetails = [];
        $allAvailable = true;

        foreach($data['items'] as $item) {
            $equipmentId = (int) $item['equipment_id'];
            $qtyRequested = (int) $item['qty'];

            // Récupère l'équipement
            $equipment = Equipment::where('company_id', $companyId)
                ->where('id', $equipmentId)
                ->first();

            if (!$equipment) {
                $availabilityDetails[] = [
                    'equipment_id' => $equipmentId,
                    'available' => false,
                    'reason' => 'Equipment not found',
                    'requested' => $qtyRequested,
                    'available_qty' => 0
                ];
                $allAvailable = false;
                continue;
            }

            // Calcul du stock déjà réservé sur la période
            $alreadyBookedQty = BookingItem::query()
                ->join('bookings', 'bookings.id', '=', 'booking_items.booking_id')
                ->where('bookings.company_id', $companyId)
                ->where('booking_items.equipment_id', $equipmentId)
                ->whereIn('bookings.status', $blockingStatuses)
                ->where('bookings.start_date', '<', $data['end_date'])
                ->where('bookings.end_date', '>', $data['start_date'])
                ->sum('booking_items.qty');

            $availableQty = $equipment->total_qty - $alreadyBookedQty;
            $isAvailable = $qtyRequested <= $availableQty;

            if (!$isAvailable) {
                $allAvailable = false;
            }

            $availabilityDetails[] = [
                'equipment_id' => $equipmentId,
                'equipment_name' => $equipment->name,
                'available' => $isAvailable,
                'requested' => $qtyRequested,
                'available_qty' => $availableQty,
                'total_qty' => $equipment->total_qty,
                'already_booked' => $alreadyBookedQty
            ];
        }

        return response()->json([
            'available' => $allAvailable,
            'details' => $availabilityDetails,
            'period' => [
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date']
            ]
        ]);
    }


    /**
     * Annule une réservation (soft delete)
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $companyId = $user->company_id;

        $booking = Booking::where('company_id', $companyId)
            ->where('id', $id)
            ->firstOrFail();

        // Change le statut à "cancelled" au lieu de supprimer
        $booking->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Booking cancelled successfully',
            'booking' => $booking
        ]);
    }

    /**
     * Marque une réservation comme terminée (retour du matériel confirmé)
     */
    public function markAsCompleted(Request $request, $id)
    {
        $user = $request->user();
        $companyId = $user->company_id;

        $booking = Booking::where('company_id', $companyId)
            ->where('id', $id)
            ->firstOrFail();

        // Vérifie que la réservation est bien confirmée
        if ($booking->status !== 'confirmed') {
            return response()->json([
                'message' => 'Only confirmed bookings can be marked as completed',
                'current_status' => $booking->status
            ], 400);
        }

        // Marque comme terminée
        $booking->update(['status' => 'completed']);

        return response()->json([
            'message' => 'Booking marked as completed successfully',
            'booking' => $booking
        ]);
    }
}
