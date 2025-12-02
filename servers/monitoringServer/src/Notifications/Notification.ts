import { EmailProvider } from './Email/EmailProvider';
import { SlackProvider } from './Slack/SlackProvider';
import { TelegramProvider } from './Telegram/TelegramProvider';
import { TwilioProvider } from './Twilio/TwilioProvider';
import { INotificationProvider, NotificationOptions } from './INotificationProvider';

export type Channel = 'email' | 'slack' | 'telegram' | 'twilio';

export type NotificationResult = {
  channel: Channel;
  to: string;
  success: boolean;
  messageId?: string;
  error?: Error;
  timestamp: string;
};

type Metrics = {
  sent: number;
  failed: number;
  lastSuccess?: string;
  lastFailure?: string;
  lastError?: string;
};

export class NotificationController {
  private providers: Partial<Record<Channel, INotificationProvider>> = {};
  private factories: Record<Channel, () => INotificationProvider> = {
    email: () => new EmailProvider(),
    slack: () => new SlackProvider(),
    telegram: () => new TelegramProvider(),
    twilio: () => new TwilioProvider(),
  };
  private metrics: Record<Channel, Metrics>;

  constructor() {
    this.metrics = {
      email: { sent: 0, failed: 0 },
      slack: { sent: 0, failed: 0 },
      telegram: { sent: 0, failed: 0 },
      twilio: { sent: 0, failed: 0 },
    };
  }

  private getProvider(channel: Channel): INotificationProvider {
    if (!this.providers[channel]) {
      this.providers[channel] = this.factories[channel]();
    }
    return this.providers[channel]!;
  }

  private updateSuccess(channel: Channel) {
    const now = new Date().toISOString();
    this.metrics[channel].sent += 1;
    this.metrics[channel].lastSuccess = now;
  }

  private updateFailure(channel: Channel, err: Error) {
    const now = new Date().toISOString();
    this.metrics[channel].failed += 1;
    this.metrics[channel].lastFailure = now;
    this.metrics[channel].lastError = err.message;
  }

  async send(channel: Channel, to: string, message: string, options: NotificationOptions = {}): Promise<NotificationResult> {
    const provider = this.getProvider(channel);
    const retry = Math.max(0, options.retry ?? 0);
    const timeoutMs = options.timeout && options.timeout > 0 ? options.timeout : undefined;

    const attemptOnce = async (): Promise<string | undefined> => {
      if (!timeoutMs) return provider.sendNotification(to, message, options);
      return await Promise.race([
        provider.sendNotification(to, message, options),
        new Promise<string | undefined>((_, reject) => setTimeout(() => reject(new Error('Timeout ao enviar notificação')), timeoutMs)),
      ]);
    };

    let lastError: Error | undefined;
    for (let attempt = 0; attempt <= retry; attempt++) {
      try {
        const messageId = await attemptOnce();
        this.updateSuccess(channel);
        return { channel, to, success: true, messageId, timestamp: new Date().toISOString() };
      } catch (err) {
        lastError = err as Error;
        if (attempt < retry) await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
      }
    }

    this.updateFailure(channel, lastError ?? new Error('Falha desconhecida'));
    return { channel, to, success: false, error: lastError, timestamp: new Date().toISOString() };
  }

  async sendWithFallback(
    channels: Channel[],
    to: string | Partial<Record<Channel, string>>,
    message: string,
    options?: NotificationOptions,
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];
    for (const channel of channels) {
      const destination = typeof to === 'string' ? to : (to[channel] ?? '');
      if (!destination) {
        results.push({ channel, to: destination, success: false, error: new Error('Destino não fornecido'), timestamp: new Date().toISOString() });
        continue;
      }
      const result = await this.send(channel, destination, message, options);
      results.push(result);
      if (result.success) break;
    }
    return results;
  }

  getMetrics() { return this.metrics; }
  reset() {
    (Object.keys(this.metrics) as Channel[]).forEach((c) => {
      this.metrics[c] = { sent: 0, failed: 0 };
    });
  }
}

export const notificationController = new NotificationController();

export async function sendAlert(channel: Channel, to: string, message: string) {
  try {
    const result = await notificationController.send(channel, to, message);
    if (result.success) console.log(`Alerta enviado via ${channel} para ${to}`);
    else console.error(`Falha ao enviar alerta via ${channel} para ${to}: ${result.error?.message}`);
  } catch (error) {
    console.error(`Erro ao enviar alerta via ${channel} para ${to}:`, error);
  }
}
