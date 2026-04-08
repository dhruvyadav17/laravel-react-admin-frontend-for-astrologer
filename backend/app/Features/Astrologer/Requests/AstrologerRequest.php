<?php

namespace App\Features\Astrologer\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AstrologerRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $isUpdate = $this->isMethod('PUT') || $this->isMethod('PATCH');
        $req      = $isUpdate ? 'sometimes' : 'required';
        $userId   = $this->route('astrologer')?->user_id;

        return [
            'name'              => "{$req}|string|max:100",
            'email'             => "{$req}|email|unique:users,email,{$userId}",
            'experience'        => "{$req}|integer|min:0|max:50",
            'price_per_minute'  => "{$req}|numeric|min:1|max:10000",
            'bio'               => "{$req}|string|min:20|max:1000",
            'expertise'         => "{$req}|string|max:200",
            'languages'         => 'sometimes|array|min:1',
            'languages.*'       => 'string|max:50',
            'skills'            => 'sometimes|array',
            'skills.*'          => 'string|max:50',
            'consultation_type' => 'sometimes|in:chat,call,video,all',  // NEW
            'is_verified' => 'prohibited_if:role,astrologer',
            'is_available'      => 'sometimes|boolean',                  // NEW
            'profile_image'     => 'sometimes|nullable|url|max:500',
            'gallery'           => 'sometimes|array|max:10',             // NEW
            'gallery.*'         => 'url|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'experience.max'        => 'Experience cannot exceed 50 years.',
            'price_per_minute.min'  => 'Price must be at least ₹1/min.',
            'bio.min'               => 'Bio must be at least 20 characters.',
            'gallery.max'           => 'Maximum 10 gallery images allowed.',
        ];
    }
}