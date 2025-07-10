<h2>Available Jobs</h2>

@foreach($jobs as $job)
    <div>
        <h3>{{ $job->title }}</h3>
        <p>{{ $job->location }} | ₹{{ $job->salary }}</p>
        <a href="{{ route('jobs.show', $job) }}">View & Apply</a>
    </div>
@endforeach
