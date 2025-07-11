<h2>Applicants for: {{ $job->title }}</h2>

@if($applicants->isEmpty())
    <p>No applications yet.</p>
@else
    <table border="1" cellpadding="8">
        <thead>
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Applied On</th>
                <th>Resume</th>
            </tr>
        </thead>
        <tbody>
            @foreach($applicants as $applicant)
                <tr>
                    <td>{{ $applicant->name }}</td>
                    <td>{{ $applicant->email }}</td>
                    <td>{{ $applicant->phone }}</td>
                    <td>{{ $applicant->created_at->format('d M Y, h:i A') }}</td>
                    <td>
                        <a href="{{ asset('storage/' . $applicant->resume_path) }}" target="_blank">
                            Download
                        </a>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>
@endif
