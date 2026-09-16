---
title: "04. Network Refresher"
description: "Lecture notes reviewing core networking concepts."
writeup_parent: practical-ethical-hacking
course_id: practical-ethical-hacking
course_title: "Practical Ethical Hacking"
section_number: 4
nav_order: 4
---

This section refresh basic networking concepts used throughout penetration
testing. The goal is to recognize common addressing, protocols, ports, and
network boundaries.

## Introduction — Network Refresher

- Networking is one of the core foundations of penetration testing.
- This section is a high-level refresher rather than an exhaustive networking
  course, and can safely be skipped.
- Topics include IP and MAC addressing, TCP and UDP, the OSI model,
  common ports, and subnetting.
- The same concepts will reappear during the introductory Linux and scanning
  sections.

## IP Addresses

### Viewing an address

On Kali Linux, `ifconfig` displays interface information:

```bash
ifconfig
```

- `inet` identifies the interface's IPv4 address.
- `inet6` identifies an IPv6 address.
- The comparable Windows command is `ipconfig`.

### IPv4

- IPv4 is a Layer 3 protocol used to address hosts and route traffic between
  networks.
- An IPv4 address contains 32 bits, divided into four 8-bit octets.
- Dotted-decimal notation makes those binary values readable—for example,
  `192.168.57.139`.
- Each octet has a decimal range of `0` through `255`.

The bit weights in an octet are:

| Bit | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Value | 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1 |

- All bits set to `1` total `255`.
- Only the final three bits set to `1` total `7` (`4 + 2 + 1`).
- IPv4 provides `2^32`, or approximately 4.3 billion, possible addresses.
  Public IPv4 space is limited, and not every possible address is assignable to
  a public host.

### IPv6

- IPv6 uses 128-bit hexadecimal addresses.
- Its much larger address space was designed to address IPv4 exhaustion.
- A full address contains eight groups of four hexadecimal digits separated by
  colons, such as `2001:0db8:85a3:0000:0000:8a2e:0370:7334`.
- Leading zeroes in a group may be omitted. One consecutive run of zero groups
  may be compressed with `::`.

### Private addresses and NAT

Private IPv4 addresses are reused inside local networks and are not routed
directly across the public internet:

| Private range | CIDR block |
| --- | --- |
| `10.0.0.0`–`10.255.255.255` | `10.0.0.0/8` |
| `172.16.0.0`–`172.31.255.255` | `172.16.0.0/12` |
| `192.168.0.0`–`192.168.255.255` | `192.168.0.0/16` |

- Network Address Translation (NAT) allows many privately addressed devices to
  share one public IPv4 address.
- A home may contain dozens of private addresses while consuming only one public
  address from its internet service provider.
- The lecture refers to Class A, B, and C networks. Classful addressing is useful
  historical shorthand, but modern networks use CIDR prefixes to describe their
  actual boundaries.
- Routers operate primarily at Layer 3 and make forwarding decisions using IP
  addresses.

## MAC Addresses

- A Media Access Control (MAC) address identifies a network interface at Layer 2,
  the data-link layer.
- Ethernet MAC addresses are normally 48 bits, written as six hexadecimal pairs,
  such as `00:1A:2B:3C:4D:5E`.
- Switches learn which MAC addresses are reachable through their ports and use
  that information to forward frames on a local network.
- The first three pairs normally form the Organizationally Unique Identifier
  (OUI), which can identify the interface vendor.
- An OUI lookup may reveal that a device is associated with VMware, Intel, Texas
  Instruments, or another manufacturer. It identifies a vendor, not necessarily
  the exact device.
- A router or other combined Layer 2/Layer 3 device may expose both the local IP
  and MAC address associated with a connected device.

> [!NOTE]
> MAC addresses are often described as permanent physical addresses, but many
> operating systems can change or randomize them. Treat them as local interface
> identifiers rather than proof of a device's identity.

## TCP, UDP, and the Three-Way Handshake

TCP and UDP operate at Layer 4, the transport layer.

### TCP

- Transmission Control Protocol (TCP) is connection-oriented.
- It provides ordered, acknowledged delivery and retransmits missing data.
- It is commonly used when reliable delivery matters, including traditional
  HTTP/HTTPS, SSH, and FTP connections.
- TCP is the protocol most frequently encountered during basic port scanning.

### UDP

- User Datagram Protocol (UDP) is connectionless.
- It has less protocol overhead and does not establish a session or guarantee
  delivery, ordering, or retransmission.
- It is common where low latency or simple request/response behavior is useful,
  including DNS, VoIP, and some streaming or real-time traffic.
- UDP ports must also be considered during an assessment, even though UDP
  scanning behaves differently from TCP scanning.

### TCP three-way handshake

```text
Client                         Server
  | ----------- SYN -----------> |
  | <-------- SYN-ACK ----------- |
  | ----------- ACK -----------> |
  |       Connection open         |
```

