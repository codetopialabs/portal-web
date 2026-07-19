export interface EmailCampaign {
  id: string;
  subject: string;
  body: string;
  sentByName: string;
  recipientCount: number;
  audienceSummary: string;
  sentAt: string;
}

export interface SendEmailInput {
  subject: string;
  body: string;
  recipientIds: string[];
  audienceSummary?: string;
}
