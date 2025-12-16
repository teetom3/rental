<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class BookingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',

            'items' => 'required|array|min:1',
            'items.*.equipment_id' => 'required|integer|exists:equipments,id',
            'items.*.qty' => 'required|integer|min:1'
        ];
    }
}
