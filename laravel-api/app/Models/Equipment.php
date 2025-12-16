<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Equipment extends Model
{
    use HasFactory;

    protected $table = 'equipments';

    protected $fillable = [
        'name',
        'category',
        'description',
        'total_qty',
        'company_id',
    ];

    /**
     * Relations
     */

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function bookingItems(): HasMany
{
    return $this->hasMany(BookingItem::class);
}
}
