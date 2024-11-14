import postmark from 'postmark';
import dotenv from 'dotenv';
dotenv.config();

const client = new postmark.ServerClient("61772881-19ef-4bc7-8ca9-b6bc9c80ba7b");
export const sendRecoveryEmail = async (email, recoveryCode) => {
    try {
        await client.sendEmail({
            From: "ncamicha@uade.edu.ar", // Configura el remitente en las variables de entorno
            To: email,
            Subject: "Código de recuperación de contraseña",
            TextBody: `Tu código de recuperación es: ${recoveryCode}`,
        });
        console.log(`Correo de recuperación enviado a ${email}`);
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        throw new Error('Error al enviar el correo de recuperación');
    }
};