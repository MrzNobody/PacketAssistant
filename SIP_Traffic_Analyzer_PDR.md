# SIP Traffic Flow Analyzer
## Product Design Requirements (PDR)

| Field | Value |
|---|---|
| Document Number | SFA-PDR-001 |
| Version | 1.3 |
| Status | Draft — For Review |
| Date | April 10, 2026 |
| Classification | Internal — Confidential |
| Prepared By | Product Engineering Team |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [Goals and Success Metrics](#3-goals-and-success-metrics)
4. [Functional Requirements](#4-functional-requirements)
   - 4.1 [File Ingestion — Drag-and-Drop Interface](#41-file-ingestion--drag-and-drop-interface)
   - 4.2 [IPv4 and IPv6 Distinction](#42-ipv4-and-ipv6-distinction)
   - 4.3 [SIP Traffic Parsing and Understanding](#43-sip-traffic-parsing-and-understanding)
   - 4.4 [Ladder Diagram (Sequence Diagram)](#44-ladder-diagram-sequence-diagram)
   - 4.5 [Dashboard and Statistics](#45-dashboard-and-statistics)
   - 4.6 [Troubleshooting Intelligence Engine](#46-troubleshooting-intelligence-engine)
   - 4.7 [Call Timing Metrics Panel](#47-call-timing-metrics-panel)
   - 4.8 [SDP and Media Analysis Panel](#48-sdp-and-media-analysis-panel)
   - 4.9 [Signaling Path Topology View](#49-signaling-path-topology-view)
   - 4.10 [Registration Health Monitor](#410-registration-health-monitor)
   - 4.11 [Filtering and Search](#411-filtering-and-search)
   - 4.12 [Export Capabilities](#412-export-capabilities)
   - 4.13 [Capture Summary Report Generator](#413-capture-summary-report-generator)
   - 4.14 [SIP ALG Detection](#414-sip-alg-detection)
   - 4.15 [RTP Stream Identification](#415-rtp-stream-identification)
   - 4.16 [DTMF Event Visualization](#416-dtmf-event-visualization)
   - 4.17 [Inline RFC Tooltips](#417-inline-rfc-tooltips)
   - 4.18 [Multi-PCAP Correlation](#418-multi-pcap-correlation)
   - 4.19 [Keyboard Shortcuts](#419-keyboard-shortcuts)
   - 4.20 [Annotations and Notes](#420-annotations-and-notes)
   - 4.21 [PCAP Comparison / Diff Mode](#421-pcap-comparison--diff-mode)
   - 4.22 [Audio Playback](#422-audio-playback)
   - 4.23 [TLS/SIPS Decryption](#423-tlssips-decryption)
   - 4.24 [SIP Forking Visualization](#424-sip-forking-visualization)
   - 4.25 [Security and Fraud Detection Panel](#425-security-and-fraud-detection-panel)
   - 4.26 [Carrier / Trunk Health Aggregate Dashboard](#426-carrier--trunk-health-aggregate-dashboard)
   - 4.27 [WebSocket / WebRTC SIP Reassembly](#427-websocket--webrtc-sip-reassembly)
   - 4.28 [Custom Anomaly Rule Builder](#428-custom-anomaly-rule-builder)
   - 4.29 [Sample PCAP Library](#429-sample-pcap-library)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Technical Architecture](#6-technical-architecture)
7. [UI/UX Requirements](#7-uiux-requirements)
8. [Data Models](#8-data-models)
9. [Acceptance Criteria](#9-acceptance-criteria)
10. [Development Milestones](#10-development-milestones)
11. [Risks and Mitigations](#11-risks-and-mitigations)
12. [Appendices](#12-appendices)
    - [Appendix A: SIP Methods Reference](#appendix-a-sip-methods-reference)
    - [Appendix B: Glossary](#appendix-b-glossary)
    - [Appendix C: Common SIP Failure Patterns](#appendix-c-common-sip-failure-patterns--voice-tech-quick-reference)
    - [Appendix D: Troubleshooting Decision Tree](#appendix-d-sip-troubleshooting-decision-tree)
    - [Appendix E: Document Revision History](#appendix-e-document-revision-history)

---

## 1. Executive Summary

The SIP Traffic Flow Analyzer (SFA) is a web-based network diagnostic and visualization platform purpose-built for SIP (Session Initiation Protocol) communications. It enables network engineers, VoIP architects, and support teams to upload raw packet capture files (PCAP/PCAPNG), automatically parse and decode SIP traffic, and render interactive ladder diagrams that make complex call flows immediately understandable.

The platform provides first-class support for both IPv4 and IPv6 addressing, offering clear visual distinction between protocol versions throughout the analysis workflow. Its drag-and-drop interface lowers the barrier to entry for on-call engineers who need rapid root-cause analysis, while its deep SIP parsing capabilities satisfy the needs of senior architects requiring precise protocol-level detail.

> **Core Value Proposition:** Transform raw, unreadable PCAP files into clear, color-coded SIP ladder diagrams in seconds — supporting both IPv4 and IPv6 networks — so teams can diagnose call failures, latency issues, and signaling anomalies without manual packet-by-packet inspection.

---

## 2. Product Overview

### 2.1 Product Vision

To be the definitive browser-based SIP traffic analysis dashboard — one that any VoIP engineer can use without installing specialized tools, capable of handling enterprise-scale captures while remaining fast and intuitive.

### 2.2 Scope

**In scope for Version 1.0:**

- Ingestion of PCAP and PCAPNG capture files via drag-and-drop or file picker
- Full SIP message parsing including all standard methods (INVITE, ACK, BYE, CANCEL, REGISTER, OPTIONS, SUBSCRIBE, NOTIFY, REFER, MESSAGE, UPDATE, INFO, PRACK)
- IPv4 and IPv6 support with visual protocol-version indicators
- Interactive SIP ladder (sequence) diagram with timeline, per-message detail, and filtering
- Session/dialog grouping using Call-ID, From-tag, and To-tag
- Summary statistics dashboard: total calls, success/failure ratios, protocol distribution, endpoint inventory
- Automated troubleshooting diagnostics with ranked issue list and plain-English explanations
- Call timing metrics: PDD, TTA, Call Setup Time, retransmission interval analysis
- SDP offer/answer comparison panel with codec negotiation analysis
- Signaling path topology view derived from Via/Record-Route headers
- Registration health monitor with per-AOR state tracking
- Export of diagrams to SVG, PNG, and PDF
- No backend server required; all processing runs client-side (WebAssembly-based packet parsing)

**Out of scope for Version 1.0:**

- Live packet capture (requires future OS-level integration)
- RTP quality metrics — MOS, jitter, packet loss (deferred to v1.1)
- SRTP decryption
- User authentication and saved-session persistence

### 2.3 Target Users

| Persona | Role | Primary Need |
|---|---|---|
| VoIP Engineer | Designs and maintains SIP infrastructure | Fast call-flow debugging, ladder diagrams |
| NOC Analyst | First-line triage of call failures | Quick drag-and-drop upload, clear pass/fail indicators |
| Network Architect | Architects multi-site SIP trunking | IPv6 readiness checks, topology analysis |
| QA / Test Engineer | Validates SIP implementation conformance | RFC compliance checks, detailed header inspection |
| Support Engineer (Tier 2/3) | Resolves escalated SIP issues | Session filtering, export for ticket attachment |

---

## 3. Goals and Success Metrics

| Goal | Success Metric |
|---|---|
| Rapid time-to-diagram | PCAP fully parsed and ladder rendered in under 5 seconds for files up to 100 MB |
| Universal IP protocol support | 100% of IPv4 and IPv6 SIP packets decoded without user configuration |
| Clarity of visualization | User study score of >4.2/5 for "ease of understanding call flow" |
| Zero-install deployment | Dashboard loads and operates fully in a modern browser with no plugins |
| Reliable accuracy | Zero false-positive SIP message classifications; >99.9% parsing accuracy on RFC 3261 conformant traffic |
| Export fidelity | SVG/PNG/PDF exports are pixel-accurate reproductions of on-screen diagrams |
| Troubleshooting speed | Voice tech reaches root cause in under 60 seconds on common failure patterns |

---

## 4. Functional Requirements

### 4.1 File Ingestion — Drag-and-Drop Interface

**`FR-ING` — File Ingestion and Upload**

The dashboard shall provide a prominent drop zone occupying at least 60% of the initial viewport width. Users may drag one or more PCAP or PCAPNG files from their file system, click the zone to open a native file picker, or drop multiple files simultaneously (each parsed as a separate session tab).

| ID | Requirement | Priority |
|---|---|---|
| FR-ING-001 | Drop zone shall display a visual highlight (border color change + scaling animation) when a file is dragged over it | Must Have |
| FR-ING-002 | Accepted file formats: .pcap, .pcapng, .cap; unsupported types shall show a clear error message | Must Have |
| FR-ING-003 | Maximum file size: 500 MB per file; files exceeding limit shall prompt user with size-reduction guidance | Must Have |
| FR-ING-004 | Upload progress indicator shall display percentage completion during parsing | Must Have |
| FR-ING-005 | Multiple simultaneous files shall be queued and processed sequentially | Should Have |
| FR-ING-006 | File metadata (name, size, capture duration, packet count) shall be displayed in a session info panel | Should Have |
| FR-ING-007 | Previously loaded files shall be accessible via session history within the same browser session | Could Have |

---

### 4.2 IPv4 and IPv6 Distinction

**`FR-IP` — IP Protocol Version Support**

The analyzer shall unambiguously distinguish IPv4 and IPv6 traffic throughout every layer of the interface — from packet summary lists to individual message headers to ladder diagram endpoints.

| ID | Requirement | Priority |
|---|---|---|
| FR-IP-001 | IPv4 endpoints shall be rendered with a distinct color token (default: blue palette) and IPv6 with an alternate color (default: teal palette) | Must Have |
| FR-IP-002 | Protocol version badges (IPv4 / IPv6) shall appear on all endpoint lane headers in the ladder diagram | Must Have |
| FR-IP-003 | The packet list and filter panel shall include a Protocol Version column and filterable checkbox (IPv4, IPv6, Both) | Must Have |
| FR-IP-004 | IPv6 addresses shall be displayed in their canonical compressed form (RFC 5952) with a tooltip showing the full expanded form | Must Have |
| FR-IP-005 | Dual-stack environments (hosts with both IPv4 and IPv6 addresses) shall be detected and grouped as a single logical endpoint with dual-badge indicator | Should Have |
| FR-IP-006 | The statistics panel shall report separately the count of IPv4 SIP dialogs vs. IPv6 SIP dialogs | Must Have |
| FR-IP-007 | Link-local IPv6 addresses (fe80::/10) shall be flagged visually and excluded from statistics by default, with option to include | Should Have |

---

### 4.3 SIP Traffic Parsing and Understanding

**`FR-SIP` — SIP Message Parsing**

The core parsing engine shall implement a full SIP/2.0 parser compliant with RFC 3261 and relevant updates (RFC 3262, 3264, 3265, 4028, 5389). It shall extract and make searchable every header field, SDP body, and transport metadata.

| ID | Requirement | Priority |
|---|---|---|
| FR-SIP-001 | Parser shall identify all standard SIP request methods: INVITE, ACK, CANCEL, BYE, REGISTER, OPTIONS, SUBSCRIBE, NOTIFY, REFER, MESSAGE, UPDATE, INFO, PRACK | Must Have |
| FR-SIP-002 | Parser shall identify all SIP response classes (1xx Provisional, 2xx Success, 3xx Redirect, 4xx Client Error, 5xx Server Error, 6xx Global Failure) | Must Have |
| FR-SIP-003 | Dialog correlation via Call-ID + From-tag + To-tag shall group related messages into discrete call sessions automatically | Must Have |
| FR-SIP-004 | SDP bodies shall be parsed and displayed with codec, port, and media type extracted | Must Have |
| FR-SIP-005 | Via header chain shall be parsed to reconstruct the signaling path topology | Must Have |
| FR-SIP-006 | Transport protocols (UDP, TCP, TLS, WebSocket) shall be detected and labeled per-message | Must Have |
| FR-SIP-007 | Malformed or non-compliant SIP messages shall be flagged with a warning badge and included in the diagram with a degraded appearance | Must Have |
| FR-SIP-008 | Retransmissions shall be detected (same branch + method) and visually collapsed by default, with option to expand | Should Have |
| FR-SIP-009 | REGISTER flows shall be grouped separately from dialog-based call flows | Should Have |
| FR-SIP-010 | Authentication challenges (401/407) and their corresponding retry requests shall be linked visually in the ladder | Should Have |

---

### 4.4 Ladder Diagram (Sequence Diagram)

**`FR-LAD` — SIP Ladder / Sequence Diagram**

The ladder diagram is the primary visualization artifact of the SFA. It presents SIP message flows in the classic sequence diagram style: vertical swimlanes for each endpoint/proxy, horizontal arrows for message exchanges, and a time axis progressing downward.

| ID | Requirement | Priority |
|---|---|---|
| FR-LAD-001 | Each unique IP:port pair shall render as a vertical swimlane labeled with hostname (if resolvable), IP address, and IP version badge | Must Have |
| FR-LAD-002 | Message arrows shall display: SIP method or response code, direction of flow, relative timestamp offset, and transport protocol | Must Have |
| FR-LAD-003 | Clicking any message arrow shall open a detail pane showing full raw SIP headers, parsed field table, SDP content, and packet metadata | Must Have |
| FR-LAD-004 | The time axis shall be configurable between absolute timestamps and relative offsets (delta from first packet in flow) | Must Have |
| FR-LAD-005 | IPv4 message arrows shall use a distinct color scheme; IPv6 arrows shall use a visually differentiated alternate scheme (configurable in settings) | Must Have |
| FR-LAD-006 | Response codes 4xx, 5xx, 6xx shall be rendered with red/amber arrow styling to highlight failures at a glance | Must Have |
| FR-LAD-007 | Retransmission arrows shall be rendered as dashed lines and grouped under a collapsible "expand retransmissions" control | Should Have |
| FR-LAD-008 | The diagram shall support pan and zoom interactions (mouse wheel / trackpad pinch / on-screen controls) | Must Have |
| FR-LAD-009 | A "fit to screen" button shall reframe the entire call flow within the viewport | Must Have |
| FR-LAD-010 | The diagram shall dynamically re-render when the user applies filters (by endpoint, method, time range, or IP version) | Must Have |
| FR-LAD-011 | A mini-map / overview navigator shall appear for call flows with more than 30 messages | Should Have |
| FR-LAD-012 | Call phases shall be annotated with labeled brackets: Signaling Setup, Media Negotiation (SDP offer/answer), Active Call, Teardown | Should Have |
| FR-LAD-013 | The diagram shall support multi-dialog view for transfer/REFER flow analysis | Could Have |

---

### 4.5 Dashboard and Statistics

**`FR-DASH` — Analytics Dashboard**

| ID | Requirement | Priority |
|---|---|---|
| FR-DASH-001 | Dashboard shall display: total packets, total SIP messages, total dialogs/sessions, capture time range | Must Have |
| FR-DASH-002 | Donut/pie chart showing distribution of SIP methods (INVITE, REGISTER, OPTIONS, other) | Must Have |
| FR-DASH-003 | Call success rate widget: percentage of INVITE dialogs ending in 200 OK vs. 4xx/5xx/6xx final responses | Must Have |
| FR-DASH-004 | Endpoint table listing all IP addresses, their IP version, packet count, and SIP role (UAC/UAS/Proxy inferred) | Must Have |
| FR-DASH-005 | Timeline histogram showing SIP message volume over the capture duration (bin size auto-scaled) | Should Have |
| FR-DASH-006 | Response code distribution bar chart (200, 183, 180, 404, 486, 500, etc.) | Should Have |
| FR-DASH-007 | IPv4 vs IPv6 traffic split shown as a prominently displayed ratio widget | Must Have |
| FR-DASH-008 | Clickable dashboard widgets shall navigate to the filtered ladder diagram view | Should Have |

---

### 4.6 Troubleshooting Intelligence Engine

**`FR-TSHOOT` — Automated Troubleshooting Diagnostics**

The SFA shall include an automated diagnostic engine that continuously analyzes loaded captures for known SIP failure patterns and anomalies. Results are surfaced as a prioritized issue list, enabling voice techs to jump directly to the root cause without manually scanning every message.

> **Design Intent:** A voice tech should be able to drop a PCAP and within 10 seconds see a ranked list of problems — "Missing ACK after 200 OK on 3 calls", "Codec mismatch on 12 dialogs", "401 authentication loop detected" — with a single click to navigate directly to the affected flow in the ladder diagram.

| ID | Requirement | Priority |
|---|---|---|
| FR-TSHOOT-001 | The diagnostic engine shall automatically scan every loaded session and produce a ranked Issue List panel ordered by severity (Critical > Warning > Info) | Must Have |
| FR-TSHOOT-002 | Each issue entry shall display: severity badge, plain-English description, affected Call-ID(s), and a "Jump to Flow" link that opens the ladder diagram filtered to that dialog | Must Have |
| FR-TSHOOT-003 | Detect missing ACK after a 200 OK to INVITE (indicates UAC failure or network black-hole) | Must Have |
| FR-TSHOOT-004 | Detect authentication loops: three or more consecutive 401/407 challenges to the same INVITE without a successful 200 OK | Must Have |
| FR-TSHOOT-005 | Detect calls that received no provisional response (no 100/180/183) within 4 seconds of INVITE (possible routing failure or firewall block) | Must Have |
| FR-TSHOOT-006 | Detect SIP retransmission storms: more than 5 retransmissions of the same branch within the T2 timer window, indicating packet loss or routing loop | Must Have |
| FR-TSHOOT-007 | Detect INVITE rejected with 408 Request Timeout — annotate with likely cause: no route to host, firewall, far-end not responding | Must Have |
| FR-TSHOOT-008 | Detect incomplete dialog teardown: INVITE established (200 OK + ACK) but no BYE received within capture duration (possible zombie call / resource leak) | Must Have |
| FR-TSHOOT-009 | Detect one-way audio indicator: SDP negotiation succeeded but RTP source/destination addresses differ from signaling endpoints (NAT traversal failure) | Should Have |
| FR-TSHOOT-010 | Detect codec mismatch: SDP offer and answer contain no common codec (results in 488 Not Acceptable Here or media failure) | Must Have |
| FR-TSHOOT-011 | Detect REGISTER expiry issues: re-REGISTER not sent before expiry timer elapses; or REGISTER rejected with 403/423 | Should Have |
| FR-TSHOOT-012 | Detect route/Record-Route asymmetry: response Route headers differ from request path in a way that would break in-dialog requests | Could Have |
| FR-TSHOOT-013 | Each detected issue shall display a "What does this mean?" expandable explanation written in plain English at a technician level | Must Have |
| FR-TSHOOT-014 | Each detected issue shall include a "Recommended Next Steps" list (e.g., "Check firewall rules between 10.0.1.5 and 10.0.2.3 on UDP 5060") | Must Have |
| FR-TSHOOT-015 | A "Call Health Score" (0–100) shall be computed per dialog based on anomaly count and severity; displayed as a color-coded badge on each dialog in the session list | Should Have |

---

### 4.7 Call Timing Metrics Panel

**`FR-TIMING` — Call Timing and KPI Metrics**

Timing problems are among the most common complaints in VoIP deployments. The SFA shall compute and prominently display key timing metrics for every INVITE dialog.

| ID | Requirement | Target / Notes | Priority |
|---|---|---|---|
| FR-TIMING-001 | Post-Dial Delay (PDD): time from INVITE to first 180/183 | Display in ms; green <2s, amber 2–5s, red >5s | Must Have |
| FR-TIMING-002 | Time to Answer (TTA): time from first 180 Ringing to 200 OK | Per dialog | Must Have |
| FR-TIMING-003 | Call Setup Time: time from INVITE to ACK sent after 200 OK | Full three-way handshake duration | Must Have |
| FR-TIMING-004 | Call Duration: time from ACK to BYE | Active media period | Must Have |
| FR-TIMING-005 | Teardown Time: time from BYE to 200 OK for BYE | Flag if exceeds 32 seconds (T1×64) | Must Have |
| FR-TIMING-006 | Retransmission Interval Analysis: actual intervals vs. RFC 3261 expected exponential back-off | Detects timer misconfiguration | Should Have |
| FR-TIMING-007 | SIP Timer T1 Estimated Value: infer T1 from retransmission intervals | Mismatched T1 is a common interop issue | Should Have |
| FR-TIMING-008 | Timing summary table: per-dialog and aggregate (min, max, mean, 95th percentile) | Across all INVITE dialogs | Must Have |
| FR-TIMING-009 | Time gaps >2 seconds between consecutive messages in an active dialog shall be highlighted on the ladder diagram time axis | | Should Have |

---

### 4.8 SDP and Media Analysis Panel

**`FR-MEDIA` — SDP and Media Negotiation Analysis**

SDP negotiation failures are frequently invisible in ladder diagrams without detailed parsing. The SFA shall provide a dedicated SDP inspector surfacing codec negotiation, hold/resume states, and RTP endpoint mismatches — the leading causes of one-way audio and no-audio incidents.

| ID | Requirement | Priority |
|---|---|---|
| FR-MEDIA-001 | Side-by-side SDP Offer vs. Answer comparison panel showing: offered codecs, accepted codecs, rejected codecs, and the negotiated result | Must Have |
| FR-MEDIA-002 | Codec intersection computation: highlight codecs in offer absent from answer (mismatched) and clearly label the final agreed codec(s) | Must Have |
| FR-MEDIA-003 | Display RTP endpoint info from SDP: connection address (c= line), audio port (m= audio), video port (m= video) for both offer and answer | Must Have |
| FR-MEDIA-004 | Detect and flag NAT-related SDP issues: private RFC 1918 address in SDP c= line vs. public IP in packet header (indicates missing NAT traversal / ICE failure) | Must Have |
| FR-MEDIA-005 | Hold and resume detection: identify re-INVITE with a=sendonly/recvonly/inactive/sendrecv and annotate the ladder diagram with "HOLD" and "RESUME" labels | Must Have |
| FR-MEDIA-006 | Detect DTMF negotiation: identify whether telephone-event/8000 (RFC 2833/4733) is negotiated; flag dialogs where DTMF is likely to fail | Should Have |
| FR-MEDIA-007 | Display Ptime values from SDP and flag mismatched ptime between offer and answer | Should Have |
| FR-MEDIA-008 | For UPDATE and re-INVITE, display a change-diff view showing which SDP fields changed relative to the initial offer/answer | Should Have |
| FR-MEDIA-009 | SRTP detection: identify SDES crypto attributes or DTLS-SRTP fingerprints and label streams as "Encrypted Media" | Should Have |
| FR-MEDIA-010 | Fax (T.38) detection: identify T.38 re-INVITE/UPDATE flows and annotate with a Fax transition indicator | Could Have |

---

### 4.9 Signaling Path Topology View

**`FR-TOPO` — Signaling Path and Proxy Topology**

In multi-hop SIP deployments (SBCs, B2BUAs, proxies, load balancers), understanding which element processed a message is critical for fault isolation.

| ID | Requirement | Priority |
|---|---|---|
| FR-TOPO-001 | Parse the complete Via header chain from each SIP response to reconstruct the ordered list of proxies/SBCs that handled the request | Must Have |
| FR-TOPO-002 | Render a Signaling Path diagram: a horizontal node graph showing UAC → Proxy 1 → Proxy 2 → UAS with IP addresses and transport labels on each hop | Must Have |
| FR-TOPO-003 | Detect B2BUA behavior: endpoints that consume an INVITE and generate a new INVITE with different Call-ID; link both legs in the topology view | Should Have |
| FR-TOPO-004 | Record-Route and Route header chains shall be parsed and visualized to show the enforced signaling path for in-dialog requests | Should Have |
| FR-TOPO-005 | Detect and flag topology inconsistencies: Via branch mismatch, Record-Route address not seen in capture, or response arriving on different interface than request | Should Have |
| FR-TOPO-006 | Each node in the topology diagram shall display: IP address, IP version badge, transport, and inferred role (UAC / UAS / Proxy / SBC / B2BUA) | Must Have |
| FR-TOPO-007 | Clicking a node in the topology view shall filter the ladder diagram to show only traffic passing through that node | Must Have |

---

### 4.10 Registration Health Monitor

**`FR-REG` — SIP Registration Monitoring**

REGISTER failures are the root cause of a large proportion of "phone not working" support tickets.

| ID | Requirement | Priority |
|---|---|---|
| FR-REG-001 | A dedicated Registration tab shall list every REGISTER transaction grouped by Address of Record (AOR: user@domain) | Must Have |
| FR-REG-002 | Each registration entry shall show: AOR, Contact address, result (200 OK / 401 / 403 / 423 / 503), expiry value, and timestamp | Must Have |
| FR-REG-003 | Registration timelines: horizontal bar per AOR showing registration periods (green = registered, red = unregistered gap, yellow = pending challenge response) | Should Have |
| FR-REG-004 | Detect and flag 423 Interval Too Brief: show the server's Min-Expires value vs. the client's requested Expires value | Must Have |
| FR-REG-005 | Detect failed re-registration: successful REGISTER followed by a subsequent REGISTER that was rejected or went unanswered | Must Have |
| FR-REG-006 | Detect authentication failure loops: AOR receives 401/407 and retries more than 3 times without success — flag as "Credential Failure Suspected" | Must Have |
| FR-REG-007 | Display the full Contact URI and any +sip.instance or reg-id parameters (RFC 5626) for debugging multi-device registrations | Should Have |

---

### 4.11 Filtering and Search

**`FR-FLT` — Filtering and Search**

| ID | Requirement | Priority |
|---|---|---|
| FR-FLT-001 | Global search box accepting: IP address, Call-ID, SIP method, response code, phone number (user@host or E.164) | Must Have |
| FR-FLT-002 | Filter panel with checkboxes for: IP Version (v4/v6), SIP Methods, Response Code Classes, Transport (UDP/TCP/TLS/WS) | Must Have |
| FR-FLT-003 | Time range slider to restrict analysis to a sub-window of the capture | Must Have |
| FR-FLT-004 | Endpoint filter: select one or more endpoints to show only flows involving those endpoints | Must Have |
| FR-FLT-005 | Saved filter presets (stored in browser localStorage) for commonly used search patterns | Could Have |
| FR-FLT-006 | BPF-style expression input for advanced users (e.g., `host 10.0.1.5 and sip.method == INVITE`) | Could Have |

---

### 4.12 Export Capabilities

**`FR-EXP` — Export and Sharing**

| ID | Requirement | Priority |
|---|---|---|
| FR-EXP-001 | Export current ladder diagram as SVG (vector, fully scalable) | Must Have |
| FR-EXP-002 | Export current ladder diagram as PNG (rasterized at 2x resolution for retina clarity) | Must Have |
| FR-EXP-003 | Export current ladder diagram as PDF (A4 and Letter page sizes, multi-page if needed) | Must Have |
| FR-EXP-004 | Export filtered SIP message list as CSV (timestamp, src_ip, src_port, dst_ip, dst_port, method_or_code, call_id) | Should Have |
| FR-EXP-005 | Export full parsed session as JSON (machine-readable structure of all dialogs, messages, and headers) | Should Have |
| FR-EXP-006 | One-click copy of any individual SIP message raw text to clipboard | Must Have |

---

### 4.13 Capture Summary Report Generator

**`FR-REPORT` — Auto-Generated Escalation Report**

A significant portion of voice tech work involves escalation — to Tier 2, to a carrier, or to a vendor. The SFA shall generate a polished, shareable Capture Summary Report that pre-fills findings from the current analysis session so the tech never has to manually transcribe data from the tool into a ticket.

> **Design Intent:** One button press produces a complete, professional report ready to attach to a support ticket, email to a carrier, or hand off between shifts — with zero copy-pasting.

| ID | Requirement | Priority |
|---|---|---|
| FR-REPORT-001 | A "Generate Report" button shall be accessible from the dashboard toolbar and from the Issue List panel | Must Have |
| FR-REPORT-002 | The generated report shall include: capture metadata (file name, duration, packet count), executive summary of findings, ranked issue list with plain-English descriptions, per-dialog timing metrics table, SDP negotiation results, and the ladder diagram(s) for affected flows as embedded images | Must Have |
| FR-REPORT-003 | Report shall be exportable as PDF and as a self-contained HTML file (no external dependencies) | Must Have |
| FR-REPORT-004 | The tech shall be able to select which dialogs and which findings to include before generating, allowing focused single-issue reports | Must Have |
| FR-REPORT-005 | A free-text "Engineer Notes" field shall be available in the report generator dialog for the tech to add context before export | Must Have |
| FR-REPORT-006 | Report header shall include configurable fields: engineer name, date, ticket/case number, customer name — values persisted in browser localStorage for repeat use | Should Have |
| FR-REPORT-007 | Generated reports shall include a "Captured Packets Evidence" section with the relevant raw SIP messages (INVITE, responses, BYE) reproduced in monospace for vendor escalation | Should Have |
| FR-REPORT-008 | A "Copy Summary to Clipboard" option shall produce a plain-text version of the issue list suitable for pasting directly into a ticketing system | Must Have |

---

### 4.14 SIP ALG Detection

**`FR-ALG` — SIP Application Layer Gateway Interference Detection**

SIP ALG (Application Layer Gateway) on consumer and SMB routers is one of the most prevalent and least obvious sources of SIP failures. ALG rewrites SIP headers in transit — often incorrectly — causing registration failures, one-way audio, and call drops. Because the original packets are modified before reaching the capture point, the symptoms can appear identical to genuine configuration errors. The SFA shall detect characteristic ALG fingerprints and surface clear warnings.

| ID | Requirement | Priority |
|---|---|---|
| FR-ALG-001 | Detect Contact header rewriting: Contact URI IP address differs from the source IP of the packet carrying it (strong ALG indicator) | Must Have |
| FR-ALG-002 | Detect Via header tampering: Via `received` and `rport` parameters contain an address inconsistent with the actual packet source IP | Must Have |
| FR-ALG-003 | Detect SDP address rewriting: SDP `c=` line IP changed between the INVITE as sent and as forwarded (requires two-sided capture; flag as suspected when topology implies a proxy hop with no Record-Route) | Should Have |
| FR-ALG-004 | Detect Content-Length corruption: `Content-Length` header value does not match actual SDP body length (common ALG mangling artifact) | Must Have |
| FR-ALG-005 | Detect port randomization: Contact or Via ports differ from the originating transport port in a pattern consistent with NAT/ALG port mapping | Should Have |
| FR-ALG-006 | When any ALG indicator is detected, surface a "SIP ALG Interference Suspected" Critical issue in the Issue List with the specific evidence (before/after values) and recommended remediation: "Disable SIP ALG on your router/firewall. Common setting locations: router admin panel → Advanced → SIP ALG / SIP Passthrough / SIP Transformations" | Must Have |
| FR-ALG-007 | ALG detection results shall be displayed per-message in the ladder diagram detail pane with a dedicated "ALG Analysis" tab showing original vs. detected-modified field values | Should Have |

---

### 4.15 RTP Stream Identification

**`FR-RTP` — RTP Stream Identification and Basic Quality Indicators**

While full RTP quality analysis (MOS, jitter buffer, RTCP) is deferred to v1.1, the presence or absence of RTP — and whether it flows to the right place — is the single most important question a voice tech asks after a call connects. The SFA shall identify RTP streams from the capture and surface the minimum viable set of indicators to answer that question.

| ID | Requirement | Priority |
|---|---|---|
| FR-RTP-001 | Identify RTP streams in the capture by matching UDP traffic on ports negotiated in SDP `m=` lines; display identified streams in a dedicated "Media Streams" panel | Must Have |
| FR-RTP-002 | For each identified RTP stream display: SSRC, source IP:port, destination IP:port, codec (from payload type mapping), packet count, stream duration, and first/last packet timestamp | Must Have |
| FR-RTP-003 | Annotate the ladder diagram with RTP stream indicators: a colored band along the time axis between the ACK and BYE showing whether RTP was observed flowing in each direction (bidirectional / unidirectional / absent) | Must Have |
| FR-RTP-004 | Detect and flag missing RTP: SDP negotiation succeeded and call established (200 OK + ACK received) but no RTP observed on the negotiated ports — surface as a Critical issue "No RTP detected after call established" | Must Have |
| FR-RTP-005 | Detect RTP flowing to unexpected endpoints: RTP source or destination IP differs from the SDP-negotiated `c=` address — flag as "RTP endpoint mismatch — possible NAT/SBC misconfiguration" | Must Have |
| FR-RTP-006 | Detect RTP stream gaps: sequences of missing RTP packets (inferred from RTP sequence number jumps >5) exceeding 500ms — flag as potential packet loss events with timestamps | Should Have |
| FR-RTP-007 | Display RTP packet counts for each direction (send/receive) and flag significant asymmetry (e.g., 1000 packets sent, 0 received) as a one-way audio indicator | Must Have |
| FR-RTP-008 | Identify RTCP packets associated with each RTP stream; display RTCP Sender Report / Receiver Report statistics (jitter, cumulative lost, fraction lost) when available | Should Have |

---

### 4.16 DTMF Event Visualization

**`FR-DTMF` — DTMF Detection and Visualization**

IVR troubleshooting — "the system isn't recognizing my keypress" — is a high-volume support category that has no dedicated tooling in the current PDR. DTMF events shall be detected from both RFC 2833/4733 (RTP telephone-event) and SIP INFO methods and rendered directly on the ladder diagram.

| ID | Requirement | Priority |
|---|---|---|
| FR-DTMF-001 | Detect RFC 2833/4733 DTMF events from RTP telephone-event payloads (payload type 101 or as negotiated in SDP); extract digit value, duration, and timestamp | Must Have |
| FR-DTMF-002 | Detect SIP INFO DTMF: parse `application/dtmf-relay` and `application/dtmf` body content to extract digit and duration | Must Have |
| FR-DTMF-003 | Render detected DTMF events as annotated markers directly on the ladder diagram time axis at the correct timestamp, labeled with the digit pressed (e.g., "DTMF: 5 — 100ms") | Must Have |
| FR-DTMF-004 | A dedicated DTMF event timeline panel shall list all detected keypress events in chronological order with: digit, method (RTP/INFO), timestamp, duration, and which dialog | Must Have |
| FR-DTMF-005 | Detect and flag DTMF method mismatch: SDP negotiated RFC 2833 but DTMF observed arriving via SIP INFO (or vice versa) — common cause of IVR failures | Must Have |
| FR-DTMF-006 | Detect missing telephone-event negotiation in SDP: flag dialogs where no `telephone-event` codec is in the agreed SDP as "DTMF may not work — telephone-event not negotiated" | Must Have |
| FR-DTMF-007 | Detect duplicate DTMF events: same digit detected more than once within 200ms (RTP redundancy packets being double-processed) — flag as potential double-press issue | Should Have |

---

### 4.17 Inline RFC Tooltips

**`FR-TOOLTIP` — Contextual SIP Header and Parameter Reference**

Voice techs at varying experience levels use this tool. A junior tech encountering `P-Asserted-Identity`, `Replaces`, or `Supported: 100rel` for the first time has no in-tool reference. Inline tooltips transform the SFA from a pure diagnostic tool into an educational resource, reducing the time spent context-switching to external documentation.

| ID | Requirement | Priority |
|---|---|---|
| FR-TOOLTIP-001 | Every SIP header field name rendered in the message detail pane shall display a tooltip on hover containing: RFC reference, one-sentence plain-English description, and a "Read RFC" external link | Must Have |
| FR-TOOLTIP-002 | Common SIP header values shall also have tooltips: response code reason phrases (e.g., hovering "486" shows "Busy Here — the called party is currently busy"), transport identifiers, and well-known URI parameters | Must Have |
| FR-TOOLTIP-003 | SDP field labels (`c=`, `m=`, `a=`, `o=`, etc.) in the SDP viewer shall have tooltips explaining the field's role in media negotiation | Must Have |
| FR-TOOLTIP-004 | Tooltip content shall be sourced from a bundled offline reference database (no network request required) so tooltips work in air-gapped environments | Must Have |
| FR-TOOLTIP-005 | A "Learn Mode" toggle shall pin tooltips open on click rather than requiring hover, enabling step-by-step learning for trainees | Should Have |
| FR-TOOLTIP-006 | The tooltip reference database shall be versioned and updatable independently of the main application | Could Have |

---

### 4.18 Multi-PCAP Correlation

**`FR-MULTI` — Multi-Point Capture Correlation**

In enterprise VoIP environments, capturing at a single point rarely tells the complete story. A call captured at the phone shows one view; the same call captured at the SBC shows another — headers may have been modified, messages may have been dropped, or a B2BUA may have re-originated the call. The SFA shall allow techs to load captures taken at two different network points and correlate them to pinpoint exactly where and how a call changed.

| ID | Requirement | Priority |
|---|---|---|
| FR-MULTI-001 | Allow up to 4 PCAP files to be loaded simultaneously into a correlation session, each assigned a network point label (e.g., "Phone Side", "SBC Ingress", "SBC Egress", "Carrier Side") | Must Have |
| FR-MULTI-002 | Correlate dialogs across captures using Call-ID as the primary key; when Call-ID changes (B2BUA), allow manual correlation by matching From/To URI and overlapping timestamp window | Must Have |
| FR-MULTI-003 | Render a unified multi-point ladder diagram showing all network points as swimlane groups, with messages from each capture aligned on a shared timeline | Must Have |
| FR-MULTI-004 | Highlight messages that appear in one capture but not another (dropped packets / firewall blocks) with a "missing" indicator — a red dashed arrow in the position the message should have appeared | Must Have |
| FR-MULTI-005 | Detect and display header modifications between capture points: show a diff of headers that changed between the phone-side capture and the carrier-side capture for the same message | Must Have |
| FR-MULTI-006 | Timestamp alignment: allow manual offset adjustment per capture file to compensate for clock drift between capture hosts | Should Have |
| FR-MULTI-007 | Display a per-hop latency measurement: time delta for the same message observed at consecutive capture points | Should Have |

---

### 4.19 Keyboard Shortcuts

**`FR-KB` — Keyboard Navigation and Shortcuts**

Power users — engineers who work in the tool for extended diagnostic sessions — benefit significantly from keyboard-driven navigation. Reducing mouse dependency speeds up repetitive tasks like stepping through messages, toggling panels, and navigating between dialogs.

| ID | Requirement | Priority |
|---|---|---|
| FR-KB-001 | `J` / `K` — step forward/backward through messages in the ladder diagram (with the selected message highlighted and detail pane updated) | Must Have |
| FR-KB-002 | `/` — focus the global search box | Must Have |
| FR-KB-003 | `E` — expand/collapse the right-side detail pane | Must Have |
| FR-KB-004 | `R` — toggle retransmission visibility | Must Have |
| FR-KB-005 | `F` — fit diagram to screen | Must Have |
| FR-KB-006 | `[` / `]` — navigate between dialogs/sessions in the session list | Must Have |
| FR-KB-007 | `C` — copy raw SIP message text of the currently selected message to clipboard | Must Have |
| FR-KB-008 | `T` — toggle between absolute and relative timestamps on the time axis | Should Have |
| FR-KB-009 | `?` — open a keyboard shortcut reference overlay | Must Have |
| FR-KB-010 | All keyboard shortcuts shall be remappable in the Settings panel | Could Have |
| FR-KB-011 | Keyboard shortcuts shall be displayed as hint badges on their associated UI buttons for discoverability | Should Have |

---

### 4.20 Annotations and Notes

**`FR-ANNOT` — In-Diagram Annotations and Collaborative Notes**

SIP troubleshooting often involves handoffs — a tech who found an issue needs to communicate their findings to a colleague, a manager, or a vendor without requiring the recipient to load and re-analyze the PCAP. Annotations allow findings to be embedded directly into the visualization.

| ID | Requirement | Priority |
|---|---|---|
| FR-ANNOT-001 | Any message arrow in the ladder diagram shall be right-click annotatable; the tech can type a note that appears as a flag icon on the arrow, visible at all zoom levels | Must Have |
| FR-ANNOT-002 | Annotations shall include: note text, author name (from settings), timestamp of annotation creation, and a severity tag (Note / Warning / Finding) | Must Have |
| FR-ANNOT-003 | Annotated diagrams exported to PNG, SVG, or PDF shall include all visible annotation flags and their note text | Must Have |
| FR-ANNOT-004 | Annotations shall be saved as part of the exportable JSON session file so a colleague can load the PCAP + annotations together | Must Have |
| FR-ANNOT-005 | A dedicated Annotations panel shall list all notes in the session with jump-to-message links, enabling a quick review of all findings before generating a report | Should Have |
| FR-ANNOT-006 | Annotations from the FR-REPORT Capture Summary Report shall be drawn from this annotations list automatically | Should Have |

---

### 4.21 PCAP Comparison / Diff Mode

**`FR-DIFF` — Working vs. Broken Call Comparison**

Intermittent issues are among the hardest to diagnose precisely because the tech has evidence of both a working state and a broken state but no structured way to compare them. Diff Mode enables side-by-side comparison of two dialogs — from the same or different captures — with automatic highlighting of every structural and content difference.

> **Design Intent:** A tech says "here is a call that worked and here is the same call that failed 10 minutes later." Diff Mode should instantly show them every difference between the two flows without requiring manual inspection of each message.

| ID | Requirement | Priority |
|---|---|---|
| FR-DIFF-001 | A "Compare" button in the session list shall allow the tech to select any two dialogs (from the same or different loaded PCAPs) as the "baseline" and "comparison" | Must Have |
| FR-DIFF-002 | The diff view shall render both ladder diagrams side by side, aligned by message sequence (INVITE, 100, 180, 200, ACK, BYE), not strictly by timestamp | Must Have |
| FR-DIFF-003 | Messages present in the baseline but absent from the comparison shall be highlighted in red with a "Missing" label | Must Have |
| FR-DIFF-004 | Messages present in the comparison but absent from the baseline shall be highlighted in green with an "Added" label | Must Have |
| FR-DIFF-005 | Clicking a message arrow in either pane shall open a side-by-side header diff view showing changed, added, and removed header fields between the two corresponding messages | Must Have |
| FR-DIFF-006 | SDP diff: when SDP bodies differ between the two corresponding messages, display a line-by-line diff with changed lines highlighted | Must Have |
| FR-DIFF-007 | Timing diff: display a delta column showing the difference in each timing metric (PDD, TTA, setup time) between the two dialogs | Must Have |
| FR-DIFF-008 | A diff summary panel shall list all detected differences in ranked order (structural differences first, then header-level, then value-level) | Should Have |

---

### 4.22 Audio Playback

**`FR-AUDIO` — In-Browser RTP Audio Decode and Playback**

When G.711 (PCMU/PCMA) RTP packets are present in the capture the browser has all the data required to reconstruct and play back the actual audio of the call. This capability transforms an abstract packet analysis into a direct sensory experience — a tech can *hear* one-way audio, hear the exact moment a call cuts out, or confirm whether a fax tone is actually arriving at the far end. No comparable tool delivers this in a browser-native, zero-install manner.

> **Design Intent:** A tech suspecting one-way audio should be able to press Play on each RTP stream independently and immediately hear whether audio is present, confirm which direction is silent, and pinpoint the timestamp where audio stops — without leaving the SFA.

| ID | Requirement | Priority |
|---|---|---|
| FR-AUDIO-001 | For each identified RTP stream carrying a G.711 codec (PCMU payload type 0, PCMA payload type 8), decode the RTP payload and render an in-browser audio playback control (play, pause, scrub, volume) | Must Have |
| FR-AUDIO-002 | Display a waveform visualization alongside the playback control showing audio amplitude over time; silent periods (all-zero or comfort-noise-only payloads) shall be visually distinct | Must Have |
| FR-AUDIO-003 | Each RTP stream direction (send / receive) shall have an independent playback control so the tech can isolate and play each side of the conversation separately | Must Have |
| FR-AUDIO-004 | Playback scrubber shall be time-aligned with the ladder diagram; when the user scrubs audio, the ladder diagram time axis shall scroll to the corresponding position, and vice versa | Must Have |
| FR-AUDIO-005 | Detect silence exceeding 3 seconds within an active RTP stream and annotate the waveform with a "Silence Gap" marker at that timestamp | Must Have |
| FR-AUDIO-006 | Support G.722 wideband audio decode in addition to G.711 | Should Have |
| FR-AUDIO-007 | Support Opus codec decode (primary codec for WebRTC SIP) | Should Have |
| FR-AUDIO-008 | Allow the decoded audio to be exported as a WAV file (one file per stream direction) for offline review or inclusion in a support ticket | Should Have |
| FR-AUDIO-009 | Comfort noise (CN, payload type 13) and DTMF telephone-event packets shall be excluded from audio playback but annotated on the waveform display | Should Have |
| FR-AUDIO-010 | All audio decoding shall occur client-side; no audio data shall be transmitted to any remote server | Must Have |

---

### 4.23 TLS/SIPS Decryption

**`FR-TLS` — TLS and SIPS Traffic Decryption**

In modern enterprise and carrier environments SIP over TLS (SIPS, port 5061) is the standard transport. Without decryption the SFA is blind to the content of the majority of production captures. The tool shall support industry-standard key material import methods to decrypt TLS-protected SIP sessions before parsing, keeping all decryption work client-side.

| ID | Requirement | Priority |
|---|---|---|
| FR-TLS-001 | Accept a Wireshark-compatible TLS pre-master secret log file (SSLKEYLOGFILE format) alongside a PCAP to decrypt TLS sessions before SIP parsing | Must Have |
| FR-TLS-002 | Accept a PEM-encoded RSA private key file to perform server-side RSA decryption for TLS sessions using RSA key exchange cipher suites | Must Have |
| FR-TLS-003 | Display a TLS Session panel listing all detected TLS sessions in the capture: cipher suite, TLS version, SNI, client/server IP, and decryption status (Decrypted / Failed / No Key) | Must Have |
| FR-TLS-004 | TLS certificate information (subject CN, issuer, validity period, SANs) shall be extracted from the TLS handshake and displayed in the endpoint detail panel | Should Have |
| FR-TLS-005 | Flag expired or self-signed TLS certificates detected in the capture as a Warning in the Issue List | Should Have |
| FR-TLS-006 | Detect TLS handshake failures (alert messages, incomplete handshakes) and surface them as diagnostic issues with the specific TLS alert code and plain-English explanation | Must Have |
| FR-TLS-007 | All key material uploaded by the user shall exist only in browser memory for the duration of the session and shall never be persisted to disk or transmitted remotely | Must Have |
| FR-TLS-008 | Clearly label all messages in the ladder diagram that originated from a decrypted TLS stream with a padlock icon and "SIPS/TLS" transport badge | Must Have |
| FR-TLS-009 | Support TLS 1.2 and TLS 1.3 decryption; flag TLS 1.0 and 1.1 sessions as security warnings (deprecated protocols) | Should Have |

---

### 4.24 SIP Forking Visualization

**`FR-FORK` — SIP Call Forking and Parallel Branch Visualization**

SIP forking — where a proxy sends a single INVITE to multiple destinations simultaneously — is one of the most frequently misunderstood behaviors in SIP and a common source of confusion in support calls. When a desk phone, a mobile app, and a softphone all ring at once and one answers, the resulting capture contains multiple parallel early dialogs, provisional responses from several UASes, and a cascade of CANCELs to the losing forks. The SFA shall make forked call flows immediately legible.

| ID | Requirement | Priority |
|---|---|---|
| FR-FORK-001 | Detect SIP forking: multiple provisional responses (180/183) received for a single INVITE identified by matching Call-ID and From-tag but differing To-tags | Must Have |
| FR-FORK-002 | Render each fork as a distinct parallel branch on the ladder diagram, visually grouped under the originating INVITE with a "Forked Call" header bracket | Must Have |
| FR-FORK-003 | The winning fork (the branch that received 200 OK) shall be rendered in full color; losing forks that were CANCELed shall be rendered in a desaturated style to visually distinguish the outcome | Must Have |
| FR-FORK-004 | Display a Fork Summary panel showing: number of branches, each branch's UAS endpoint, each branch's final response code, and time-to-first-response per branch | Must Have |
| FR-FORK-005 | Sequential forking (where a proxy tries targets one at a time with a redirect) shall be detected and visualized as a sequential chain rather than parallel branches | Should Have |
| FR-FORK-006 | Detect and flag missing CANCEL messages to losing forks (a proxy that doesn't cancel losing branches causes resource leaks at the UAS) | Must Have |
| FR-FORK-007 | Race conditions in forking — 200 OK received from two branches before CANCEL reaches the second — shall be detected and flagged as a "Forking Race Condition" warning with the affected branch IDs | Should Have |

---

### 4.25 Security and Fraud Detection Panel

**`FR-SEC` — SIP Security Analysis and Fraud Detection**

As SIP infrastructure becomes a more visible attack surface — particularly for toll fraud, credential stuffing, and denial-of-service — voice techs and security teams increasingly need diagnostic visibility into attack patterns. The SFA shall include a dedicated Security panel that analyzes captures for known threat indicators without requiring a separate security tool.

| ID | Requirement | Priority |
|---|---|---|
| FR-SEC-001 | A dedicated Security tab shall display all detected security events in the capture, ranked by severity (Critical / High / Medium / Low / Informational) | Must Have |
| FR-SEC-002 | Detect SIP scanning: high-volume OPTIONS or REGISTER messages from a single source IP targeting multiple distinct user accounts or URIs within a short time window | Must Have |
| FR-SEC-003 | Detect registration hijacking attempts: REGISTER message received for an AOR that already has an active registration, originating from a different IP address than the existing binding | Must Have |
| FR-SEC-004 | Detect toll fraud patterns: high volume of short-duration INVITE dialogs (< 10 seconds each) to international destination prefixes, particularly premium-rate numbers | Must Have |
| FR-SEC-005 | Detect INVITE flooding: more than a configurable threshold of INVITE messages per second from a single source (default: 10 INVITE/s) — flag as potential SIP DDoS | Must Have |
| FR-SEC-006 | Detect credential brute-forcing: repeated 401/407 challenges followed by new REGISTER or INVITE attempts with different Authorization headers from the same source (password-guessing pattern) | Must Have |
| FR-SEC-007 | Detect SIP CANCEL/BYE flooding targeting active dialogs (call teardown DoS) | Should Have |
| FR-SEC-008 | Detect SIP message size anomalies: messages exceeding 65,535 bytes or containing abnormally long header values (buffer overflow probe indicator) | Should Have |
| FR-SEC-009 | Flag unencrypted SIP traffic (UDP/TCP port 5060) in captures where TLS-encrypted SIP is also present — mixed-transport environments may expose credentials in cleartext | Must Have |
| FR-SEC-010 | Each security finding shall include: event type, source IP, timestamp range, event count, MITRE ATT&CK for ICS / VoIP threat category reference where applicable, and recommended response action | Should Have |

---

### 4.26 Carrier / Trunk Health Aggregate Dashboard

**`FR-TRUNK` — Carrier and SIP Trunk Aggregate Analytics**

The per-capture dashboard in FR-DASH gives a snapshot of a single file. NOC analysts and carrier operations teams need aggregate KPIs across many calls to identify trunk degradation, carrier-side issues, and traffic pattern anomalies. The Trunk Health Dashboard extends the analytics layer to support multi-session aggregate reporting.

| ID | Requirement | Priority |
|---|---|---|
| FR-TRUNK-001 | A dedicated Trunk Health tab shall aggregate statistics across all currently loaded PCAP sessions | Must Have |
| FR-TRUNK-002 | Compute and display Answer Seizure Ratio (ASR): percentage of INVITE dialogs that result in a 200 OK answer; display with trend indicator (improving / degrading) when multiple captures are loaded | Must Have |
| FR-TRUNK-003 | Compute and display Average Call Duration (ACD) and Average Length of Call (ALOC) across all answered calls, broken down by destination prefix or trunk group | Must Have |
| FR-TRUNK-004 | Display a failure code breakdown table: count and percentage of each final response code (404, 408, 486, 487, 503, etc.) across all INVITE dialogs, sortable by frequency | Must Have |
| FR-TRUNK-005 | Display a PDD distribution histogram (bucket by 0–1s, 1–2s, 2–3s, 3–5s, >5s) to identify systemic routing latency issues on a trunk | Must Have |
| FR-TRUNK-006 | Trunk grouping: allow the tech to assign capture sessions to named trunk groups (e.g., "Carrier A", "Carrier B") and compare KPIs side by side between groups | Should Have |
| FR-TRUNK-007 | Concurrent calls over time graph: plot the number of simultaneously active dialogs across the capture timeline to identify traffic peaks and capacity issues | Should Have |
| FR-TRUNK-008 | Destination prefix analysis: aggregate call volume, ASR, and ACD by E.164 destination prefix (country code + network code) to identify routes with disproportionate failure rates | Should Have |
| FR-TRUNK-009 | All aggregate metrics shall be exportable as CSV and as a formatted PDF trunk health report | Must Have |

---

### 4.27 WebSocket / WebRTC SIP Reassembly

**`FR-WS` — SIP over WebSocket and WebRTC Transport Support**

SIP over WebSocket (RFC 7118) is now the standard transport for browser-based softphones, WebRTC gateways, and many cloud UCaaS platforms. WebSocket frames can fragment SIP messages across multiple TCP segments differently from conventional SIP-over-TCP, requiring dedicated reassembly logic. Without this support the tool fails silently on an increasingly common and growing class of captures.

| ID | Requirement | Priority |
|---|---|---|
| FR-WS-001 | Detect SIP-over-WebSocket sessions: identify WebSocket upgrade handshakes on any port with `Sec-WebSocket-Protocol: sip` and track the resulting WebSocket connection | Must Have |
| FR-WS-002 | Reassemble SIP messages from WebSocket frames, correctly handling fragmented messages split across multiple frames or TCP segments | Must Have |
| FR-WS-003 | Label all SIP messages originating from WebSocket transport with a "WS" or "WSS" transport badge in the ladder diagram and detail pane | Must Have |
| FR-WS-004 | Detect WSS (WebSocket Secure over TLS) sessions; integrate with FR-TLS decryption so that decrypted WSS traffic is correctly parsed as SIP-over-WebSocket | Must Have |
| FR-WS-005 | Display the WebSocket handshake details (origin, requested subprotocols, HTTP upgrade headers) in the endpoint detail panel for WebSocket-connected endpoints | Should Have |
| FR-WS-006 | Detect WebSocket connection drops mid-call (TCP FIN/RST during an active dialog) and surface as a "WebSocket Connection Dropped" issue in the troubleshooting panel | Must Have |
| FR-WS-007 | Support ICE (Interactive Connectivity Establishment) candidate exchange detection within SDP bodies for WebRTC calls; display ICE candidate types (host, srflx, relay) and flag calls where no suitable candidate pair was found | Should Have |
| FR-WS-008 | Detect and display STUN/TURN binding requests and responses within the capture that correspond to WebRTC media establishment | Should Have |

---

### 4.28 Custom Anomaly Rule Builder

**`FR-RULE` — User-Defined Anomaly Detection Rules**

The built-in troubleshooting engine (FR-TSHOOT) detects a fixed library of known patterns. Every deployment is different — a rule that is irrelevant in one environment is critical in another. The Custom Rule Builder allows power users and team leads to encode environment-specific knowledge and extend the detection engine without requiring a code change or a product release.

> **Design Intent:** A senior engineer should be able to write "flag any INVITE dialog where PDD exceeds 4000ms and the destination prefix is +1900" in under two minutes, save it as a team-shared rule, and have it appear in the Issue List on every subsequent capture load.

| ID | Requirement | Priority |
|---|---|---|
| FR-RULE-001 | A Rule Builder UI shall allow users to create custom anomaly detection rules using a structured condition editor (no free-form code required) | Must Have |
| FR-RULE-002 | Rule conditions shall be composable with AND / OR logic across the following fields: SIP method, response code, header value (any header by name), timing metric (PDD, TTA, setup time, duration), IP address / prefix, transport, IP version, Call-ID pattern, From/To URI pattern, codec, RTP present/absent, and issue count per dialog | Must Have |
| FR-RULE-003 | Each rule shall have: a name, description, severity level (Critical / Warning / Info), and a "Recommended Action" text field | Must Have |
| FR-RULE-004 | Rules shall be evaluated automatically on every capture load alongside built-in rules; results appear in the same Issue List panel | Must Have |
| FR-RULE-005 | Rules shall be exportable and importable as JSON files to enable team sharing and version control of rule libraries | Must Have |
| FR-RULE-006 | A rule test mode shall allow the tech to run a single rule against the currently loaded capture and preview matching dialogs before saving | Must Have |
| FR-RULE-007 | Built-in rules shall be viewable (read-only) in the Rule Builder so users can understand their logic and use them as templates for custom rules | Should Have |
| FR-RULE-008 | A community rule library URL (configurable) shall allow teams to pull shared rule packs from an internal repository | Could Have |

---

### 4.29 Sample PCAP Library

**`FR-SAMPLE` — Curated Sample Capture Library for Training and Onboarding**

New users — and junior techs being trained — face a chicken-and-egg problem: they need real captures to learn the tool, but they may not have access to suitable captures on day one. A curated, annotated library of sample captures bundled with the application eliminates this barrier and makes the SFA immediately useful as a training platform.

| ID | Requirement | Priority |
|---|---|---|
| FR-SAMPLE-001 | The application shall ship with a bundled library of at minimum 15 curated sample PCAP files, accessible from the welcome screen and from a "Sample Library" menu item | Must Have |
| FR-SAMPLE-002 | Each sample shall be pre-annotated with engineer notes (FR-ANNOT) explaining what to observe and why it is significant | Must Have |
| FR-SAMPLE-003 | The sample library shall cover the following scenarios as a minimum: successful IPv4 call, successful IPv6 call, 401 authentication challenge and retry, codec mismatch (488), NAT traversal failure (one-way audio), session timer expiry drop, REGISTER flow (success and 403 failure), call transfer (REFER), SIP forking (parallel), retransmission storm, T.38 fax handoff, DTMF digit sequence, WebSocket SIP call, and SIP scanning attack | Must Have |
| FR-SAMPLE-004 | Each sample shall load with a pre-configured filter and zoom state that focuses the view on the most instructive part of the flow | Should Have |
| FR-SAMPLE-005 | A "Guided Walkthrough" mode shall be available for each sample: a step-by-step narrated tour that highlights specific messages and explains what they mean in context | Should Have |
| FR-SAMPLE-006 | Sample captures shall be lightweight (< 1 MB each) and stripped of any real personal or network data | Must Have |
| FR-SAMPLE-007 | Users shall be able to submit their own anonymized captures to a community sample library (optional cloud feature, requires user consent) | Could Have |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| ID | Requirement | Target |
|---|---|---|
| NFR-PERF-001 | PCAP parsing throughput | Minimum 20 MB/s on a mid-range laptop (Intel Core i5 / Apple M1, 8 GB RAM) |
| NFR-PERF-002 | Initial diagram render time (< 500 messages) | Under 1 second after parsing completes |
| NFR-PERF-003 | Diagram render time (500–5,000 messages) | Under 3 seconds with progressive rendering feedback |
| NFR-PERF-004 | Filter application latency | Under 300 ms for re-render on filter change |
| NFR-PERF-005 | Maximum supported capture size | 500 MB PCAP; up to 1 million packets; up to 50,000 SIP messages |
| NFR-PERF-006 | Memory footprint | Shall not exceed 1 GB browser memory allocation for maximum supported file size |

### 5.2 Usability

| ID | Requirement | Target |
|---|---|---|
| NFR-USE-001 | Time-to-first-insight for a new user | A competent VoIP engineer unfamiliar with the tool should reach the ladder diagram within 60 seconds of first load |
| NFR-USE-002 | Responsive layout | Full functionality on screens 1280px wide and above; graceful degradation to 1024px |
| NFR-USE-003 | Accessibility | WCAG 2.1 AA compliance for all interactive elements; keyboard-navigable ladder diagram |
| NFR-USE-004 | Dark/light mode | System-preference-aware theme with manual override toggle |
| NFR-USE-005 | Error messaging | All user-facing errors shall include the error type, a plain-English explanation, and a suggested remediation action |

### 5.3 Reliability and Compatibility

| ID | Requirement | Target |
|---|---|---|
| NFR-REL-001 | Browser support | Latest two major versions of Chrome, Firefox, Edge, and Safari |
| NFR-REL-002 | Crash resilience | A malformed PCAP shall surface a graceful error, not crash the browser tab |
| NFR-REL-003 | Parsing accuracy | Zero false-positive SIP classifications; >99.9% accuracy on RFC 3261-conformant captures |
| NFR-REL-004 | Data privacy | All processing is client-side; no packet data shall be transmitted to any remote server |
| NFR-REL-005 | Offline capability | Dashboard shall be fully functional without internet connectivity once initially loaded (PWA caching) |

---

## 6. Technical Architecture

### 6.1 Architecture Overview

The SFA is architected as a fully client-side Single-Page Application (SPA) with a WebAssembly (WASM) parsing core, enabling high-throughput packet processing directly in the browser without server-side infrastructure. The architecture is organized into four primary layers:

| Layer | Technology | Responsibility |
|---|---|---|
| Presentation Layer | React 18 + TypeScript | Dashboard layout, drag-and-drop UI, filter controls, settings panels |
| Visualization Layer | D3.js v7 / custom SVG renderer | Ladder diagram rendering, timeline, zoom/pan, export |
| Analysis Layer | TypeScript modules (browser-native) | Dialog correlation, flow grouping, statistics aggregation, retransmission detection, troubleshooting engine |
| Parsing Layer | libpcap WASM port + custom SIP parser (Rust → WASM) | PCAP/PCAPNG binary decoding, IP/UDP/TCP/TLS demux, SIP message extraction and header parsing |

### 6.2 Data Flow

1. User drops a PCAP file onto the drop zone
2. File is read via the browser FileReader API into an ArrayBuffer
3. The WASM parsing module decodes the PCAP global header and iterates packet records
4. Each packet is decoded through Ethernet > IP (v4/v6 type-detected) > TCP/UDP/TLS layers
5. SIP messages are extracted from payload bytes and fully parsed by the Rust SIP parser compiled to WASM
6. Parsed messages are passed to the Analysis Layer which builds a session graph (dialogs keyed by Call-ID + tag pair)
7. The Troubleshooting Engine runs anomaly detection passes across all dialogs and populates the Issue List
8. The React state store is updated with the session graph and issue list, triggering dashboard and diagram renders
9. User interactions (filters, clicks, zooms) dispatch state updates; the visualization layer re-renders reactively

### 6.3 Key Technology Choices

| Component | Technology & Rationale |
|---|---|
| Frontend Framework | React 18 with Concurrent Mode — enables progressive rendering of large diagrams without blocking the UI thread |
| PCAP Parsing | Rust compiled to WebAssembly via wasm-pack — achieves near-native parsing speeds; eliminates dependency on server |
| SIP Parsing | Custom Rust SIP/2.0 parser (RFC 3261) — ensures correctness and performance; handles malformed messages gracefully |
| Visualization | D3.js for data-driven SVG — industry standard for complex interactive diagrams; excellent zoom/pan ecosystem |
| State Management | Zustand — lightweight, TypeScript-first store suitable for the read-heavy analysis workload |
| Styling | Tailwind CSS + CSS custom properties — enables dark/light theming and maintains design consistency |
| Build Tooling | Vite + esbuild — sub-second dev server HMR; optimized production bundles with WASM asset handling |
| Testing | Vitest (unit), Playwright (E2E), pcap fixtures from public SIPp test suites |

---

## 7. UI/UX Requirements

### 7.1 Layout Structure

The application shall follow a three-zone layout:

- **Left sidebar (280px):** Session list, filter panel, and saved presets
- **Main content area (flexible):** Primary visualization (ladder diagram or dashboard overview) with toolbar
- **Right detail panel (380px, collapsible):** Selected message inspector, SDP decoder, and raw header view

On initial load (no file loaded), the main content area shall display a large, welcoming drop zone with instructional copy and example screenshots. A sample capture file shall be available for new users to explore the interface.

### 7.2 Ladder Diagram Visual Specification

| Element | Visual Specification |
|---|---|
| Swimlane headers | Pill-shaped label with IP address, IPv4/IPv6 badge, and hostname. IPv4 badge: blue (#2E75B6). IPv6 badge: teal (#0D7377). Dual-stack: split badge. |
| INVITE arrows | Solid dark blue arrow, 2px stroke, with method label above |
| 2xx response arrows | Solid green arrow (#27AE60), with response code label |
| 1xx provisional arrows | Dashed gray arrow, lighter weight |
| 4xx/5xx/6xx error arrows | Solid red/amber arrow (#E74C3C / #E67E22) with response code and reason phrase |
| Retransmission arrows | Dashed, 1px, 50% opacity of original method color, collapsible |
| SDP offer/answer | Arrow annotated with a media-codec badge (e.g., "G.711 / VP8") below the method label |
| Time axis | Vertical line on far-left; tick marks at 100ms intervals (configurable); relative or absolute selectable |
| Selection highlight | Selected arrow highlighted with a yellow halo; corresponding detail pane populated |
| Phase brackets | Right-side annotation brackets: Setup / Negotiation / Active / Teardown |
| HOLD / RESUME | Annotated labels on re-INVITE arrows where a=sendonly/inactive/sendrecv detected |

### 7.3 Color Accessibility

All color distinctions used to convey meaning (IPv4 vs. IPv6, success vs. failure) shall be supplemented with a secondary visual cue — icon, label, or pattern — to ensure usability for users with color vision deficiencies. A "high contrast" theme shall be available in settings.

---

## 8. Data Models

### 8.1 Core Data Structures

| Entity | Key Fields |
|---|---|
| `CaptureSession` | sessionId, filename, fileSizeBytes, captureStartTime, captureEndTime, totalPackets, totalSipMessages, ipv4Count, ipv6Count |
| `SipDialog` | dialogId, callId, fromTag, toTag, fromUri, toUri, state (trying/early/confirmed/terminated), direction, startTime, endTime, messages[], healthScore, issues[] |
| `SipMessage` | msgId, dialogId, timestamp, srcIp, srcPort, dstIp, dstPort, ipVersion (4/6), transport (UDP/TCP/TLS/WS), isRequest, method, statusCode, statusReason, headers{}, sdpBody{}, rawBytes, isRetransmission, retransmissionOf |
| `Endpoint` | endpointId, ipAddress, ipVersion, port, hostname, sipRole (UAC/UAS/Proxy/unknown), packetCount, dialogCount |
| `SdpBody` | sessionName, connectionAddress, mediaDescriptions[{type, port, protocol, codecs[], direction, ptime, cryptoAttrs[]}] |
| `DiagnosticIssue` | issueId, severity (critical/warning/info), pattern, description, plainEnglishExplanation, recommendedSteps[], affectedDialogIds[], affectedMessageIds[] |
| `TimingMetrics` | dialogId, pdd_ms, timeToAnswer_ms, callSetupTime_ms, callDuration_ms, teardownTime_ms, t1Estimated_ms, retransmissionIntervals[] |
| `RegistrationRecord` | aor, contactUri, result, expiresRequested, expiresGranted, minExpires, timestamp, challengeCount |

---

## 9. Acceptance Criteria

| AC ID | Scenario | Expected Result |
|---|---|---|
| AC-001 | User drags a 50 MB IPv4-only PCAP onto the drop zone | Ladder diagram renders within 5 seconds; all SIP dialogs visible |
| AC-002 | User drags a PCAP containing mixed IPv4 and IPv6 SIP traffic | IPv4 swimlanes show blue badge; IPv6 show teal badge; statistics widget shows correct split |
| AC-003 | User drops a file with an unsupported extension (.log) | Error message displayed; no crash |
| AC-004 | User clicks an INVITE arrow in the ladder diagram | Right detail panel shows full SIP INVITE headers, SDP offer, packet timestamp, src/dst IP and version |
| AC-005 | User filters by "IPv6 only" | Ladder diagram redraws showing only IPv6 endpoints; IPv4-only lanes hidden |
| AC-006 | User clicks "Export PNG" | PNG file downloaded at 2x resolution; all arrows, labels, and swimlane headers legible |
| AC-007 | PCAP contains a 404 Not Found response to an INVITE | The 404 arrow is rendered in red; Issue List shows the failure; health score reflects it |
| AC-008 | PCAP contains SIP retransmissions | Retransmissions collapsed by default; "expand" control visible; expanding shows dashed arrows |
| AC-009 | PCAP contains a call with no ACK after 200 OK | Issue List shows Critical: "Missing ACK after 200 OK" with Jump to Flow link |
| AC-010 | PCAP contains an auth loop (401 → INVITE → 401 → ...) | Issue List shows Critical: "Authentication Loop Detected — Credential Failure Suspected" |
| AC-011 | PCAP contains SDP with private IP in c= line but public signaling IP | SDP Analysis Panel flags NAT mismatch; Issue List shows one-way audio risk warning |
| AC-012 | User applies a Call-ID search filter | Ladder diagram shows only the single dialog matching that Call-ID |
| AC-013 | Application loaded with no internet connection (after initial load) | All functionality operates without error; no network requests required |

---

## 10. Development Milestones

| Phase | Milestone | Duration | Key Deliverables |
|---|---|---|---|
| Phase 1 | Foundation & Parsing Core | 4 weeks | WASM PCAP parser, SIP/2.0 Rust parser, IPv4/IPv6 demux, unit test suite |
| Phase 2 | Data Layer & Analysis | 3 weeks | Dialog correlation engine, retransmission detection, statistics aggregation, JSON data model |
| Phase 3 | UI Shell & Drag-and-Drop | 2 weeks | React SPA scaffold, drop zone, file progress UX, session management, left sidebar |
| Phase 4 | Ladder Diagram MVP | 4 weeks | D3.js swimlane renderer, arrow rendering, IPv4/IPv6 color distinction, pan/zoom, click-to-detail |
| Phase 5 | Dashboard & Filtering | 3 weeks | Statistics widgets, filter panel, search, timeline histogram, endpoint table, Registration Monitor |
| Phase 5a | Troubleshooting Engine | 3 weeks | Automated anomaly detection (FR-TSHOOT), Call Timing Metrics (FR-TIMING), SDP Analysis Panel (FR-MEDIA) |
| Phase 5b | Topology & Registration | 2 weeks | Signaling Path Topology View (FR-TOPO), Registration Health Monitor (FR-REG) |
| Phase 5c | RTP, DTMF & ALG | 3 weeks | RTP Stream Identification (FR-RTP), DTMF Event Visualization (FR-DTMF), SIP ALG Detection (FR-ALG) |
| Phase 6 | Collaboration & UX | 3 weeks | Capture Summary Report (FR-REPORT), Annotations (FR-ANNOT), Keyboard Shortcuts (FR-KB), Inline RFC Tooltips (FR-TOOLTIP) |
| Phase 6a | Advanced Analysis | 3 weeks | Multi-PCAP Correlation (FR-MULTI), PCAP Comparison / Diff Mode (FR-DIFF) |
| Phase 6b | Audio & Security | 3 weeks | Audio Playback (FR-AUDIO), Security & Fraud Detection (FR-SEC), SIP Forking Visualization (FR-FORK) |
| Phase 6c | Protocol Expansion | 3 weeks | TLS/SIPS Decryption (FR-TLS), WebSocket/WebRTC Reassembly (FR-WS) |
| Phase 7 | Power User & Analytics | 3 weeks | Custom Anomaly Rule Builder (FR-RULE), Carrier/Trunk Health Dashboard (FR-TRUNK), Sample PCAP Library (FR-SAMPLE) |
| Phase 8 | Export & Polish | 2 weeks | SVG/PNG/PDF export, CSV/JSON export, dark mode, accessibility audit, WCAG 2.1 fixes |
| Phase 9 | QA & Release | 2 weeks | E2E Playwright tests, performance benchmarking, cross-browser validation, documentation, guided troubleshooting wizard |

**Total estimated duration: ~42 weeks (~10 months)** for the complete feature set. Phases 3–7 may be partially parallelized with a team of 4–5 engineers. A focused v1.0 scope (Phases 1–6, core diagnostic features) can ship in approximately 28 weeks, with Phases 6b–7 delivered as v1.1 and v1.2 updates.

---

## 11. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| WASM PCAP parsing performance insufficient for 500 MB files | Medium | High | Benchmark early (Phase 1); implement streaming chunked parsing with Web Workers |
| SIP parser fails on vendor-specific non-RFC-compliant message formats | High | Medium | Build a permissive parser that degrades gracefully; collect real-world capture fixtures for regression tests |
| D3.js rendering performance degrades with >5,000 message arrows | Medium | High | Implement virtual rendering (only draw visible arrows); cluster time-range views with aggregated arrow counts |
| Browser memory limits exceeded for large captures | Low | High | Implement streaming parse with eviction of old packet raw bytes; retain only parsed SIP structures |
| WebAssembly not supported in target browser version | Low | Medium | Feature-detect WASM support on load; display clear browser upgrade prompt if unsupported |
| IPv6 address normalization inconsistencies across capture tools | Medium | Low | Normalize all IPv6 addresses to RFC 5952 canonical form immediately after parsing; add test fixtures |
| Troubleshooting engine produces false-positive anomaly alerts | Medium | Medium | Tune detection thresholds against a diverse corpus of real-world captures; allow user to dismiss/mute false positives |
| RTP stream identification fails when ports are dynamically assigned outside SDP-negotiated range | Medium | Medium | Fall back to heuristic RTP detection (payload type fingerprinting) when SDP port correlation fails; clearly label streams as "Probable RTP" |
| Multi-PCAP clock drift causes misaligned correlation timelines | High | Medium | Provide per-capture timestamp offset adjustment UI; auto-suggest offset based on matching message content (e.g., same Via branch seen in both captures) |
| PCAP Diff Mode produces misleading results for B2BUA-modified calls where headers are legitimately different | Medium | Medium | Allow tech to configure which header fields to include/exclude from diff; annotate expected B2BUA modifications vs. unexpected changes |
| SIP ALG detection generates false positives on legitimate SBCs performing expected header rewriting | Medium | Low | Maintain a configurable "expected modifier" list; allow techs to mark a node as a known SBC to suppress ALG warnings for that hop |
| G.711 audio decode produces distorted playback due to packet loss or reordering in the capture | Medium | Medium | Implement packet loss concealment (PLC) using simple interpolation; display a loss indicator on the waveform rather than playing corrupted audio |
| TLS decryption fails for TLS 1.3 sessions using (EC)DHE key exchange (no RSA key decryption path) | High | High | Require SSLKEYLOGFILE for TLS 1.3; clearly document this limitation and guide users on how to export key logs from common SIP clients and servers |
| WebSocket SIP reassembly breaks on non-standard WebSocket fragmentation implementations | Medium | Medium | Build a permissive reassembler with a configurable frame buffer timeout; fall back to best-effort partial parse with a warning badge |
| Custom rule engine introduces performance regression on large captures with many rules | Medium | Medium | Evaluate rules in a Web Worker with a configurable execution timeout per rule; disable rules that exceed threshold and notify the user |
| Security fraud detection generates high false-positive rate in high-volume legitimate call center captures | High | Medium | Make all security detection thresholds configurable per-rule; provide a "high-volume environment" preset that raises thresholds appropriately |
| SIP forking detection fails when a B2BUA re-originates forked legs with new Call-IDs | Medium | Medium | Supplement Call-ID matching with To-URI and timestamp correlation; allow manual branch linking in the Forking panel |

---

## 12. Appendices

### Appendix A: SIP Methods Reference

| Method | RFC | Usage in Ladder Diagram |
|---|---|---|
| INVITE | RFC 3261 | Session establishment; triggers dialog creation; linked to 1xx/2xx/4xx+ |
| ACK | RFC 3261 | Confirms 2xx to INVITE; shown as downstream arrow completing three-way handshake |
| BYE | RFC 3261 | Session termination; triggers dialog state change to "terminated" |
| CANCEL | RFC 3261 | Cancels pending INVITE; linked to original INVITE in ladder |
| REGISTER | RFC 3261 | UA registration; grouped in dedicated REGISTER flow view |
| OPTIONS | RFC 3261 | Capability query; shown as standalone out-of-dialog flow |
| SUBSCRIBE | RFC 3265 | Event subscription; linked to subsequent NOTIFY messages by event + id |
| NOTIFY | RFC 3265 | Event notification; paired with SUBSCRIBE |
| REFER | RFC 3515 | Call transfer trigger; annotated with Refer-To URI in diagram |
| MESSAGE | RFC 3428 | Instant message transport; shown as standalone arrow |
| UPDATE | RFC 3311 | In-dialog session update; typically SDP re-offer |
| INFO | RFC 6086 | In-dialog application data (DTMF, etc.); annotated with content-type |
| PRACK | RFC 3262 | Provisional response acknowledgement; linked to 1xx with Require:100rel |

---

### Appendix B: Glossary

| Term | Definition |
|---|---|
| PCAP | Packet Capture — a standard file format for storing network packet data, produced by tools such as Wireshark and tcpdump |
| SIP | Session Initiation Protocol — an application-layer signaling protocol (RFC 3261) used to create, modify, and terminate multimedia sessions |
| Dialog | A peer-to-peer SIP relationship established by an INVITE transaction; uniquely identified by Call-ID + From-tag + To-tag |
| Ladder Diagram | A sequence diagram showing message exchanges between communicating entities over a vertical time axis; the canonical way to visualize SIP call flows |
| UAC | User Agent Client — the SIP entity that initiates a request |
| UAS | User Agent Server — the SIP entity that receives and responds to requests |
| B2BUA | Back-to-Back User Agent — an entity that acts as both UAC and UAS, terminating one SIP dialog and originating another (common in SBCs) |
| SBC | Session Border Controller — a network device controlling SIP signaling and media at the border of a network |
| SDP | Session Description Protocol (RFC 4566) — carried in SIP message bodies to negotiate media codecs, ports, and directions |
| Via | SIP header used to record the signaling path; each proxy inserts its own Via entry |
| Record-Route | SIP header inserted by proxies that wish to remain in the signaling path for in-dialog requests |
| PDD | Post-Dial Delay — the time between sending an INVITE and receiving the first provisional response (180 Ringing / 183 Session Progress) |
| WASM | WebAssembly — a binary instruction format that enables near-native execution speed within web browsers |
| BPF | Berkeley Packet Filter — a domain-specific language for expressing network packet filter expressions |
| RFC 3261 | The core SIP specification, defining the protocol syntax, semantics, and state machines |
| T1 Timer | The estimated round-trip time for a SIP message, default 500ms; used as the base for retransmission scheduling |
| T2 Timer | The maximum retransmission interval for non-INVITE requests, default 4 seconds |

---

### Appendix C: Common SIP Failure Patterns — Voice Tech Quick Reference

The following table documents the most frequently encountered SIP failure patterns. The SFA Troubleshooting Intelligence Engine (FR-TSHOOT) shall automatically detect each of these patterns and surface them in the Issue List panel.

---

#### No Audio (One-Way or Both Ways)

**SIP Indicators:** 200 OK received; ACK sent; no BYE; RTP source/destination in SDP differs from packet headers

**Likely Cause:** NAT traversal failure — private IP address in SDP `c=` line not reachable by far end

**Recommended Action:** Enable STUN/TURN/ICE on the UA; configure SBC/media proxy to rewrite SDP; verify STUN server reachability

---

#### Call Fails Immediately with 408 Request Timeout

**SIP Indicators:** INVITE sent; no 100 Trying received; INVITE retransmitted 7 times; 408 generated locally

**Likely Cause:** Far-end SIP server unreachable; firewall blocking UDP 5060; wrong IP/FQDN in Route/Request-URI

**Recommended Action:** Verify firewall rules for SIP port; confirm DNS resolution of SIP server FQDN; check routing table

---

#### Call Rejected with 403 Forbidden

**SIP Indicators:** INVITE or REGISTER → 403 Forbidden (no 401 challenge preceded it)

**Likely Cause:** IP-based ACL denial on SIP server; account disabled; origination number not authorized

**Recommended Action:** Check SIP server ACL for caller IP; verify account status; confirm outbound caller-ID is authorized

---

#### Call Rejected with 486 Busy Here

**SIP Indicators:** INVITE → 486 Busy Here from UAS

**Likely Cause:** Called party is busy (all lines in use); or endpoint sending false Busy due to misconfigured concurrent call limit

**Recommended Action:** Confirm concurrent call limit configuration on UAS; check if `max-calls` parameter is too restrictive

---

#### Call Rejected with 488 Not Acceptable Here

**SIP Indicators:** INVITE with SDP offer → 488; no SDP in 488 response

**Likely Cause:** No common codec between offer and answer; SRTP/RTP mismatch; unsupported media type

**Recommended Action:** Use FR-MEDIA SDP comparison panel to identify codec intersection failure; align codec lists on both endpoints

---

#### Authentication Loop (No Call Established)

**SIP Indicators:** INVITE → 401 → INVITE with credentials → 401 → ... (repeats 3+ times)

**Likely Cause:** Wrong username/password; realm mismatch; stale nonce not refreshed; clock skew causing nonce rejection

**Recommended Action:** Verify SIP credentials; check NTP sync (clock skew >300s causes nonce expiry); confirm realm matches server config

---

#### Call Drops After Exactly 30 / 60 / 90 Seconds

**SIP Indicators:** BYE sent at precise interval after 200 OK + ACK

**Likely Cause:** Missing re-INVITE for session refresh (Session-Timer RFC 4028); proxy or SBC terminating call due to no re-INVITE

**Recommended Action:** Enable Session-Timers on UA; set `Session-Expires` header; or disable Session-Timer enforcement on proxy

---

#### Phone Not Ringing / No Ringback to Caller

**SIP Indicators:** INVITE sent; 100 Trying received; no 180 Ringing or 183 Session Progress; then 408 or 487

**Likely Cause:** Intermediate proxy not forwarding provisional responses; far-end UA not generating early media; SDP mismatch

**Recommended Action:** Check if proxy strips 180; verify UA generates 180; use Early Media / 183 Session Progress if ringback needed

---

#### REGISTER Fails with 423 Interval Too Brief

**SIP Indicators:** REGISTER with `Expires: 60` → 423 with `Min-Expires: 3600`

**Likely Cause:** UA requested expiry too short for server minimum; common after changing registration interval config

**Recommended Action:** Set UA registration expiry to match or exceed server `Min-Expires` value shown in 423 response header

---

#### Call Transfer (REFER) Fails

**SIP Indicators:** REFER → 202 Accepted; NOTIFY with SIP/2.0 100 Trying; then NOTIFY with 487 or no final NOTIFY

**Likely Cause:** Transferee rejected the call; REFER-generated INVITE timed out; Transfer-To URI unreachable

**Recommended Action:** Verify Refer-To URI is correct and reachable; check if transferee has concurrent call capacity; inspect new INVITE dialog generated by transfer

---

#### Fax Fails After Call Connects

**SIP Indicators:** Initial INVITE with audio codec succeeds; re-INVITE with T.38 in SDP → 488 or 415 Unsupported Media Type

**Likely Cause:** Far-end gateway does not support T.38 fax over IP; T.38 not in allowed media types

**Recommended Action:** Confirm T.38 support on far-end gateway; enable T.38 passthrough on SBC; consider G.711 passthrough fax as fallback

---

#### SIP OPTIONS Keep-Alives Failing

**SIP Indicators:** OPTIONS sent; no 200 OK response; or 200 OK arrives with unexpected capabilities

**Likely Cause:** Far-end not responding to OPTIONS (not all UAs support it as keep-alive); firewall asymmetry allowing OPTIONS but blocking INVITE

**Recommended Action:** Use REGISTER-based keep-alive instead; check firewall stateful inspection for SIP ALG interference

---

### Appendix D: SIP Troubleshooting Decision Tree

The following decision tree represents the recommended diagnostic workflow for the most common reported symptom categories. The SFA shall provide an interactive version of this tree as an in-app guided troubleshooting wizard accessible from the Issue List panel.

> **How to use:** Start from the reported symptom. Follow the branch that matches what you observe in the SFA Troubleshooting Panel and ladder diagram. Each terminal node maps to a specific finding in the capture and a recommended corrective action.

---

#### SYMPTOM: Call Fails to Connect

- **Go to SFA Issue List. Is there a 4xx/5xx/6xx response?**
  - **401 or 407 received** → Check auth loop count. Is credential retry successful?
    - No → Verify username/password/realm. Check NTP sync. Jump to Registration Monitor.
  - **403 Forbidden** → No auth challenge preceded it: IP ACL block or account disabled. Check SIP server ACL and account status.
  - **404 Not Found** → Called-party URI not recognized by server. Verify dialed number format, dial plan, and routing table.
  - **480 Temporarily Unavailable** → UA registered but currently unreachable or DND active. Check Registration Monitor for registration state.
  - **486 Busy Here** → Check concurrent call limit. Review endpoint `max-calls` configuration.
  - **488 Not Acceptable Here** → Open SDP Analysis Panel. Compare codec offer vs. answer intersection. Align codec lists.
  - **408 / No response at all** → Check Signaling Path Topology. Is first hop reachable? Verify firewall rules on UDP/TCP 5060.
  - **No response code — call abandoned** → Check PDD metric. If PDD = 0 and no 100 Trying: signaling never reached far end. Check firewall/routing.

---

#### SYMPTOM: Call Connects but No Audio

- **Open SDP Analysis Panel for the dialog.**
  - **Private IP in SDP c= line?**
    - Yes → NAT failure. UA is advertising internal RFC 1918 address. Enable SBC media proxy or STUN/ICE.
  - **No common codec?**
    - Yes → Codec negotiation failed. Align codec configuration on both endpoints.
  - **SDP looks OK but still no audio** → Check RTP connection address vs. SIP signaling source IP. If different, SBC is not rewriting SDP. Enable media anchoring on SBC.

---

#### SYMPTOM: Call Drops Unexpectedly

- **Find the BYE message in ladder diagram. Who sent BYE?**
  - **BYE at exactly N×30 seconds from ACK** → Session-Timer expiry. Check for missing re-INVITE. Enable session refresh on UA (RFC 4028).
  - **BYE from proxy/SBC mid-call** → Check for absence of re-INVITE or RTP timeout on SBC. Review SBC media timeout and SIP session timer configuration.
  - **CANCEL received (not BYE)** → CANCEL during setup = caller abandoned. Check PDD; if >6s, far end is too slow — check network latency to SIP server.

---

#### SYMPTOM: Intermittent One-Way Audio

- **Check SDP analysis for hold/resume (a=sendonly) patterns. Inspect re-INVITE flows for incomplete hold recovery.**
  - **Hold/resume looks correct** → Check for RTP port changes across re-INVITEs. Ensure SBC is rewriting SDP symmetrically.
  - **No hold/resume detected** → Intermittent NAT binding timeout likely. Enable symmetric RTP / RTP keep-alives on endpoint or SBC. Reduce media inactivity timeout.

---

#### SYMPTOM: Registration Keeps Failing

- **Open Registration Monitor. Find the AOR. What is the final response code?**
  - **401 loop / no 200 OK** → Credential failure. Verify username, password, realm. Check NTP sync (clock skew >300s invalidates nonces).
  - **403 Forbidden** → Account blocked or IP not in ACL. Check SIP server admin interface.
  - **423 Interval Too Brief** → Note `Min-Expires` value in 423 response. Set UA `Expires` to that value or higher.
  - **No response (408 timeout)** → SIP server not reachable on registration port. Verify outbound proxy IP/port. Check firewall for UDP/TCP 5060 or TLS 5061.

---

### Appendix E: Document Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 0.1 | March 2026 | Product Engineering | Initial draft outline |
| 1.0 | April 10, 2026 | Product Engineering | Full PDR — FR, NFR, architecture, UI/UX, data models, milestones, risks, appendices A–B |
| 1.1 | April 10, 2026 | Product Engineering | Added voice tech troubleshooting sections: FR-TSHOOT, FR-TIMING, FR-MEDIA, FR-TOPO, FR-REG; Appendix C (Failure Patterns) and Appendix D (Decision Tree). Renumbered FR sections. |
| 1.2 | April 10, 2026 | Product Engineering | Added 9 UX enhancement features: FR-REPORT (Capture Summary Report), FR-ALG (SIP ALG Detection), FR-RTP (RTP Stream Identification), FR-DTMF (DTMF Visualization), FR-TOOLTIP (Inline RFC Tooltips), FR-MULTI (Multi-PCAP Correlation), FR-KB (Keyboard Shortcuts), FR-ANNOT (Annotations), FR-DIFF (PCAP Comparison / Diff Mode). Updated milestones and risk register. |
| 1.3 | April 10, 2026 | Product Engineering | Added 8 advanced features: FR-AUDIO (Audio Playback), FR-TLS (TLS/SIPS Decryption), FR-FORK (SIP Forking Visualization), FR-SEC (Security & Fraud Detection), FR-TRUNK (Carrier/Trunk Health Dashboard), FR-WS (WebSocket/WebRTC Reassembly), FR-RULE (Custom Anomaly Rule Builder), FR-SAMPLE (Sample PCAP Library). Updated milestones to Phases 6b–9 and added 7 new risk entries. Total FR sections: 4.1–4.29. |

---

*PROPRIETARY AND CONFIDENTIAL — SFA-PDR-001 v1.1 — April 2026*