1. The client sends `SYN` to request a connection to a server port.
2. An available listening port responds with `SYN-ACK`.
3. The client sends `ACK`, completing the connection.

The lecture demonstrates this by capturing a connection to HTTPS port `443` in
Wireshark. Wireshark can be launched from a Kali terminal while retaining shell
access with:

```bash
wireshark &
```

The capture shows the client IP and ephemeral source port connecting to the
server's destination IP and port `443`. This handshake becomes important later
when examining port states and half-open or "stealth" SYN scans.

## Common Ports and Protocols

Port numbers identify network services. During enumeration, an open port provides
a clue about the service to investigate, but the detected service and version
should still be verified rather than assumed from the number alone.

| Port | Transport | Protocol | Purpose |
| ---: | --- | --- | --- |
| 21 | TCP | FTP | File transfer; supports uploading and downloading files |
| 22 | TCP | SSH | Encrypted remote shell and related secure services |
| 23 | TCP | Telnet | Unencrypted remote terminal access |
| 25 | TCP | SMTP | Sending and relaying email |
| 53 | TCP/UDP | DNS | Resolving names and IP addresses |
| 67/68 | UDP | DHCP | Dynamically leasing network configuration to clients |
| 69 | UDP | TFTP | Lightweight, unauthenticated file transfer |
| 80 | TCP | HTTP | Unencrypted web traffic |
| 110 | TCP | POP3 | Retrieving email |
| 123 | UDP | NTP | Network time synchronization |
| 139/445 | TCP | NetBIOS/SMB | Windows file and printer sharing; modern SMB commonly uses `445` |
| 143 | TCP | IMAP | Accessing and synchronizing email |
| 161 | UDP | SNMP | Monitoring and managing network devices |
| 389 | TCP/UDP | LDAP | Directory queries and authentication-related services |
| 443 | TCP | HTTPS | HTTP protected by TLS |
| 990 | TCP | FTPS | FTP protected by TLS |
| 3306 | TCP | MySQL | MySQL database service |
| 3389 | TCP | RDP | Microsoft Remote Desktop |

Key observations:

- SSH provides an encrypted alternative to Telnet's cleartext remote access.
- DNS translates human-readable names such as `google.com` into addresses used
  to route traffic. It uses both UDP and TCP depending on the operation.
- DHCP normally assigns an address from a configured pool for a limited lease.
  Static addressing keeps a consistent assignment, often by manual configuration
  or a DHCP reservation associated with a MAC address.
- SMB is common on Windows networks and has a significant attack history. The
  lecture highlights MS17-010/EternalBlue and the WannaCry outbreak as reasons to
  pay close attention to ports `139` and `445`.
- SNMP can disclose valuable device and network information when weak or default
  community strings are used.

## The OSI Model

The Open Systems Interconnection (OSI) model divides network communication into
seven conceptual layers. It provides a shared vocabulary for design and
troubleshooting.

| Layer | Name | Examples and responsibilities |
| ---: | --- | --- |
| 7 | Application | User-facing network services and protocols such as HTTP, SMTP, and FTP |
| 6 | Presentation | Data representation, encoding, encryption, compression, and formats such as JPEG or video |
| 5 | Session | Establishing, managing, and terminating application sessions |
| 4 | Transport | End-to-end transport with TCP or UDP; ports, segments, and datagrams |
| 3 | Network | IP addressing, packets, routing, and routers |
| 2 | Data Link | Frames, MAC addresses, Ethernet, and switches |
| 1 | Physical | Bits, cables, connectors, radio, and electrical signaling |

Mnemonic from Layer 1 through Layer 7:

> **P**lease **D**o **N**ot **T**hrow **S**ausage **P**izza **A**way.

Practical points:

- A device described as "Layer 2/3" performs both switching and routing.
- Outbound data moves from the application layer down toward the physical layer;
  received data moves upward from the physical layer.
- When troubleshooting, start with the simplest lower-layer checks and work up:
  confirm the cable or wireless link, check link lights and the network interface,
  verify addressing and routing, and only then investigate application behavior.
- Penetration testers regularly work with network engineers, so understanding
  layer-based shorthand makes technical discussions and scoping easier.

## Subnetting Part 1

Subnetting divides an address block into smaller networks. It controls how many
addresses belong to a network and allows organizations to separate device groups
such as workstations, servers, phones, and wireless clients.

### CIDR prefixes and subnet masks

- An IPv4 address has 32 bits.
- CIDR notation appends a prefix such as `/24` to show how many leading bits
  identify the network.
- Bits set to `1` in the subnet mask identify the network portion. Remaining bits
  represent addresses within that network.
- A `/24` has 24 network bits and the mask `255.255.255.0`.
- A larger prefix creates a smaller address block; a smaller prefix creates a
  larger address block.

