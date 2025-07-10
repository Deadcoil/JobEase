<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ApplicationController extends Controller
{
    public function show(Job $job)
    {
        return view('jobs.apply', compact('job'));
    }

    public function apply(Request $request, Job $job)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email',
            'phone' => 'required',
            'resume' => 'required|mimes:pdf|max:2048',
        ]);

        // Check for duplicate
        if (Application::where('job_id', $job->id)->where('email', $request->email)->exists()) {
            return back()->withErrors(['You have already applied for this job.']);
        }

        // Save resume
        $resumePath = $request->file('resume')->store('resumes', 'public');

        // Save application
        Application::create([
            'job_id' => $job->id,
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'resume_path' => $resumePath,
        ]);

        return back()->with('success', 'Application submitted successfully!');
    }
}
