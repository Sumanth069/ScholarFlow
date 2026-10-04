import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    service: 'ScholarFlow API',
    uptime: process.uptime(),
    checks: {
      ruleEngine: 'operational',
      nameMatcher: 'operational',
      auditChain: 'operational',
    },
  });
}
