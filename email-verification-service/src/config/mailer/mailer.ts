// nodemailer.createTransport({
//     host: "smtp.ethereal.email",
//     port: 587,
//     secure: false, // true for port 465, false for other ports
//     auth: {
//       user: "maddison53@ethereal.email",
//       pass: "jn7jnAPss4f63QBp6D",
//     },
//   });
import { createTransport, Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { FailToSendEmailError } from "../../errors/fail-to-send-email-error";

type MailerServiceInitialize = {
    host: string,
    port: number,
    secure: boolean,
    user: string,
    pass: string
};

type SendMailerRequest = {
    to: string,
    code: string,
    who: string
};

export class MailerService {
    private transporter: Transporter<SMTPTransport.SentMessageInfo>;

    constructor({ host, port, secure, user, pass }: MailerServiceInitialize) {
        this.transporter = createTransport({
            host,
            port,
            secure,
            auth: {
                user,
                pass
            }
        });
    }

    public async sendMail({ to, code, who }: SendMailerRequest): Promise<void> {
        const mailOptions = {
            from: `"AshChat Support" <${process.env.EMAIL_USER}>`,
            to,
            subject: "Código de Verificação de Conta - AshChat",
            text: `Olá ${who},\n\nSeu código de verificação para o AshChat é: ${code}\n\nEste código expira em 1 hora.\n\nObrigado por se registrar!\nEquipe AshChat`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Olá ${who},</h2>
                    <p>Seu código de verificação para o AshChat é:</p>
                    <h1 style="color: #6320EE;">${code}</h1>
                    <p>Este código expira em 1 hora.</p>
                    <p>Obrigado por se registrar!</p>
                    <br>
                    <p><strong>Equipe AshChat</strong></p>
                </div>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`E-mail enviado para ${to} com o código de verificação.`);
        } catch (error) {
            console.error("Erro ao enviar o e-mail de verificação:", error);
            throw new FailToSendEmailError();
        }
    }
}
