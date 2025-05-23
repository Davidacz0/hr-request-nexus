export default function emailTemplate(projectId: string, emailId: string) {
    const surveyUrl = `http://localhost:8080/survey/${projectId}/${emailId}`;
    return {
        subject: 'Voice-Powered Survey',
        html: `
<html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #333;">Welcome to the Voice-Powered Survey</h1>
            <p style="font-size: 16px; color: #555;">We are excited to have you participate in our survey. Your feedback is invaluable to us.</p>
            <p style="font-size: 16px; color: #555;">Please click the button below to start your voice-powered survey:</p>
            <a href="${surveyUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Start Survey</a>
            <div style="margin-top: 20px; font-size: 12px; color: #aaa;">
                <p>If you have any questions, feel free to contact us.</p>
                <p style="word-break: break-all; color: #007BFF;">${surveyUrl}</p>
            </div>
        </div>
    </body>
</html>
        `,
        text: `
Welcome to the Voice-Powered Survey

We are excited to have you participate in our survey. Your feedback is invaluable to us.

Please click the link below to start your voice-powered survey:
${surveyUrl}

If you have any questions, feel free to contact us.
`
    };
}
