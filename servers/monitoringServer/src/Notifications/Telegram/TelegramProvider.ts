import axios from 'axios';
import { INotificationProvider, NotificationOptions } from '../INotificationProvider';

export class TelegramProvider implements INotificationProvider {
  private botToken: string | undefined;
  private enabled = false;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!this.botToken) {
      console.warn('[TelegramProvider] TELEGRAM_BOT_TOKEN ausente: Telegram desabilitado.');
    } else {
      this.enabled = true;
    }
  }

  async sendNotification(to: string, message: string, options?: NotificationOptions): Promise<string | undefined> {
    if (!this.enabled || !this.botToken) {
      throw new Error('Telegram não configurado');
    }
    if (!to) {
      throw new Error('Chat ID vazio');
    }
    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    const res = await axios.post(url, {
      chat_id: to,
      text: message,
      parse_mode: options?.metadata?.parseMode,
    });
    return res?.data?.result?.message_id?.toString();
  }
}
