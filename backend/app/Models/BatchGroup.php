<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BatchGroup extends Model
{
    use HasFactory;

    protected $table = 'batch_groups';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'batch_year','course','group_name','description','created_by'
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function messages()
    {
        return $this->hasMany(BatchMessage::class, 'batch_group_id');
    }
}


