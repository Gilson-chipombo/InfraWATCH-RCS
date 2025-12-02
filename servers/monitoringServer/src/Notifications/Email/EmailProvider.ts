/// <reference types="node" />
import nodemailer from 'nodemailer';
import { INotificationProvider, NotificationOptions } from '../INotificationProvider';
import { buildAlertEmailHtml } from '../HTML/alertTemplate';
import { buildResetCodeEmailHtml } from '../HTML/resetCodeTemplate';

export class EmailProvider implements INotificationProvider {
  private transporter;

  constructor() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
      console.warn('[EmailProvider] Variáveis EMAIL_USER / EMAIL_PASS ausentes. Envios irão falhar.');
    }

    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : undefined,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  async sendNotification(to: string, message: string, options?: NotificationOptions): Promise<string | undefined> {
    if (!to || !/\S+@\S+\.\S+/.test(to)) {
      throw new Error('Email inválido');
    }
    if (!this.transporter) {
      throw new Error('Transporter de email não inicializado');
    }

    const templateType = options?.metadata?.templateType || 'alert';
    const subject = templateType === 'reset-code'
      ? 'InfraWatch - Código de Redefinição de Senha'
      : (options?.metadata?.subject || 'InfraWatch - Alerta');

    const html = templateType === 'reset-code'
      ? buildResetCodeEmailHtml(message)
      : buildAlertEmailHtml(message);

    const info = await this.transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      text: message,
      html,
    });
    return info?.messageId;
  }

  
}
