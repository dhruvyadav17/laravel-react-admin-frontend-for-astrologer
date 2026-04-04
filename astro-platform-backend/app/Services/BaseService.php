<?php
// PATH: app/Services/BaseService.php
// NEW FILE — AstrologerService, ReviewService is abstract class ko extend karte hain
// Provides: model(), delete(), restore() methods

namespace App\Services;

use Illuminate\Database\Eloquent\Model;

abstract class BaseService
{
    /**
     * Return the model class string.
     * Child service mein override karo.
     * Example: return Astrologer::class;
     */
    abstract protected function model(): string;

    /**
     * Soft delete
     */
    public function delete(Model $model): void
    {
        $model->delete();
    }

    /**
     * Restore soft-deleted record
     */
    public function restore(int $id): Model
    {
        $modelClass = $this->model();
        $record = $modelClass::withTrashed()->findOrFail($id);
        $record->restore();
        return $record->fresh();
    }

    /**
     * Find by ID
     */
    public function find(int $id): Model
    {
        return ($this->model())::findOrFail($id);
    }
}