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
        'email',
        'first_name',
        'last_name',
        'role',
        'batch_year',
        'course',
        'is_verified',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
    ];

    /**
     * Use UUID primary keys.
     */
    protected $keyType = 'string';
    public $incrementing = false;

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
        return $this->hasMany(BatchMessage::class, 'sender_id');
    }

    /**
     * Get profile record.
     */
    public function profile()
    {
        return $this->hasOne(UserProfile::class);
    }

    /**
     * Direct messages sent by user.
     */
    public function sentMessages()
    {
        return $this->hasMany(DirectMessage::class, 'sender_id');
    }

    /**
     * Direct messages received by user.
     */
    public function receivedMessages()
    {
        return $this->hasMany(DirectMessage::class, 'recipient_id');
    }
} 