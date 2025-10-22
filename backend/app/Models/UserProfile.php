<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserProfile extends Model
{
    use HasFactory;

    protected $table = 'user_profiles';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'user_id','phone','address','current_job','company','bio',
        'profile_image_url','linkedin_url','github_url','website_url'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}


