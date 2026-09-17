---
title: "07. The Ethical Hacker Methodology"
description: "Lecture notes on the five stages used to structure an ethical hacking assessment."
writeup_parent: practical-ethical-hacking
course_id: practical-ethical-hacking
course_title: "Practical Ethical Hacking"
section_number: 7
nav_order: 7
---

The same high-level methodology applies to network, web application, wireless,
and other penetration tests. The tools and attack paths change, but the overall
process remains consistent.

> [!IMPORTANT]
> Only test systems for which you have explicit authorization. The agreed scope
> and rules of engagement control every stage of the assessment.

## The Five Stages of Ethical Hacking

| Stage | Purpose | Typical activities |
| ---: | --- | --- |
| 1 | Reconnaissance | Gather information about the organization, people, systems, and potential entry points |
| 2 | Scanning and enumeration | Identify reachable hosts, open ports, services, versions, and possible vulnerabilities |
| 3 | Gaining access | Validate an approved attack path by exploiting a vulnerability or other weakness |
| 4 | Maintaining access | Determine whether approved persistence is possible and continue assessing from the new position |
| 5 | Cleanup | Remove test accounts, payloads, tools, and other assessment artifacts as agreed with the client |

### 1. Reconnaissance

Reconnaissance is also called information gathering. It is divided into two
broad categories:

- **Passive reconnaissance** uses information already available from sources
  such as search engines, public websites, social media, and professional
  networks. It avoids directly probing the target.
- **Active reconnaissance** interacts with target-owned infrastructure and
  begins to overlap with scanning and enumeration.

Useful information may include employee names, organizational roles, public
contact details, technologies in use, building information, and exposed
internet assets.

### 2. Scanning and Enumeration

Scanning discovers systems and services. Enumeration examines those results in
greater depth.

- Tools such as Nmap, Nessus, and Nikto can identify ports, services, and
  potential weaknesses.
- An open port is a starting point, not a complete finding.
- If a web server is discovered, enumerate its technology and version, then
  research relevant vulnerabilities and configuration weaknesses.
- Record both positive and negative results so another tester can reproduce the
  work.

### 3. Gaining Access

This stage is also called exploitation. The tester attempts to validate a
discovered weakness and gain access to an application, host, or network.

- Use only techniques permitted by the rules of engagement.
- Prefer the least disruptive method that proves impact.
- Preserve evidence needed for reporting.
- Once access is gained, reconnaissance and enumeration begin again from the
  new position.

### 4. Maintaining Access

The goal is to assess whether access could survive a disconnected session,
restart, or other change. Persistence can materially alter a system, so it
requires explicit authorization and a documented cleanup plan.

### 5. Cleanup

The lecture calls this stage "covering tracks," but on a professional
assessment the objective is controlled cleanup, not concealing activity.

- Remove test accounts, uploaded tools, payloads, persistence mechanisms, and
  other artifacts created during the engagement.
- Restore changed settings when the rules of engagement require it.
- Coordinate with the client before deleting logs or other evidence. Normal
  client security logs should not be erased merely to hide test activity.
- Document what was changed, what was removed, and anything the client must
  finish removing.

## Methodology as a Cycle

The stages are not strictly linear:

```text
Reconnaissance -> Scanning and enumeration -> Gaining access
                         ^                         |
                         |_________________________|
                                  repeat
```

New access exposes new networks, services, identities, and trust relationships.
The tester therefore returns to information gathering and enumeration until the
assessment objectives are met. Persistence testing and cleanup complete the
engagement.

## Key Takeaways

- Methodology is more durable than any individual tool.
- Reconnaissance and enumeration often determine the quality of the entire
  assessment.
- The process should become repeatable enough to explain clearly in an
  interview or report.
- Authorization, scope, evidence handling, and cleanup apply throughout all
  five stages.
