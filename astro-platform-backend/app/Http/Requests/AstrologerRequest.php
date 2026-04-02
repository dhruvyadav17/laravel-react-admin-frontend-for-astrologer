<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AstrologerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'experience' => ['required', 'integer', 'min:0'],
            'price_per_minute' => ['required', 'numeric', 'min:0'],

            'bio' => ['nullable', 'string'],
            'expertise' => ['nullable', 'string'],

            'languages' => ['nullable', 'array'],
            'languages.*' => ['string'],

            'skills' => ['nullable', 'array'],
            'skills.*' => ['string'],
        ];
    }
}
