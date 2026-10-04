import { RegistryFact, NotifChannel } from '@scholarflow/shared';

export interface IRegistryAdapter {
  lookupCertificate(regNumber: string, certType: 'INCOME' | 'CASTE'): Promise<RegistryFact>;
}

export interface IBankAdapter {
  verifyIfsc(ifsc: string): Promise<{ valid: boolean; bankName?: string; branch?: string }>;
  checkDbtStatus(accountNumber: string, ifsc: string): Promise<{ dbtActive: boolean; status: string }>;
}

export interface IInstitutionAdapter {
  verifyInstitution(institutionCode: string): Promise<{ listed: boolean; active: boolean; name?: string; district?: string }>;
}

export interface INotificationAdapter {
  send(params: {
    channel: NotifChannel;
    recipient: string;
    subject?: string;
    content: string;
    locale: string;
    dedupeKey: string;
  }): Promise<{ success: boolean; providerRef: string }>;
}
