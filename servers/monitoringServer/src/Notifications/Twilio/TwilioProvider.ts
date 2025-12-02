import { Twilio } from 'twilio';
import { INotificationProvider, NotificationOptions } from '../INotificationProvider';

export class TwilioProvider implements INotificationProvider {
  private client: Twilio | undefined;
  private fromNumber: string = '';
  private enabled = false;

  constructor() {
    const accountSid = process.env.TWILIO_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_PHONE_NUMBER;
    if (accountSid && authToken && from) {
      this.client = new Twilio(accountSid, authToken);
      this.fromNumber = from;
      this.enabled = true;
    } else {
      console.warn('[TwilioProvider] Credenciais ausentes: SMS desabilitado.');
    }
  }

  async sendNotification(to: string, message: string, options?: NotificationOptions): Promise<string | undefined> {
    if (!this.enabled || !this.client) {
      throw new Error('Twilio não configurado');
    }
    if (!/^\+?[1-9]\d{6,14}$/.test(to)) {
      throw new Error('Número de telefone inválido (esperado formato E.164)');
    }
    const statusCallback = process.env.TWILIO_STATUS_CALLBACK || options?.metadata?.statusCallback;
    const res = await this.client.messages.create({
      body: message,
      from: this.fromNumber,
      to,
      statusCallback,
    });
    return res?.sid;
  }
}
