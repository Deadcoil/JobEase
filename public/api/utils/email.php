<?php
// api/utils/email.php - Email utility functions

// This file would contain functions for sending emails, e.g., using PHPMailer or a similar library.
// For now, it's a placeholder. In a real application, you'd configure an SMTP server or a transactional email service.

function sendApplicationConfirmationEmail($applicantEmail, $jobTitle) {
    // Placeholder for sending email
    error_log("Simulating sending application confirmation email to: $applicantEmail for job: $jobTitle");
    // In a real scenario, you would use a library like PHPMailer or a service like SendGrid/Mailgun
    // Example (conceptual):
    /*
    require 'path/to/PHPMailerAutoload.php';
    $mail = new PHPMailer;
    $mail->isSMTP();
    $mail->Host = 'smtp.example.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'your_email@example.com';
    $mail->Password = 'your_password';
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;
    $mail->setFrom('no-reply@jobease.com', 'JobEase');
    $mail->addAddress($applicantEmail);
    $mail->isHTML(true);
    $mail->Subject = 'Your Job Application for ' . $jobTitle . ' at JobEase';
    $mail->Body    = 'Dear Applicant,<br><br>Thank you for your application for the <b>' . htmlspecialchars($jobTitle) . '</b> position at JobEase. We have received your application and will review it shortly.<br><br>Sincerely,<br>The JobEase Team';
    $mail->send();
    */
    return true; // Assume success for now
}

function sendAdminNotificationEmail($jobTitle, $applicantName) {
    // Placeholder for sending admin notification email
    error_log("Simulating sending admin notification email for new application: $applicantName for job: $jobTitle");
    // In a real scenario, you would send this to an admin email address
    return true; // Assume success for now
}
