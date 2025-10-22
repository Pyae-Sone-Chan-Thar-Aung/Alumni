<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\News;
use App\Models\JobOpportunity;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function users()
    {
        return response()->json(User::orderBy('created_at','desc')->get());
    }

    public function approveUser(string $id)
    {
        $user = User::findOrFail($id);
        $user->is_verified = true;
        $user->save();
        return response()->json($user);
    }

    public function rejectUser(string $id)
    {
        $user = User::findOrFail($id);
        $user->is_verified = false;
        $user->save();
        return response()->json($user);
    }

    public function dashboard()
    {
        return response()->json([
            'users' => User::count(),
            'news' => News::count(),
            'jobs' => JobOpportunity::count(),
        ]);
    }

    public function statistics()
    {
        return $this->dashboard();
    }
}


