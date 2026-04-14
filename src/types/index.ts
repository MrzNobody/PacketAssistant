export interface SecurityFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  description: string;
  evidence: string;
}

export interface Annotation {

  id: string;
  text: string;
  author: string;
  severity: 'note' | 'warning' | 'finding';
  timestamp: number;
}

export interface SdpBody {

  version: number;
  origin: string;
  sessionName: string;
  connectionAddress: string;
  media: {
    type: string;
    port: number;
    protocol: string;
    codecs: string[];
  }[];
  attributes: Record<string, string>;
}

export interface SipMessage {

  id: string;
  timestamp: number;
  method: string;
  code?: number;
  from: string;
  to: string;
  callId: string;
  cseq: string;
  raw: string;
  transport: 'UDP' | 'TCP' | 'TLS' | 'WS';
  ipVersion: 4 | 6;
  srcIp: string;
  srcPort: number;
  dstIp: string;
  dstPort: number;
  sdp?: SdpBody;
  annotations: Annotation[];
}



export interface DiagnosticIssue {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  callId: string;
  recommendation: string;
}

export interface SipDialog {
  callId: string;
  fromTag: string;
  toTag?: string;
  messages: SipMessage[];
  startTime: number;
  endTime: number;
  status: 'active' | 'completed' | 'failed';
  healthScore: number;
  issues: DiagnosticIssue[];
  metrics: {
    pdd?: number;
    tta?: number;
    setupTime?: number;
    duration?: number;
  };
}


export interface CaptureSession {
  id: string;
  filename: string;
  filesize: number;
  packetCount: number;
  sipMessageCount: number;
  dialogs: SipDialog[];
  duration: number;
  startTime: number;
  endTime: number;
  endpoints: string[];
  securityFindings: SecurityFinding[];
}

export const TYPES_LOADED = true;
