import type { SipDialog, SipMessage, DiagnosticIssue } from '../types';

export class TroubleshootingEngine {
  /**
   * Analyzes a dialog for common SIP problems.
   */
  static analyze(dialog: SipDialog): { issues: DiagnosticIssue[], healthScore: number, metrics: any } {
    const issues: DiagnosticIssue[] = [];
    let healthScore = 100;
    const metrics: any = {};

    const messages = dialog.messages;
    const invite = messages.find(m => m.method === 'INVITE');
    const responses = messages.filter(m => m.code !== undefined);
    const finalResponse = responses.find(m => m.code! >= 200);

    // FR-TSHOOT-003: Missing ACK after 200 OK to INVITE
    if (invite && finalResponse && finalResponse.code === 200) {
      const ack = messages.find(m => m.method === 'ACK');
      if (!ack) {
        issues.push({
          id: 'MISSING_ACK',
          severity: 'critical',
          title: 'Missing ACK after 200 OK',
          description: 'The call was answered but no ACK was received. This usually leads to immediate call teardown by the UAS.',
          callId: dialog.callId,
          recommendation: 'Check for asymmetric routing or firewall blocking ACK packets.'
        });
        healthScore -= 50;
      }
    }

    // FR-TSHOOT-004: Auth loops
    const authChallenges = messages.filter(m => m.code === 401 || m.code === 407);
    if (authChallenges.length >= 3) {
      issues.push({
        id: 'AUTH_LOOP',
        severity: 'critical',
        title: 'Authentication Loop Detected',
        description: `${authChallenges.length} consecutive auth challenges without a successful login.`,
        callId: dialog.callId,
        recommendation: 'Verify SIP credentials (username/password) on the UAC.'
      });
      healthScore -= 40;
    }

    // FR-TSHOOT-005: No provisional response within 4 seconds
    if (invite && !responses.find(m => m.code! < 200)) {
       const timeToFirstResponse = messages[1] ? messages[1].timestamp - invite.timestamp : Infinity;
       if (timeToFirstResponse > 4000) {
         issues.push({
            id: 'SLOW_PROVISIONAL',
            severity: 'warning',
            title: 'No Provisional Response',
            description: 'The server did not send a 1xx response within the recommended 4s window.',
            callId: dialog.callId,
            recommendation: 'Investigate delay in SIP message processing or packet loss.'
         });
         healthScore -= 10;
       }
    }

    // Timing Metrics (FR-TIMING)
    if (invite) {
      // PDD: INVITE to first 1xx
      const firstProvisional = responses.find(m => m.code! < 200);
      if (firstProvisional) {
        metrics.pdd = firstProvisional.timestamp - invite.timestamp;
      }

      // TTA: INVITE to 180/183
      const ring = responses.find(m => m.code === 180 || m.code === 183);
      if (ring) {
        metrics.tta = ring.timestamp - invite.timestamp;
      }

      // Setup Time: INVITE to ACK
      const ack = messages.find(m => m.method === 'ACK');
      if (ack) {
        metrics.setupTime = ack.timestamp - invite.timestamp;
      }
    }

    return { 
      issues, 
      healthScore: Math.max(0, healthScore),
      metrics
    };
  }
}
