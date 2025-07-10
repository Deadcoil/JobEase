<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    protected $fillable = [
        'title', 'description', 'location', 'skills', 'salary', 'deadline', 'is_open'
    ];

    public function applicants()
    {
        return $this->hasMany(Applicant::class);
    }
}
