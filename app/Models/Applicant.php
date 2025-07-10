<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Applicant extends Model
{
    protected $fillable = [
        'job_id', 'name', 'email', 'phone', 'resume_path'
    ];

    public function job()
    {
        return $this->belongsTo(Job::class);
    }
}

