<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobOpportunity extends Model
{
    use HasFactory;

    protected $table = 'job_opportunities';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'title','description','company','location','job_type','salary_range','requirements',
        'contact_email','contact_phone','application_deadline','is_active','posted_by'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'application_deadline' => 'date',
    ];

    public function poster()
    {
        return $this->belongsTo(User::class, 'posted_by');
    }
}


