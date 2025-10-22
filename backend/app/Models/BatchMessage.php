<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BatchMessage extends Model
{
    use HasFactory;

    protected $table = 'batch_messages';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'batch_group_id','sender_id','message'
    ];

    public function group()
    {
        return $this->belongsTo(BatchGroup::class, 'batch_group_id');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}


