<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'required',
                'email',
                Rule::unique('users', 'email')->ignore($userId),
            ],

            'password' => [
                $this->isMethod('post') ? 'required' : 'nullable',
                'string',
                'min:8',
                'confirmed',
            ],

            // 🔥 ADD THESE (MOST IMPORTANT)
            'experience' => [
                'nullable',
                'integer',
                'min:0',
            ],

            'price_per_minute' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'bio' => [
                'nullable',
                'string',
            ],
        ];
    }
}
