<?php
// BEFORE: min:6 only -- '123456' was valid
// AFTER:  min:8, uppercase, lowercase, number, special char required

namespace App\Domains\Auth\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'     => ['required', 'string', 'min:2', 'max:100'],
            'email'    => ['required', 'email', 'unique:users,email', 'max:255'],
            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->mixedCase()    // uppercase + lowercase
                    ->numbers()      // at least 1 number
                    ->symbols()      // at least 1 special char (@!#$ etc)
                    ->uncompromised(), // HaveIBeenPwned check
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.min'              => 'Name must be at least 2 characters.',
            'email.unique'          => 'This email is already registered.',
            'password.confirmed'    => 'Passwords do not match.',
            'password.min'          => 'Password must be at least 8 characters.',
        ];
    }
}
