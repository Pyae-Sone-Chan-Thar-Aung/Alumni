<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class News extends Model
{
    use HasFactory;

    protected $table = 'news';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'title', 'content', 'category', 'image_url', 'author',
        'is_important', 'is_published', 'published_at'
    ];

    protected $casts = [
        'is_important' => 'boolean',
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];
}


