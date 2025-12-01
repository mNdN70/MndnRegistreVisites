
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { csvData, recipients, subject, fromName } = await request.json();

    if (!csvData || !recipients || recipients.length === 0) {
      return NextResponse.json({ message: 'Missing data: csvData and recipients are required.' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        ciphers:'SSLv3'
      }
    });

    const mailOptions = {
      from: `"${fromName}" <${process.env.SMTP_USER}>`,
      to: recipients.join(','),
      subject: subject,
      html: `<p>Adjunt se troba el registre de visites actives.</p>`,
      attachments: [
        {
          filename: 'registre_visites.csv',
          content: csvData,
          contentType: 'text/csv',
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Email sent successfully!' });

  } catch (error) {
    console.error('Error sending email:', error);
    // In a real app, you might not want to expose the detailed error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Failed to send email.', error: errorMessage }, { status: 500 });
  }
}
