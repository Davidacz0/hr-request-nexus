import emailTemplate from '@/utils/emailTemplate';
import emailjs from 'emailjs-com';

export async function sendSurveyEmail(
    toEmail: string,
    projectId: string,
    emailId: string,
    projectName: string,
) {
    const { subject, html, text } = emailTemplate(projectId, emailId);
    const resp = await emailjs.send(
        'service_zcsb5jd',
        'template_yuv9yjl',
        { html: html, to_email: toEmail, title: projectName, name: "Hackathon 2025" },
        '9DaFX1vxNFW8-OjiQ'
    )
    if (resp.status !== 200) {
        console.error("Failed to send email", resp);
        return false;
    }
    console.log("Email sent successfully", resp);
    return true;

}
