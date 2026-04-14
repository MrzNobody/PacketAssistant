# SIP Traffic Flow Analyzer — Implementation Plan

| Field | Value |
|---|---|
| Document | SFA-IMPL-001 v2.0 |
| Date | April 14, 2026 |
| PDR Reference | SFA-PDR-001 v1.3 |
| Total Duration | ~37 weeks |
| Team Size | 4–5 engineers |
| Stack | React 18, TypeScript, Rust/WASM, D3.js, Vite |

---

## Overview

This plan reorganizes the SFA feature set into five logical rollout phases. Each phase delivers a meaningful, shippable increment — from a working parser to a fully-featured diagnostic platform. The v1.0 release ships at the end of Phase 3; Phases 4 and 5 deliver v1.1 and v1.2.

| Phase | Name | Weeks | Cumulative | Milestone |
|---|---|---|---|---|
| 1 | Core Engine & Data Foundation | 7 | 1–7 | Parser benchmarked and data layer stable |
| 2 | UI Shell & Primary Visualization | 6 | 8–13 | Ladder diagram live with full filtering |
| 3 | Diagnostic Intelligence | 8 | 14–21 | Troubleshooting engine + RTP/DTMF/ALG — **v1.0** |
| 4 | Collaboration, Export & Advanced Analysis | 7 | 22–28 | Reports, annotations, diff mode, full export |
| 5 | Advanced Protocol Support & Power Features | 9 | 29–37 | Audio, TLS, WebSocket, rule builder — **v1.2** |

---

## Phase 1 — Core Engine & Data Foundation
**Weeks 1–7**

All downstream phases depend on a fast, correct parsing and analysis core. Nothing else is built until this is stable and benchmarked.

### 1.1 WASM Parsing Layer (Weeks 1–4)

The performance-critical foundation: a Rust-based PCAP and SIP parser compiled to WebAssembly.

**Deliverables**

- Rust PCAP/PCAPNG binary decoder compiled to WASM via `wasm-pack`
- Custom Rust SIP/2.0 parser implementing RFC 3261, 3262, 3264, 3265, 4028
- Ethernet → IPv4/IPv6 → TCP/UDP/TLS demux with IP version detection
- All 13 SIP request methods (`INVITE`, `ACK`, `BYE`, `CANCEL`, `REGISTER`, `OPTIONS`, `SUBSCRIBE`, `NOTIFY`, `REFER`, `MESSAGE`, `UPDATE`, `INFO`, `PRACK`) parsed and typed
- All 6 SIP response classes (1xx–6xx) parsed
- SDP body parser extracting codec, port, media type, and connection address
- Via header chain parser for signaling path reconstruction
- Malformed message graceful degradation: flagged with warning badge, included in diagram with degraded appearance
- Transport detection per-message: UDP, TCP, TLS, WebSocket
- Unit test suite with 200+ PCAP fixtures from public SIPp test suites

**Performance Target**

Parse a 100 MB PCAP and deliver structured `SipMessage` objects to the Analysis Layer in under 5 seconds on an Intel Core i5 / Apple M1, 8 GB RAM. Throughput must reach ≥ 20 MB/s. Benchmark every commit.

**Risk**

If throughput misses the 20 MB/s target by end of Week 2, switch to streaming chunked parsing with Web Workers and a ring-buffer architecture to prevent main-thread blocking.

---

### 1.2 Data Layer & Analysis Engine (Weeks 5–7)

The in-memory session graph and analysis engine that all visualization and diagnostic components consume.

**Deliverables**

- Dialog correlation engine: groups `SipMessage` objects by Call-ID + From-tag + To-tag into `SipDialog` records
- Retransmission detection: identifies same branch + method duplicates
- Statistics aggregator: total packets, SIP messages, dialog count, capture time range, IPv4/IPv6 split
- Endpoint inventory: unique IP:port pairs with inferred SIP roles (UAC/UAS/Proxy)
- JSON session data model with full TypeScript type definitions:
  - `CaptureSession`, `SipDialog`, `SipMessage`, `Endpoint`
  - `SdpBody`, `DiagnosticIssue`, `TimingMetrics`, `RegistrationRecord`
