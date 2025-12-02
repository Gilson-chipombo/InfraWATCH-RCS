export interface NotificationOptions {
  retry?: number;
  timeout?: number;
  metadata?: Record<string, any>; // ex.: { subject, channel, serviceName }
}

export interface INotificationProvider {
  /**
   * Envia uma notificação para o destino especificado.
   * Deve retornar um identificador de mensagem quando disponível (ex: messageId, sid, etc.).
   */
  sendNotification(
    to: string,
    message: string,
    options?: NotificationOptions
  ): Promise<string | undefined>;
}
