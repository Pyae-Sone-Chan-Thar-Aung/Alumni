<?php

namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class NewsController extends Controller
{
    public function index(Request $request)
    {
        $query = News::query();
        if ($request->boolean('published_only', true)) {
            $query->where('is_published', true);
        }
        return response()->json($query->orderByDesc('published_at')->get());
    }

    public function show(string $id)
    {
        $news = News::findOrFail($id);
        return response()->json($news);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
            'category' => 'nullable|string',
            'image_url' => 'nullable|string',
            'author' => 'nullable|string',
            'is_published' => 'boolean',
            'is_important' => 'boolean',
            'published_at' => 'nullable|date',
        ]);

        $news = new News($data);
        $news->id = (string) Str::uuid();
        if (!isset($data['published_at']) && ($data['is_published'] ?? false)) {
            $news->published_at = now();
        }
        $news->save();
        return response()->json($news, 201);
    }

    public function update(Request $request, string $id)
    {
        $news = News::findOrFail($id);
        $data = $request->validate([
            'title' => 'sometimes|string',
            'content' => 'sometimes|string',
            'category' => 'nullable|string',
            'image_url' => 'nullable|string',
            'author' => 'nullable|string',
            'is_published' => 'boolean',
            'is_important' => 'boolean',
            'published_at' => 'nullable|date',
        ]);
        $news->fill($data);
        $news->save();
        return response()->json($news);
    }

    public function destroy(string $id)
    {
        $news = News::findOrFail($id);
        $news->delete();
        return response()->json(['deleted' => true]);
    }
}