- Zustand store schema with reactive slice architecture
- Unit tests for dialog correlation accuracy, retransmission detection, statistics correctness

**Exit Criteria**

Correlation engine correctly groups all messages from a 10,000-message PCAP into dialogs in under 500 ms. Data model schema locked and reviewed.

---

## Phase 2 — UI Shell & Primary Visualization
**Weeks 8–13**

Everything the user sees and interacts with in the core workflow: drop a file, see the ladder diagram, filter and explore.

### 2.1 UI Shell & Drag-and-Drop (Weeks 8–9)

**Deliverables**

- Vite + React 18 SPA scaffold with TypeScript strict mode
- Three-zone layout: left sidebar (280 px), main content area (flex), right detail panel (380 px, collapsible)
- Drop zone: 60%+ of initial viewport width, hover border animation, file type validation (`.pcap`, `.pcapng`, `.cap`)
- Upload progress indicator with percentage
- File metadata panel: filename, size, capture duration, packet count (FR-ING-006)
- Multiple simultaneous files as separate session tabs (FR-ING-005)
- Welcome screen with instructional copy and sample capture offer
- Error messaging: unsupported file type, 500 MB size limit, with plain-English guidance

---

### 2.2 Ladder Diagram & Core Filtering (Weeks 10–13)

The primary visualization artifact and the filter/search controls that drive it.

**Ladder Diagram Deliverables (FR-LAD)**

- D3.js swimlane renderer: vertical lanes per unique IP:port pair
- Swimlane headers: pill label with IP address, hostname (if resolvable), and IP version badge — IPv4 blue `#2E75B6`, IPv6 teal `#0D7377`
- Message arrows with method/code label, direction, relative timestamp, and transport protocol
- Color coding: INVITE (dark blue, solid), 2xx (green `#27AE60`, solid), 1xx (gray, dashed), 4xx/5xx/6xx (red/amber, solid)
- Retransmission arrows: dashed, 50% opacity, collapsed by default with expand control
- Click any arrow → right detail pane shows full raw SIP headers, parsed field table, SDP content, packet metadata
- Absolute/relative time axis toggle
- Pan and zoom: mouse wheel, trackpad pinch, on-screen controls
- Fit-to-screen button
- Mini-map navigator for flows with 30+ messages
- Phase brackets: Setup / Negotiation / Active / Teardown
- Virtual rendering for flows with 5,000+ messages (only draw visible arrows)
- Dynamic re-render on filter change in under 300 ms

**Dashboard Deliverables (FR-DASH)**

- Total packets, SIP messages, dialogs, capture time range
- SIP method distribution donut/pie chart
- Call success rate widget: 200 OK vs 4xx/5xx/6xx
- Endpoint table: IP, IP version, packet count, inferred SIP role
- IPv4 vs IPv6 traffic split ratio widget
- Timeline histogram: SIP message volume over capture duration
- Response code distribution bar chart
- Clickable widgets navigate to filtered ladder view

**Filtering & Search Deliverables (FR-FLT)**

- Global search: IP address, Call-ID, SIP method, response code, phone number
- Filter panel: IP version (v4/v6/both), SIP methods, response code classes, transport
- Time range slider for sub-window analysis
- Endpoint filter: select specific endpoints to narrow the diagram

---

## Phase 3 — Diagnostic Intelligence
**Weeks 14–21 | v1.0 Release**

The features that separate the SFA from a generic packet viewer: automated diagnostics, media analysis, RTP visibility, and protocol-level intelligence. This phase completes v1.0.

### 3.1 Troubleshooting Engine & Call Timing (Weeks 14–16)

**Troubleshooting Engine (FR-TSHOOT)**

All patterns below are Must Have for v1.0:

