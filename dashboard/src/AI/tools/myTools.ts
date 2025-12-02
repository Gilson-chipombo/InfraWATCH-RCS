import { tool } from "ai";
import { Resend } from "resend";
import z from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const myToolSet = {
    console_log: tool({
        description: "deves imprir algo na console",
        inputSchema: z.object({
            message: z.string().describe("mensagem a ser executada"),
        }),
        execute: async ({ message }) => {
            console.log("mesagem", message)
        }
    }),
    send_mail: tool({
        description: "deves enviar email para alguem",
        inputSchema: z.object({
            to: z.string().describe("destino do email"),
            subject: z.string().describe("titlo do email"),
            message: z.string().describe("conteudo do email"),
        }),
        execute: async ({ to, subject, message }) => {

            if(!to || !subject || !message)
                return "informe todos os campos destino titulo e o conteudo da mensagem"

            const response = await resend.emails.send({
                from: 'Ipikk <ipikk@maiomb.com>',
                to,
                subject,
                html: `<p>${message}</p>`
            });
            console.log(response)
            return response
        }
    })
};

export default myToolSet
