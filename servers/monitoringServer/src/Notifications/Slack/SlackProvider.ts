import axios from 'axios';
import { INotificationProvider, NotificationOptions } from '../INotificationProvider';

export class SlackProvider implements INotificationProvider {
  private webhookUrl: string | undefined;
  private enabled = false;

  constructor() {
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!this.webhookUrl) {
      console.warn('[SlackProvider] SLACK_WEBHOOK_URL ausente: Slack desabilitado.');
    } else {
      this.enabled = true;
    }
  }

  async sendNotification(to: string, message: string, _options?: NotificationOptions): Promise<string | undefined> {
    if (!this.enabled || !this.webhookUrl) {
      throw new Error('Slack não configurado');
    }
    if (!to || !to.startsWith('#')) {
      // Permite também canal direto? Poderia validar @user, aqui exigimos canal #
      console.warn('[SlackProvider] Destino não começa com #, prosseguindo mesmo assim.');
    }
    await axios.post(this.webhookUrl, {
      channel: to,
      text: message,
    });
    return undefined;
  }
}
