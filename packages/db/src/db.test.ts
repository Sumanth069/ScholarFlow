import { describe, it, expect } from 'vitest';
import {
  computeAuditHash,
  verifyAuditChain,
  canonicalJSON,
} from './auditChain';
import {
  canTransition,
  assertValidTransition,
  InvalidTransitionError,
} from './stateMachine';

describe('Cryptographic Audit Hash Chain', () => {
  it('generates deterministic canonical JSON regardless of object key insertion order', () => {
    const objA = { z: 1, a: 2, m: { y: 'bar', b: 'foo' } };
    const objB = { a: 2, m: { b: 'foo', y: 'bar' }, z: 1 };
    expect(canonicalJSON(objA)).toBe(canonicalJSON(objB));
  });

  it('builds an immutable hash chain and detects tampering', () => {
    const genesisHash = '0000000000000000000000000000000000000000000000000000000000000000';
    
    // Entry 1
    const entry1Data = {
      at: '2026-10-04T10:00:00.000Z',
      actorId: 'usr_applicant_1',
      actorRole: 'APPLICANT',
      entity: 'Application',
      entityId: 'app_1',
      event: 'CREATED',
      payload: { scheme: 'post-matric' },
      prevHash: genesisHash,
    };
    const hash1 = computeAuditHash(entry1Data);

    // Entry 2
    const entry2Data = {
      at: '2026-10-04T10:05:00.000Z',
      actorId: 'system',
      actorRole: 'SYSTEM',
      entity: 'Application',
      entityId: 'app_1',
      event: 'STATUS_TRANSITION',
      payload: { from: 'DRAFT', to: 'SUBMITTED' },
      prevHash: hash1,
    };
    const hash2 = computeAuditHash(entry2Data);

    const chain = [
      { ...entry1Data, hash: hash1 },
      { ...entry2Data, hash: hash2 },
    ];

    // Verify intact chain
    const verifyValid = verifyAuditChain(chain);
    expect(verifyValid.valid).toBe(true);
    expect(verifyValid.brokenIndex).toBe(-1);

    // Tamper with payload of entry 1
    const tamperedChain = [
      { ...entry1Data, payload: { scheme: 'tampered-scheme' }, hash: hash1 },
      { ...entry2Data, hash: hash2 },
    ];
    const verifyTampered = verifyAuditChain(tamperedChain);
    expect(verifyTampered.valid).toBe(false);
    expect(verifyTampered.brokenIndex).toBe(0);
  });
});

describe('State Machine Transitions', () => {
  it('allows valid lifecycle transitions', () => {
    expect(canTransition('DRAFT', 'SUBMITTED')).toBe(true);
    expect(canTransition('SUBMITTED', 'PROCESSING')).toBe(true);
    expect(canTransition('PROCESSING', 'NEEDS_CORRECTION')).toBe(true);
    expect(canTransition('NEEDS_CORRECTION', 'CORRECTION_SENT')).toBe(true);
    expect(canTransition('CORRECTION_SENT', 'RESUBMITTED')).toBe(true);
    expect(canTransition('RESUBMITTED', 'PROCESSING')).toBe(true);
    expect(canTransition('PROCESSING', 'AUTO_CLEARED')).toBe(true);
    expect(canTransition('AUTO_CLEARED', 'SANCTIONED')).toBe(true);
  });

  it('rejects invalid state transitions with InvalidTransitionError', () => {
    expect(canTransition('DRAFT', 'SANCTIONED')).toBe(false);
    expect(canTransition('REJECTED_INELIGIBLE', 'AUTO_CLEARED')).toBe(false);
    expect(() => assertValidTransition('DRAFT', 'AUTO_CLEARED')).toThrow(
      InvalidTransitionError
    );
  });
});
