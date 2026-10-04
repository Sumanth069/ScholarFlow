import {
  IRegistryAdapter,
  IBankAdapter,
  IInstitutionAdapter,
  INotificationAdapter,
} from './interfaces';
import { RegistryFact, NotifChannel } from '@scholarflow/shared';
import { isValidIfscFormat } from '@scholarflow/matching';

export class FakeRegistryAdapter implements IRegistryAdapter {
  private records: Map<string, RegistryFact> = new Map([
    [
      'RD001234567890_INCOME',
      {
        valid: true,
        holderName: 'Sumanth Kumar',
        annualIncome: 180000,
        issuedDate: '2026-05-10',
      },
    ],
    [
      'RD009876543210_CASTE',
      {
        valid: true,
        holderName: 'Sumanth Kumar',
        category: 'SC',
        issuedDate: '2025-01-15',
      },
    ],
  ]);

  async lookupCertificate(
    regNumber: string,
    certType: 'INCOME' | 'CASTE'
  ): Promise<RegistryFact> {
    const key = `${regNumber}_${certType}`;
    const record = this.records.get(key);
    if (!record) {
      return { valid: false };
    }
    return record;
  }
}

export class FakeBankAdapter implements IBankAdapter {
  private ifscDirectory = new Map<string, { bankName: string; branch: string }>([
    ['SBIN0001234', { bankName: 'State Bank of India', branch: 'Vidhana Soudha' }],
    ['CNRB0000567', { bankName: 'Canara Bank', branch: 'Jayanagar' }],
    ['HDFC0000001', { bankName: 'HDFC Bank', branch: 'Koramangala' }],
  ]);

  async verifyIfsc(ifsc: string): Promise<{ valid: boolean; bankName?: string; branch?: string }> {
    const formatted = ifsc.trim().toUpperCase();
    if (!isValidIfscFormat(formatted)) {
      return { valid: false };
    }
    const info = this.ifscDirectory.get(formatted);
    if (!info) {
      return { valid: false };
    }
    return { valid: true, bankName: info.bankName, branch: info.branch };
  }

  async checkDbtStatus(
    accountNumber: string,
    _ifsc: string
  ): Promise<{ dbtActive: boolean; status: string }> {
    // Accounts ending with '0000' simulate DBT-inactive accounts
    if (accountNumber.endsWith('0000')) {
      return { dbtActive: false, status: 'NOT_SEEDED_NPCI' };
    }
    return { dbtActive: true, status: 'MAPPED_ACTIVE' };
  }
}

export class FakeInstitutionAdapter implements IInstitutionAdapter {
  private institutions = new Map<
    string,
    { listed: boolean; active: boolean; name: string; district: string }
  >([
    [
      'INST-BLR-001',
      {
        listed: true,
        active: true,
        name: 'Bangalore Institute of Technology',
        district: 'Bengaluru Urban',
      },
    ],
    [
      'INST-MYS-002',
      {
        listed: true,
        active: true,
        name: 'Mysore National College of Engineering',
        district: 'Mysuru',
      },
    ],
    [
      'INST-FAKE-999',
      {
        listed: false,
        active: false,
        name: 'Unrecognized Ghost Academy',
        district: 'Unknown',
      },
    ],
  ]);

  async verifyInstitution(
    institutionCode: string
  ): Promise<{ listed: boolean; active: boolean; name?: string; district?: string }> {
    const inst = this.institutions.get(institutionCode);
    if (!inst) {
      return { listed: false, active: false };
    }
    return inst;
  }
}

export class FakeNotificationAdapter implements INotificationAdapter {
  public sentMessages: Array<{
    channel: NotifChannel;
    recipient: string;
    subject?: string;
    content: string;
    locale: string;
    dedupeKey: string;
    sentAt: Date;
  }> = [];

  async send(params: {
    channel: NotifChannel;
    recipient: string;
    subject?: string;
    content: string;
    locale: string;
    dedupeKey: string;
  }): Promise<{ success: boolean; providerRef: string }> {
    this.sentMessages.push({
      ...params,
      sentAt: new Date(),
    });
    return {
      success: true,
      providerRef: `fake_notif_${Math.random().toString(36).substring(2, 9)}`,
    };
  }
}
