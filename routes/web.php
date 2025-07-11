<?php

use App\Http\Controllers\ApplicationController;
use App\Models\Job;
use App\Models\Application;

// Public job listings
Route::get('/', function () {
    $jobs = Job::where('is_open', true)->latest()->get();
    return view('jobs.index', compact('jobs'));
})->name('jobs.public');

// Job detail + apply form
Route::get('/jobs/{job}', [ApplicationController::class, 'show'])->name('jobs.show');
Route::post('/jobs/{job}/apply', [ApplicationController::class, 'apply'])->name('jobs.apply');

Route::get('/admin/jobs/{job}/applicants', function (\App\Models\Job $job) {
    $applicants = $job->applications()->latest()->get();
    return view('admin.applicants', compact('job', 'applicants'));
})->name('admin.applicants');