<?php

namespace App\Http\Controllers;

use App\Models\JobOpportunity;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class JobOpportunityController extends Controller
{
    public function index()
    {
        return response()->json(
            JobOpportunity::where('is_active', true)->orderByDesc('created_at')->get()
        );
    }

    public function show(string $id)
    {
        return response()->json(JobOpportunity::findOrFail($id));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'company' => 'required|string',
            'location' => 'required|string',
            'job_type' => 'required|in:Full-time,Part-time,Contract,Internship',
            'salary_range' => 'nullable|string',
            'requirements' => 'nullable|string',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string',
            'application_deadline' => 'nullable|date',
            'is_active' => 'boolean',
            'posted_by' => 'required|uuid',
        ]);

        $job = new JobOpportunity($data);
        $job->id = (string) Str::uuid();
        $job->save();
        return response()->json($job, 201);
    }

    public function update(Request $request, string $id)
    {
        $job = JobOpportunity::findOrFail($id);
        $data = $request->validate([
            'title' => 'sometimes|string',
            'description' => 'sometimes|string',
            'company' => 'sometimes|string',
            'location' => 'sometimes|string',
            'job_type' => 'sometimes|in:Full-time,Part-time,Contract,Internship',
            'salary_range' => 'nullable|string',
            'requirements' => 'nullable|string',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string',
            'application_deadline' => 'nullable|date',
            'is_active' => 'boolean',
        ]);
        $job->fill($data);
        $job->save();
        return response()->json($job);
    }

    public function destroy(string $id)
    {
        $job = JobOpportunity::findOrFail($id);
        $job->delete();
        return response()->json(['deleted' => true]);
    }
}