| Pattern | Description |
|---|---|
| FR-TSHOOT-003 | Missing ACK after 200 OK to INVITE |
| FR-TSHOOT-004 | Auth loops: 3+ consecutive 401/407 without 200 OK |
| FR-TSHOOT-005 | No provisional response within 4 seconds of INVITE |
| FR-TSHOOT-006 | Retransmission storm: 5+ retransmissions within T2 window |
| FR-TSHOOT-007 | INVITE rejected with 408 Request Timeout |
| FR-TSHOOT-008 | Incomplete dialog teardown — zombie call detection |
| FR-TSHOOT-010 | Codec mismatch: SDP offer/answer share no common codec |

Each issue entry shows: severity badge (Critical/Warning/Info), plain-English description, affected Call-ID(s), "Jump to Flow" link, "What does this mean?" expandable explanation, and Recommended Next Steps.

Call Health Score (0–100) per dialog, displayed as a color-coded badge on each dialog in the session list.

**Call Timing Metrics (FR-TIMING) — all Must Have**

| Metric | Threshold |
|---|---|
| Post-Dial Delay (PDD) | Green < 2 s, amber 2–5 s, red > 5 s |
| Time to Answer (TTA) | Per dialog |
| Call Setup Time | INVITE to ACK after 200 OK |
| Call Duration | ACK to BYE |
| Teardown Time | BYE to 200 OK for BYE; flag if > 32 s |
| Per-dialog and aggregate summary | Min, max, mean, 95th percentile |

---

### 3.2 SDP Analysis & Media Intelligence (Weeks 14–16, parallel with 3.1)

**SDP Analysis Panel (FR-MEDIA)**

- Side-by-side SDP Offer vs. Answer comparison: offered codecs, accepted codecs, rejected codecs, negotiated result
- Codec intersection computation with clear negotiated-codec label
- RTP endpoint info from SDP: connection address, audio port, video port for offer and answer
- NAT detection: private RFC 1918 address in SDP `c=` line vs. public IP in packet header
- HOLD/RESUME detection via `a=sendonly/recvonly/inactive/sendrecv` with ladder diagram labels
- DTMF negotiation check: flag dialogs where `telephone-event/8000` not in agreed SDP

---

### 3.3 Topology, Registration & Protocol Analysis (Weeks 17–21)

**Signaling Path Topology View (FR-TOPO)**

- Parse complete Via header chain from each SIP response to reconstruct proxy/SBC order
- Horizontal node graph: UAC → Proxy 1 → Proxy 2 → UAS with IP, transport, and inferred role labels
- B2BUA detection: endpoints that consume an INVITE and generate a new INVITE with different Call-ID
- Click-node-to-filter: selecting a topology node filters the ladder diagram to traffic through that node

**Registration Health Monitor (FR-REG)**

- Dedicated Registration tab: every REGISTER transaction grouped by AOR (user@domain)
- Per-entry: AOR, Contact address, result (200 OK/401/403/423/503), expiry, timestamp
- Registration timeline bars: green = registered, red = unregistered gap, yellow = pending challenge
- Detect 423 Interval Too Brief, failed re-registration, authentication failure loops (3+ retries without success)

**RTP Stream Identification (FR-RTP)**

- Match UDP traffic to SDP-negotiated ports; display in dedicated Media Streams panel
- Per-stream: SSRC, src/dst IP:port, codec, packet count, stream duration, first/last timestamp
- Ladder diagram RTP band between ACK and BYE: bidirectional / unidirectional / absent indicator
- Critical issue: No RTP detected after call established
- Detect RTP flowing to unexpected endpoints (NAT/SBC misconfiguration)
- Flag significant RTP asymmetry (e.g., 1000 packets sent, 0 received) as one-way audio indicator

**DTMF Event Visualization (FR-DTMF)**

- Detect RFC 2833/4733 RTP telephone-event payloads and SIP INFO DTMF bodies
- Annotated DTMF markers on ladder diagram time axis: digit label, method, duration
- Dedicated DTMF event timeline panel in chronological order
- Flag DTMF method mismatch (SDP negotiated RFC 2833 but DTMF arrives via SIP INFO)
- Flag missing `telephone-event` negotiation in SDP

**SIP ALG Detection (FR-ALG)**

