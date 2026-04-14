import type { SipMessage } from '../types';
import { SipParser } from './parser';

export class BinaryParser {
  /**
   * Processes a PCAP/PCAPNG file and extracts SIP messages.
   * This is a simplified version of a full binary parser.
   */
  static async parsePcap(file: File): Promise<SipMessage[]> {
    const buffer = await file.arrayBuffer();
    const view = new DataView(buffer);
    const messages: SipMessage[] = [];

    // Check Magic Number (0xa1b2c3d4 or 0xd4c3b2a1)
    const magicNumber = view.getUint32(0, true);
    let isLittleEndian = true;
    
    if (magicNumber === 0xa1b2c3d4) isLittleEndian = true;
    else if (magicNumber === 0xd4c3b2a1) isLittleEndian = false;
    else {
      console.warn('Not a standard PCAP file, might be PCAPNG. Falling back to string scanning.');
      return this.scanStrings(buffer);
    }

    let offset = 24; // Skip global header

    while (offset < buffer.byteLength) {
      if (offset + 16 > buffer.byteLength) break;

      // Packet Header
      const tsSec = view.getUint32(offset, isLittleEndian);
      const tsUsec = view.getUint32(offset + 4, isLittleEndian);
      const inclLen = view.getUint32(offset + 8, isLittleEndian);
      const origLen = view.getUint32(offset + 12, isLittleEndian);

      offset += 16;
      const packetData = buffer.slice(offset, offset + inclLen);
      
      // Basic heuristic: scan for "SIP/2.0" in the packet data
      const text = new TextDecoder().decode(packetData);
      if (text.includes('SIP/2.0')) {
        const sipMsg = SipParser.parse(text, {
          timestamp: tsSec * 1000 + tsUsec / 1000,
          transport: 'UDP' // Default for now
        });
        if (sipMsg) messages.push(sipMsg);
      }

      offset += inclLen;
    }

    return messages;
  }

  /**
   * Simple string-based scanner for non-standard or malformed captures.
   */
  static scanStrings(buffer: ArrayBuffer): SipMessage[] {
    const text = new TextDecoder().decode(buffer);
    const potentialMessages = text.split(/(\r?\n\r?\n)/);
    const messages: SipMessage[] = [];

    potentialMessages.forEach(chunk => {
      if (chunk.includes('SIP/2.0')) {
        const sipMsg = SipParser.parse(chunk, {});
        if (sipMsg) messages.push(sipMsg);
      }
    });

    return messages;
  }
}
