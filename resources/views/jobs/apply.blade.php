<h2>Apply for: {{ $job->title }}</h2>

@if(session('success'))
    <p>{{ session('success') }}</p>
@endif

@if($errors->any())
    <ul>
        @foreach($errors->all() as $e)
            <li>{{ $e }}</li>
        @endforeach
    </ul>
@endif

<form method="POST" action="{{ route('jobs.apply', $job) }}" enctype="multipart/form-data">
    @csrf
    <input name="name" placeholder="Full Name" required><br>
    <input name="email" placeholder="Email" required><br>
    <input name="phone" placeholder="Phone" required><br>
    <input type="file" name="resume" accept=".pdf" required><br>
    <button type="submit">Submit Application</button>
</form>