- Detect Contact header rewriting: URI IP differs from packet source IP
- Detect Via header tampering: `received`/`rport` inconsistent with actual packet source
- Detect Content-Length corruption: header value does not match actual SDP body length
- Surface "SIP ALG Interference Suspected" Critical issue with before/after evidence and remediation steps

**v1.0 Exit Criteria**

All 13 acceptance criteria (AC-001 through AC-013) passing in Playwright E2E across Chrome, Firefox, Edge, and Safari. Performance: 100 MB PCAP parsed and diagram rendered in under 5 seconds. Memory: 500 MB PCAP within 1 GB browser allocation. Zero network requests when offline.

---

## Phase 4 — Collaboration, Export & Advanced Analysis
**Weeks 22–28 | v1.1 Release**

Enhances the platform from a personal diagnostic tool into a collaborative workflow tool — generating shareable reports, enabling multi-PCAP investigation, and completing the full export pipeline.

### 4.1 Capture Summary Report & Annotations (Weeks 22–24)

**Capture Summary Report Generator (FR-REPORT)**

- "Generate Report" button accessible from the dashboard toolbar and Issue List panel
- Report includes: capture metadata, executive summary, ranked issue list with plain-English descriptions, per-dialog timing metrics table, SDP negotiation results, embedded ladder diagrams for affected flows
- Exportable as PDF and as a self-contained HTML file (no external dependencies)
- Select dialogs and findings to include before generating
- Engineer Notes free-text field; configurable header fields (name, date, ticket number, customer)
- "Copy Summary to Clipboard" option for direct paste into ticketing systems
- Raw SIP message evidence section (INVITE, responses, BYE in monospace) for vendor escalation

**Annotations (FR-ANNOT)**

- Right-click any message arrow → annotate with note text, author, severity tag (Note/Warning/Finding)
- Annotation flags visible at all zoom levels on the diagram
- Annotations exported in PNG, SVG, and PDF
- Annotations saved in the JSON session file for colleague sharing
- Dedicated Annotations panel with jump-to-message links

**Keyboard Shortcuts (FR-KB) — full set**

| Key | Action |
|---|---|
| `J` / `K` | Step forward/backward through messages |
| `/` | Focus global search box |
| `E` | Expand/collapse right detail pane |
| `R` | Toggle retransmission visibility |
| `F` | Fit diagram to screen |
| `[` / `]` | Navigate between dialogs/sessions |
| `C` | Copy raw SIP message text to clipboard |
| `T` | Toggle absolute/relative timestamps |
| `?` | Open keyboard shortcut reference overlay |

**Inline RFC Tooltips (FR-TOOLTIP)**

- Every SIP header field name in the detail pane: hover tooltip with RFC reference, one-sentence description, and "Read RFC" link
- Common SIP response codes: hovering "486" shows "Busy Here — the called party is currently busy"
- SDP field labels (`c=`, `m=`, `a=`, `o=`, etc.) tooltip explaining each field's role
- Entire reference database bundled offline — works in air-gapped environments
- Learn Mode toggle: pin tooltips open on click for training sessions

---

### 4.2 Export Pipeline (Weeks 22–24, parallel with 4.1)

- SVG export: vector, fully scalable, includes annotation flags
- PNG export: rasterized at 2x resolution for Retina displays
- PDF export: A4 and Letter page sizes, multi-page for large call flows
- CSV export: filtered SIP message list (timestamp, src/dst IP:port, method/code, Call-ID)
- JSON export: complete parsed session as machine-readable structure
- One-click copy of any individual SIP message raw text to clipboard
- Dark/light mode: system-preference-aware with manual override toggle
- WCAG 2.1 AA accessibility audit and remediation; high-contrast theme

---

### 4.3 Multi-PCAP Correlation & Diff Mode (Weeks 25–28)

**Multi-PCAP Correlation (FR-MULTI)**

