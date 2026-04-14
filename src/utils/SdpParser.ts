import type { SdpBody } from '../types';

export class SdpParser {
  static parse(raw: string): SdpBody | null {
    try {
      const lines = raw.split(/\r?\n/);
      const sdp: any = { media: [], attributes: {} };

      lines.forEach(line => {
        const type = line.substring(0, 2);
        const value = line.substring(2);

        switch (type) {
          case 'v=': sdp.version = parseInt(value, 10); break;
          case 'o=': sdp.origin = value; break;
          case 's=': sdp.sessionName = value; break;
          case 'c=': 
            const cParts = value.split(' ');
            sdp.connectionAddress = cParts[cParts.length - 1];
            break;
          case 'm=':
            const mParts = value.split(' ');
            sdp.media.push({
              type: mParts[0],
              port: parseInt(mParts[1], 10),
              protocol: mParts[2],
              codecs: mParts.slice(3)
            });
            break;
          case 'a=':
            const aParts = value.split(':');
            sdp.attributes[aParts[0]] = aParts[1] || '';
            break;
        }
      });

      return sdp as SdpBody;
    } catch (e) {
      console.error('SDP Parse Error:', e);
      return null;
    }
  }
}
