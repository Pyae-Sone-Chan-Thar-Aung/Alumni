<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'phone',
        'batch',
        'course',
        'graduation_year',
        'current_job',
        'company',
        'address',
        'city',
        'country',
        'profile_image',
        'role',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Get the user's full name.
     */
    public function getFullNameAttribute()
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    /**
     * Get the user's name attribute.
     */
    public function getNameAttribute()
    {
        return $this->full_name;
    }

    /**
     * Check if user is admin.
     */
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is approved.
     */
    public function isApproved()
    {
        return $this->status === 'approved';
    }

    /**
     * Get job opportunities posted by this user.
     */
    public function jobOpportunities()
    {
        return $this->hasMany(JobOpportunity::class, 'posted_by');
    }

    /**
     * Get batch messages by this user.
     */
    public function batchMessages()
    {
        return $this->hasMany(BatchMessage::class);
    }
} 