- Up to 4 PCAP files simultaneously, each labeled with a network point (e.g., Phone Side, SBC Ingress, Carrier Side)
- Correlate dialogs across captures by Call-ID; manual correlation UI for B2BUA leg linking
- Unified multi-point ladder diagram: all network points as swimlane groups on a shared timeline
- Missing-message indicators: red dashed arrow where a message was dropped between capture points
- Header diff between capture points: changed, added, removed fields highlighted
- Per-capture timestamp offset adjustment to compensate for clock drift

**PCAP Comparison / Diff Mode (FR-DIFF)**

- "Compare" button allows selecting any two dialogs (same or different PCAPs) as baseline and comparison
- Side-by-side ladder diagrams aligned by message sequence, not strictly by timestamp
- Missing messages in red ("Missing" label), additional messages in green ("Added" label)
- Click either message to open side-by-side header diff with SDP line-by-line diff
- Timing diff column: delta per metric (PDD, TTA, setup time) between the two dialogs
- Diff summary panel ranking all differences: structural → header-level → value-level

---

## Phase 5 — Advanced Protocol Support & Power Features
**Weeks 29–37 | v1.2 Release**

Extends the platform to cover encrypted transports, WebRTC environments, and power-user customization.

### 5.1 Audio Playback & Security Detection (Weeks 29–31)

**In-Browser Audio Playback (FR-AUDIO)**

- G.711 (PCMU/PCMA) RTP payload decode and in-browser playback: play, pause, scrub, volume
- Waveform visualization alongside playback: amplitude over time, silent periods visually distinct
- Independent send/receive stream controls — isolate each side of the conversation
- Scrubber time-aligned with ladder diagram: scrubbing audio scrolls the diagram to the matching position
- Silence gap detection (> 3 seconds within active stream) with waveform annotation
- G.722 wideband and Opus codec decode
- WAV export per stream direction
- All audio decoding client-side; no audio data transmitted remotely

**Security & Fraud Detection Panel (FR-SEC)**

- Dedicated Security tab with findings ranked by severity (Critical/High/Medium/Low/Info)
- SIP scanning: high-volume OPTIONS or REGISTER from single source targeting multiple accounts
- Registration hijacking: REGISTER for an AOR already bound from a different IP
- Toll fraud: high volume of short-duration INVITE dialogs to international/premium prefixes
- INVITE flooding: configurable threshold (default 10 INVITE/s) for DDoS detection
- Credential brute-forcing: repeated 401/407 + new Authorization headers from same source
- Cleartext SIP flagging: unencrypted UDP/TCP traffic present alongside TLS in the same capture

**SIP Forking Visualization (FR-FORK)**

- Detect forking: multiple 180/183 responses for a single INVITE with differing To-tags
- Render each fork as a parallel branch grouped under the originating INVITE
- Winning fork (200 OK) in full color; losing/CANCELed forks in desaturated style
- Fork Summary panel: branch count, each UAS endpoint, final response code, time-to-first-response
- Detect and flag missing CANCEL messages to losing forks

---

### 5.2 TLS Decryption & WebSocket Support (Weeks 32–34)

**TLS/SIPS Decryption (FR-TLS)**

- Accept Wireshark-compatible SSLKEYLOGFILE alongside a PCAP to decrypt TLS sessions
- Accept PEM-encoded RSA private key for RSA key exchange cipher suites
- TLS Session panel: cipher suite, TLS version, SNI, client/server IP, decryption status (Decrypted/Failed/No Key)
- Flag expired or self-signed certificates as Warnings in the Issue List
- TLS handshake failure detection with specific alert code and plain-English explanation
- TLS 1.3 requires SSLKEYLOGFILE (RSA path unavailable for ECDHE); documented clearly
- All key material exists in browser memory only — never persisted or transmitted
- Ladder diagram: padlock icon and "SIPS/TLS" transport badge on all decrypted messages

**WebSocket / WebRTC SIP Reassembly (FR-WS)**