Possible values for a partially filled mask octet are built by setting bits from
left to right:

```text
Bit value:  128  64  32  16   8   4   2   1
Mask value: 128 192 224 240 248 252 254 255
```

Examples:

- `/8`  → `255.0.0.0`
- `/16` → `255.255.0.0`
- `/23` → `255.255.254.0`
- `/24` → `255.255.255.0`
- `/27` → `255.255.255.224`
- `/28` → `255.255.255.240`

### Counting addresses

For an IPv4 prefix `/n`:

```text
Total addresses = 2^(32 - n)
Traditional usable hosts = total addresses - 2
```

The first address is the network ID and the last is the broadcast address, so
traditional subnets do not assign either to a host.

| Prefix | Mask | Total addresses | Traditional usable hosts |
| ---: | --- | ---: | ---: |
| `/16` | `255.255.0.0` | 65,536 | 65,534 |
| `/22` | `255.255.252.0` | 1,024 | 1,022 |
| `/23` | `255.255.254.0` | 512 | 510 |
| `/24` | `255.255.255.0` | 256 | 254 |
| `/25` | `255.255.255.128` | 128 | 126 |
| `/26` | `255.255.255.192` | 64 | 62 |
| `/27` | `255.255.255.224` | 32 | 30 |
| `/28` | `255.255.255.240` | 16 | 14 |
| `/29` | `255.255.255.248` | 8 | 6 |
| `/30` | `255.255.255.252` | 4 | 2 |

> [!NOTE]
> The subtract-two rule describes conventional host subnets. `/31` is commonly
> used for point-to-point links, and `/32` identifies one address, so those
> prefixes are special cases.

### Worked examples

#### `192.168.1.0/24`

- Mask: `255.255.255.0`
- Total addresses: 256
- Network ID: `192.168.1.0`
- Usable range: `192.168.1.1`–`192.168.1.254`
- Broadcast: `192.168.1.255`

#### `192.168.1.0/28`

- Mask: `255.255.255.240`
- Total addresses: 16; traditional usable hosts: 14
- Network ID: `192.168.1.0`
- Usable range: `192.168.1.1`–`192.168.1.14`
- Broadcast: `192.168.1.15`
- The next `/28` begins at `192.168.1.16` and broadcasts at
  `192.168.1.31`.

#### `192.168.0.0/23`

- Mask: `255.255.254.0`
- Total addresses: 512; traditional usable hosts: 510
- Network ID: `192.168.0.0`
- Usable range: `192.168.0.1`–`192.168.1.254`
- Broadcast: `192.168.1.255`
- The next `/23` begins at `192.168.2.0` and broadcasts at
  `192.168.3.255`.

### Penetration-testing relevance

- A client may provide scope as CIDR blocks rather than individual addresses.
- Reading the prefix reveals the maximum address space that must be scanned. A
  `/20`, for example, contains 4,096 total addresses, while a `/24` contains 256.
- Separate subnets may indicate functional or security boundaries between
  servers, user systems, phones, and wireless devices.
- A CIDR calculator is useful for daily work, but understanding the calculation
  helps catch incorrect scope boundaries.

Supporting resources supplied with the lecture:

- [Seven Second Subnetting](https://www.youtube.com/watch?v=ZxAwQB8TZsM)
- [Subnet Guide](https://drive.google.com/file/d/1ETKH31-E7G-7ntEOlWGZcDZWuukmeHFe/view)

## Subnetting Part 2

This lecture solves the three practice networks assigned at the end of Part 1.

### `192.168.0.0/22`

- Mask: `255.255.252.0`
- Total addresses: 1,024; traditional usable hosts: 1,022
- Network ID: `192.168.0.0`
- Usable range: `192.168.0.1`–`192.168.3.254`
- Broadcast: `192.168.3.255`

### `192.168.1.0/26`

- Mask: `255.255.255.192`
- Total addresses: 64; traditional usable hosts: 62
- Network ID: `192.168.1.0`
- Usable range: `192.168.1.1`–`192.168.1.62`
- Broadcast: `192.168.1.63`
- The next `/26` begins at `192.168.1.64` and broadcasts at
  `192.168.1.127`.

### `192.168.1.0/27`

- Mask: `255.255.255.224`
- Total addresses: 32; traditional usable hosts: 30
- Network ID: `192.168.1.0`
- Usable range: `192.168.1.1`–`192.168.1.30`
- Broadcast: `192.168.1.31`
- The next `/27` begins at `192.168.1.32` and broadcasts at
  `192.168.1.63`.

The practical takeaway is pattern recognition: `/24` is a useful baseline,
higher prefixes represent smaller networks, and lower prefixes represent larger
networks. Exact values can be checked with a cheat sheet or CIDR calculator, but
the prefix should immediately provide a rough sense of assessment scope.
