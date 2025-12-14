<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Equipment extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
        'description',
        'total_qty',
        // ⚠️ pas company_id ici non plus
    ];

    /**
     * Relations
     */

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
