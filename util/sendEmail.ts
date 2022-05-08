import nodemailer from "nodemailer";

export async function sendEmail(email: string, subject: string, text: string) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      service: process.env.SERVICE,
      port: 587,
      secure: true,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.USER,
      to: email,
      subject,
      text,
    });
    console.log(subject + ", sent to " + email + " successfully");
  } catch (err) {
    console.log(err);
  }
}

export default sendEmail;