- Detect SIP-over-WebSocket sessions via `Sec-WebSocket-Protocol: sip` upgrade handshake
- Reassemble SIP messages from WebSocket frames, handling fragmentation across TCP segments
- Label all WebSocket-transport messages with "WS" or "WSS" badge
- WSS integrated with TLS decryption pipeline
- Detect WebSocket connection drop mid-call and surface as "WebSocket Connection Dropped" issue
- ICE candidate exchange detection within SDP: display candidate types (host/srflx/relay), flag calls with no valid candidate pair

---

### 5.3 Power User & Analytics (Weeks 35–37)

**Custom Anomaly Rule Builder (FR-RULE)**

- Structured condition editor — no free-form code required
- Rule conditions composable with AND/OR logic across: SIP method, response code, any header value, timing metric, IP prefix, transport, IP version, Call-ID pattern, From/To URI pattern, codec, RTP present/absent
- Per rule: name, description, severity level, Recommended Action text
- Evaluated automatically on every capture load alongside built-in rules; results in same Issue List
- Export/import rules as JSON for team sharing and version control
- Rule test mode: run a single rule against the current capture and preview matching dialogs before saving

**Carrier / Trunk Health Dashboard (FR-TRUNK)**

- Dedicated Trunk Health tab aggregating statistics across all loaded PCAP sessions
- ASR (Answer Seizure Ratio): percentage of INVITE dialogs ending in 200 OK
- ACD (Average Call Duration) and ALOC by destination prefix or trunk group
- Failure code breakdown table: count and percentage per final response code, sortable
- PDD distribution histogram bucketed by 0–1 s, 1–2 s, 2–3 s, 3–5 s, > 5 s
- Concurrent calls over time graph: simultaneously active dialogs across the capture timeline
- All aggregate metrics exportable as CSV and formatted PDF trunk health report

**Sample PCAP Library (FR-SAMPLE)**

The library ships with at least 15 curated, pre-annotated captures covering:

- Successful IPv4 call and successful IPv6 call
- 401 authentication challenge and retry
- Codec mismatch (488 Not Acceptable Here)
- NAT traversal failure — one-way audio
- Session timer expiry drop
- REGISTER flow: success and 403 Forbidden failure
- Call transfer (REFER)
- SIP forking — parallel branches
- Retransmission storm
- T.38 fax handoff
- DTMF digit sequence via IVR
- WebSocket SIP call
- SIP scanning attack

Each sample loads with pre-configured filter and zoom state focused on the most instructive part of the flow, plus a step-by-step Guided Walkthrough mode with narrated annotations.

---

## Non-Functional Requirements

### Performance

| Requirement | Target |
|---|---|
| PCAP parsing throughput | ≥ 20 MB/s on mid-range laptop (Core i5 / M1, 8 GB RAM) |
| Diagram render (< 500 messages) | < 1 second after parsing |
| Diagram render (500–5,000 messages) | < 3 seconds with progressive feedback |
| Filter application latency | < 300 ms re-render |
| Maximum supported file | 500 MB / 1M packets / 50K SIP messages |
| Memory footprint | ≤ 1 GB browser allocation at maximum file size |

### Usability

| Requirement | Target |
|---|---|
| Time-to-first-insight (new user) | ≤ 60 seconds from first load to ladder diagram |
| Responsive layout | Full functionality at ≥ 1280 px; graceful degradation to 1024 px |
| Accessibility | WCAG 2.1 AA compliance; keyboard-navigable ladder diagram |
| Theme | System-preference-aware dark/light mode with manual override |
| Error messaging | Type + plain-English explanation + remediation action |

### Reliability

| Requirement | Target |
|---|---|
| Browser support | Latest 2 major versions of Chrome, Firefox, Edge, Safari |
| Crash resilience | Malformed PCAP surfaces graceful error, never crashes the tab |
| Parsing accuracy | > 99.9% on RFC 3261-conformant captures; zero false-positive SIP classifications |
| Data privacy | All processing client-side; zero packet data transmitted remotely |
| Offline capability | Fully functional without internet after initial load (PWA / Service Worker) |

---

