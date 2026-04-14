import type { SipMessage, SipDialog } from '../types';
import { TroubleshootingEngine } from './TroubleshootingEngine';
import { SdpParser } from './SdpParser';



export class SipParser {
  /**
   * Parses a raw SIP message string into a SipMessage object.
   */
  static parse(raw: string, metadata: Partial<SipMessage>): SipMessage | null {
    try {
      const lines = raw.split(/\r?\n/);
      if (lines.length === 0) return null;

      const firstLine = lines[0];
      const parts = firstLine.split(' ');
      
      let method = '';
      let code: number | undefined;

      if (firstLine.startsWith('SIP/2.0')) {
        // It's a response
        code = parseInt(parts[1], 10);
        method = 'RESPONSE';
      } else {
        // It's a request
        method = parts[0];
      }

      const headers: Record<string, string> = {};
      let bodyIdx = -1;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line === '') {
          bodyIdx = i + 1;
          break;
        }
        const colonIdx = line.indexOf(':');
        if (colonIdx !== -1) {
          const key = line.substring(0, colonIdx).trim().toLowerCase();
          const value = line.substring(colonIdx + 1).trim();
          headers[key] = value;
        }
      }

      const callId = headers['call-id'] || 'unknown';
      const from = headers['from'] || 'unknown';
      const to = headers['to'] || 'unknown';
      const cseq = headers['cseq'] || 'unknown';
      const contentType = headers['content-type']?.toLowerCase();

      let sdp;
      if (bodyIdx !== -1 && bodyIdx < lines.length && contentType?.includes('application/sdp')) {
        const bodyContent = lines.slice(bodyIdx).join('\n');
        sdp = SdpParser.parse(bodyContent) || undefined;
      }

      return {

        id: Math.random().toString(36).substr(2, 9),
        timestamp: metadata.timestamp || Date.now(),
        method,
        code,
        from,
        to,
        callId,
        cseq,
        raw,
        transport: metadata.transport || 'UDP',
        ipVersion: metadata.ipVersion || 4,
        srcIp: metadata.srcIp || '0.0.0.0',
        srcPort: metadata.srcPort || 0,
        dstIp: metadata.dstIp || '0.0.0.0',
        dstPort: metadata.dstPort || 0,
        sdp,
        annotations: [],
        ...metadata
      };


    } catch (e) {
      console.error('Failed to parse SIP message:', e);
      return null;
    }
  }

  /**
   * Correlates messages into dialogs.
   */
  static correlate(messages: SipMessage[]): SipDialog[] {
    const dialogsMap = new Map<string, SipMessage[]>();

    messages.forEach(msg => {
      // Basic dialog correlation by Call-ID
      // RFC 3261 says Call-ID + From-tag + To-tag, but Call-ID is a good start
      if (!dialogsMap.has(msg.callId)) {
        dialogsMap.set(msg.callId, []);
      }
      dialogsMap.get(msg.callId)?.push(msg);
    });

    return Array.from(dialogsMap.entries()).map(([callId, msgs]) => {
      msgs.sort((a, b) => a.timestamp - b.timestamp);
      
      const startTime = msgs[0].timestamp;
      const endTime = msgs[msgs.length - 1].timestamp;

      // Basic dialog state
      const finalResponse = msgs.find(m => m.code !== undefined && m.code >= 200);
      let status: 'active' | 'completed' | 'failed' = 'active';
      if (finalResponse) {
        status = finalResponse.code >= 300 ? 'failed' : 'completed';
      }

      // Initial dialog object for analysis
      const partialDialog: SipDialog = {
        callId,
        fromTag: 'tag', 
        messages: msgs,
        startTime,
        endTime,
        status,
        healthScore: 100,
        issues: [],
        metrics: {}
      };

      // Run diagnostics
      const analysis = TroubleshootingEngine.analyze(partialDialog);

      return {
        ...partialDialog,
        healthScore: analysis.healthScore,
        issues: analysis.issues,
        metrics: analysis.metrics
      };
    });
  }
}

