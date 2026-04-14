import type { CaptureSession, SecurityFinding, SipMessage } from '../types';

export class SecurityDetector {
  static analyze(session: Partial<CaptureSession>, messages: SipMessage[]): SecurityFinding[] {
    const findings: SecurityFinding[] = [];

    // FR-SEC-347: INVITE flooding (DDoS)
    const inviteCount = messages.filter(m => m.method === 'INVITE').length;
    const durationSec = (session.duration || 1) / 1000;
    const inviteRate = inviteCount / durationSec;

    if (inviteRate > 10) {
      findings.push({
        id: 'INVITE_FLOOD',
        severity: inviteRate > 50 ? 'critical' : 'high',
        type: 'DDoS Attempt',
        description: `High volume of INVITE requests detected: ${inviteRate.toFixed(2)} req/sec.`,
        evidence: `Threshold: 10/s. Detected: ${inviteRate.toFixed(2)}/s over ${durationSec.toFixed(2)}s.`
      });
    }

    // FR-SEC-344: SIP Scanning (OPTIONS volume)
    const optionsCount = messages.filter(m => m.method === 'OPTIONS').length;
    if (optionsCount > 100) {
      findings.push({
        id: 'SIP_SCAN',
        severity: 'medium',
        type: 'SIP Scanner Detected',
        description: 'Large number of OPTIONS requests detected from a single source.',
        evidence: `Total OPTIONS packets: ${optionsCount}`
      });
    }

    // FR-SEC-349: Cleartext SIP flagging
    const hasUnencrypted = messages.some(m => m.transport === 'UDP' || m.transport === 'TCP');
    if (hasUnencrypted) {
       findings.push({
         id: 'CLEARTEXT_SIP',
         severity: 'low',
         type: 'Unencrypted Signaling',
         description: 'SIP traffic is flowing over unencrypted transports (UDP/TCP).',
         evidence: 'Transport protocols: UDP/TCP'
       });
    }

    return findings;
  }
}