## Key Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| WASM throughput misses 20 MB/s target | Medium | High | Benchmark by end of Phase 1 Week 2; switch to chunked Web Worker streaming if needed |
| SIP parser fails on vendor-specific non-RFC messages | High | Medium | Permissive parser with graceful degradation; build diverse real-world PCAP regression corpus |
| D3.js rendering degrades above 5,000 arrows | Medium | High | Virtual rendering in Phase 2 (draw only visible arrows); time-range cluster aggregation |
| Browser memory limit exceeded on large captures | Low | High | Stream parse with eviction of raw packet bytes; retain only parsed SIP structures |
| TLS 1.3 (EC)DHE sessions cannot be RSA-decrypted | High | High | Require SSLKEYLOGFILE for TLS 1.3; document and guide users to export key logs |
| Multi-PCAP clock drift misaligns correlation | High | Medium | Per-capture timestamp offset UI; auto-suggest offset from matching Via branch seen in both captures |
| False-positive anomaly alerts in troubleshooting engine | Medium | Medium | Tune thresholds against diverse PCAP corpus; allow user to dismiss/mute per-rule |
| Security detection false positives in call centers | High | Medium | All thresholds configurable; provide "high-volume environment" preset |

---

## Acceptance Criteria (v1.0)

All criteria must pass before v1.0 release.

| ID | Scenario | Expected Result |
|---|---|---|
| AC-001 | User drags a 50 MB IPv4-only PCAP onto the drop zone | Ladder diagram renders within 5 seconds; all SIP dialogs visible |
| AC-002 | PCAP contains mixed IPv4 and IPv6 SIP traffic | IPv4 swimlanes show blue badge; IPv6 show teal badge; statistics widget shows correct split |
| AC-003 | User drops a file with unsupported extension (.log) | Error message displayed; no crash |
| AC-004 | User clicks an INVITE arrow in the ladder diagram | Right detail panel shows full SIP INVITE headers, SDP offer, packet timestamp, src/dst IP and version badge |
| AC-005 | User filters by "IPv6 only" | Ladder redraws showing only IPv6 endpoints; IPv4-only lanes hidden |
| AC-006 | User clicks "Export PNG" | PNG downloaded at 2x resolution; arrows, labels, and swimlane headers legible |
| AC-007 | PCAP contains a 404 Not Found response to INVITE | 404 arrow rendered in red; Issue List shows failure; Call Health Score reflects it |
| AC-008 | PCAP contains SIP retransmissions | Retransmissions collapsed by default; expand control visible; dashed arrows on expand |
| AC-009 | PCAP contains a call with no ACK after 200 OK | Issue List: Critical — "Missing ACK after 200 OK" with Jump to Flow link |
| AC-010 | PCAP contains an auth loop (401 → INVITE → 401 → ...) | Issue List: Critical — "Authentication Loop Detected — Credential Failure Suspected" |
| AC-011 | PCAP contains SDP with private IP in c= but public signaling IP | SDP Analysis Panel flags NAT mismatch; Issue List shows one-way audio risk |
| AC-012 | User applies a Call-ID search filter | Ladder shows only the single dialog matching that Call-ID |
| AC-013 | Application loaded offline after initial load | All functionality operates; no network requests required |

---

## Definition of Done

**Per feature:** All Must Have requirements implemented and tested. Unit tests passing with > 80% line coverage. Relevant E2E acceptance criteria green. Reviewed by at least one other engineer. No TypeScript compilation warnings or console errors introduced. Dark mode and high-contrast theme verified for new UI components.

**Per phase:** All feature DoDs met within phase scope. Performance benchmarks documented. Phase demo conducted with stakeholder sign-off. Known issues logged with severity and assigned owner before advancing.

**v1.0 release:** All AC-001 through AC-013 passing in CI across Chrome, Firefox, Edge, and Safari. 100 MB PCAP parsed and diagram rendered in under 5 seconds. 500 MB PCAP processed within 1 GB browser allocation. Zero network requests confirmed in offline mode. WCAG 2.1 AA audit passed. User guide, deployment guide, and JSON schema documentation complete.

---

*SFA-IMPL-001 v2.0 — April 14, 2026 — Internal Confidential*
