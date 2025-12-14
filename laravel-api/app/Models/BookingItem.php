<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingItem extends Model
{

    use HasFactory;


    protected $fillable = [
        'booking_id',
        'equipment_id',
        'qty'

    ];


    public function booking(): BelongsTo{
        return $this->belongsTo(Booking::class);
    }

    public function equipment():BelongsTo{
        return $this->belongsTo(Equipment::class);
    }

}
