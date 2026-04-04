<?php
// PATH: app/Http/Requests/ReviewRequest.php
// NEW FILE — Review submit validation

namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class ReviewRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'rating'  => 'required|integer|min:1|max:5',
            'comment' => 'sometimes|nullable|string|min:10|max:500',
        ];
    }
}