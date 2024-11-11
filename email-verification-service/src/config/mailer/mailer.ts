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

    public async sendMailToRegister({ to, code, who }: SendMailerRequest): Promise<void> {
        const mailOptions = {
            from: `"AshChat Support" <${process.env.EMAIL_USER}>`,
            to,
            subject: "Código de Verificação de Conta - AshChat",
            text: `Olá ${who},\n\nSeu código de verificação para o AshChat é: ${code}\n\nEste código expira em 10 minutos.\n\nObrigado por se registrar!\nEquipe AshChat`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Olá ${who},</h2>
                    <p>Seu código de verificação para o AshChat é:</p>
                    <h1 style="color: #6320EE;">${code}</h1>
                    <p>Este código expira em 10 minutos.</p>
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

    public async sendMailToChangePassword({ to, code, who }: SendMailerRequest): Promise<void> {
        const mailOptions = {
            from: `"AshChat Support" <${process.env.EMAIL_USER}>`,
            to,
            subject: "Código de Verificação de Conta - AshChat",
            text: `Olá ${who},\n\nSeu código de verificação para o AshChat é: ${code}\n\nEste código expira em 10 minutos.\n\nEquipe AshChat`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Olá ${who},</h2>
                    <p>Seu código de verificação para o AshChat é:</p>
                    <h1 style="color: #6320EE;">${code}</h1>
                    <p>Este código expira em 10 minutos.</p>
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

    public async sendMailToAllowNewDevice({ to, code, who }: SendMailerRequest): Promise<void> {
        const mailOptions = {
            from: `"AshChat Support" <${process.env.EMAIL_USER}>`,
            to,
            subject: "Tentativa de login de novo dispositivo - AshChat",
            text: `Olá ${who},\n\nDetectamos uma tentativa de login na sua conta AshChat a partir de um novo dispositivo.\n\nSe essa tentativa foi feita por você, use o código de verificação abaixo para autorizar o acesso do novo dispositivo:\n\nCódigo de Verificação: ${code}\n\nEste código expira em 5 minutos.\n\nAtenciosamente,\nEquipe AshChat`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Olá ${who},</h2>
                    <p>Detectamos uma tentativa de login na sua conta AshChat a partir de um novo dispositivo.</p>
                    <p>Se essa tentativa foi feita por você, use o código de verificação abaixo para autorizar o acesso do novo dispositivo:</p>
                    <h1 style="color: #6320EE;">${code}</h1>
                    <p><em>Este código expira em 5 minutos.</em></p>
                    <br>
                    <p>Atenciosamente,</p>
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
