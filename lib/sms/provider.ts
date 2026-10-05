/** SMS adapter — demo by default, real providers swap in later. */
export interface SmsProvider {
  send(phone: string, message: string): Promise<void>;
}

export class ConsoleSmsProvider implements SmsProvider {
  async send(phone: string, message: string): Promise<void> {
    console.log(`[sms] to ${phone}: ${message}`);
  }
}

type DemoMessage = { phone: string; message: string; at: number };
const inbox: DemoMessage[] = [];

/** DemoInboxSmsProvider: shows a fake on-screen "SMS" (client renders a toast). */
export class DemoInboxSmsProvider implements SmsProvider {
  async send(phone: string, message: string): Promise<void> {
    inbox.push({ phone, message, at: Date.now() });
    if (inbox.length > 50) inbox.shift();
    console.log(`[sms-demo] to ${phone}: ${message}`);
  }
}

export function getSmsProvider(): SmsProvider {
  return new DemoInboxSmsProvider();
}

export function lastDemoSms(phone: string): DemoMessage | undefined {
  return [...inbox].reverse().find((m) => m.phone === phone);
}
