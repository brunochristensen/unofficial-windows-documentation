---
title: "08. Information Gathering (Reconnaissance)"
description: "Lecture notes on passive reconnaissance, email and credential OSINT, subdomain discovery, and web technology fingerprinting."
writeup_parent: practical-ethical-hacking
course_id: practical-ethical-hacking
course_title: "Practical Ethical Hacking"
section_number: 8
nav_order: 8
---

Reconnaissance builds an accurate picture of a target before deeper testing
begins. This section emphasizes passive and low-impact collection, careful
correlation, and turning public information into testable hypotheses.

> [!IMPORTANT]
> Publicly accessible does not mean unrestricted. Confirm written authorization,
> current scope, program rules, data-handling requirements, and any restrictions
> on automated collection before interacting with a target or its users.

## Passive Reconnaissance Overview

### Physical and social information

For an authorized physical or social-engineering assessment, useful public
information may include:

- Satellite imagery and the general building layout
- Entrances, fences, reception areas, guards, cameras, and badge readers
- Break areas or other patterns of employee movement
- Employee names, photos, roles, reporting relationships, and contact details
- Photos that reveal badges, desks, screens, applications, or internal naming
  conventions

This information can help model how an organization operates, but collection
must remain within the assessment's physical and social-engineering scope.

### Web and host information

Target validation comes first. A mistyped domain or IP address can direct test
activity at an unrelated organization.

Useful web and host questions include:

- Which domains and subdomains are explicitly in scope?
- Which assets are excluded?
- What services and technologies are publicly visible?
- Which development, test, VPN, mail, API, or authentication systems appear to
  exist?
- Which findings came from third-party data, and which required direct contact
  with the target?

### Breach data

Historic breaches may expose organizational usernames, email formats, password
reuse patterns, and other identity data. On an authorized assessment, that data
can help evaluate credential risk. Handle it as sensitive evidence: minimize
collection, store it securely, restrict access, and dispose of it according to
the engagement agreement.

Reconnaissance and enumeration are high-value stages because modern external
environments may not expose an obvious unauthenticated software exploit.

## Identifying the Target

The lecture uses a public bug-bounty program as its example. The important
lesson is the scope-validation process, not the named company:

1. Open the program's current rules and scope definition.
2. Confirm that the program is still active.
3. Identify exact in-scope domains, wildcards, applications, and IP ranges.
4. Record all exclusions and prohibited test types.
5. Recheck the rules before testing a newly discovered asset.

A wildcard such as `*.example.com` may include subdomains, but exclusions and
special conditions still take precedence. Bug-bounty scope can change after a
course is recorded, so never rely on a lecture as authorization.

## Discovering Email Addresses

Organizational email discovery is useful for identity inventories, authorized
phishing assessments, and credential-risk testing.

### Repeatable workflow

1. Identify people and roles relevant to the assessment.
2. Collect several known public addresses for the organization.
3. Infer the dominant format, such as `first.last@example.com`,
   `first@example.com`, or `flast@example.com`.
4. Generate candidate addresses from known employee names.
5. Corroborate each candidate with more than one source when possible.
6. Mark addresses as observed, inferred, or verified instead of treating every
   result as equally reliable.

### Sources discussed

| Source | Useful information | Limitation |
| --- | --- | --- |
| Search engines | People, roles, addresses, and public documents | Results may be stale or ambiguous |
| Hunter.io | Domain email patterns, addresses, and source pages | Coverage and account limits change |
| Phonebook.cz | Domain-associated email addresses and URLs | A result is not proof that an account is current |
| Voila Norbert | Contact discovery | Service availability and limits may change |
| Clearbit Connect | People, roles, addresses, and professional profiles | Requires an account or browser integration |
| Email-verification services | Evidence that an address may accept mail | Catch-all domains and server behavior create false results |

Free quotas, prices, and interfaces shown in the recording are time-sensitive.
Verify the current service terms before using any of these tools.

### Account-recovery clues

Account-recovery pages sometimes disclose a masked email address or phone
number. That partial information can corroborate an identity, but it is not
conclusive by itself. Do not trigger recovery messages, lockouts, or other user
impact unless the rules of engagement explicitly permit it.

## Gathering Breached Credentials with Breach-Parse

Breach-Parse searches a local breach corpus for matching strings and separates
results into useful output lists. The lecture demonstrates searching for an
organizational email domain and reviewing:

- Email addresses or usernames
- Associated password material
- Repeated usernames or passwords
- Historic email-format changes
- Patterns that may inform an authorized credential audit

The underlying corpus is large and highly sensitive. Possessing or using breach
data may have legal, contractual, and privacy implications, so obtain approval
and follow the client's evidence-handling requirements.

### Credential stuffing vs. password spraying

| Technique | Input pattern |
| --- | --- |
| Credential stuffing | Tests known username/password pairs recovered from prior breaches |
| Password spraying | Tests one or a small number of candidate passwords across many accounts |

Both techniques can lock accounts, alert defenders, or affect real users. They
belong in a separately approved test window with rate limits and stop
conditions; reconnaissance alone does not authorize login attempts.

## Hunting Breached Credentials with DeHashed

The specific service is less important than the investigation method. A breach
search platform may allow pivots across:

- Email address
- Username
- Name
- Password or password hash
- IP address
- Phone number or physical address
- Other identifiers present in a breach record

### Correlation workflow

1. Begin with an in-scope organizational identifier.
2. Record the source and exact query used.
3. Pivot on a distinctive username, hash, or other identifier.
4. Compare results for consistent names, locations, domains, and timelines.
5. Seek an independent source before attributing an account to a person.
6. Distinguish fact, inference, and unresolved ambiguity in the notes.

An identical username may belong to different people, while an old breach
record may no longer represent a current employee. Strong reporting makes the
chain of evidence reproducible and does not overstate confidence.

Do not attempt to access personal accounts. If personal breach data is relevant
to an authorized corporate assessment, use only the minimum information needed
to evaluate the approved organizational risk.

## Hunting Subdomains - Part 1

Subdomains expand the visible attack surface beyond the primary website. Names
such as `dev`, `test`, `staging`, `qa`, `vpn`, `sso`, `mail`, and `api` can
suggest an asset's purpose, although the name alone does not establish risk.

### Sublist3r

Sublist3r gathers subdomains from multiple public sources. The lecture installs
and runs it with:

```bash
sudo apt install sublist3r
sublist3r -d example.com
```

Always inspect a tool's available options:

```bash
sublist3r -h
```

### Certificate Transparency

`crt.sh` searches public Certificate Transparency logs. A wildcard-style query
for `%.example.com` can reveal hostnames included in issued certificates,
including deeper names such as `service.dev.example.com`.

Certificate records are historical evidence. A discovered hostname may no
longer resolve or may point to infrastructure that has left scope.

## Hunting Subdomains - Part 2

Review discovery results for:

- Development, test, staging, and QA systems
- VPN, SSO, MFA, mail, and remote-access portals
- APIs, dashboards, and administrative interfaces
- Product or vendor names that reveal technologies in use
- Fourth-level and deeper subdomains

The lecture demonstrates additional Sublist3r options:

```bash
sublist3r -d example.com -t 100 -v
```

- `-t 100` increases the thread count.
- `-v` displays results as they are found.

More concurrency is not always appropriate. Respect program rate limits and
avoid unnecessary load.

OWASP Amass can combine multiple discovery techniques and data sources, though
comprehensive collection may take longer. A separate tool such as `httprobe`
can determine which discovered hosts respond over HTTP or HTTPS.

> [!NOTE]
> Searching third-party datasets can be passive; sending probes to each host is
> active interaction. Confirm that every candidate is in scope before a
> liveness check.

## Identifying Website Technologies

Technology fingerprinting produces leads for later enumeration.

| Tool | Collection approach | Typical output |
| --- | --- | --- |
| BuiltWith | Queries a third-party service | Frameworks, analytics, CDNs, integrations, and hosted services |
| Wappalyzer | Examines a visited page | CMS, language, libraries, server, platform, and version hints |
| WhatWeb | Sends requests from the command line | Headers, technologies, redirects, IPs, and version hints |

Basic WhatWeb usage:

```bash
whatweb https://example.com
```

Use multiple sources because each detects different evidence. A reported
technology or version may be hidden, stale, proxied, or incorrect. Verify the
fingerprint before researching vulnerabilities, and verify an actual vulnerable
condition before reporting one.

## Information Gathering with Burp Suite

Burp Suite is an intercepting web proxy. It sits between a testing browser and
the target so requests and responses can be inspected and, when authorized,
modified.

### Manual proxy setup shown in the lecture

1. Start a temporary Burp project with the default configuration.
2. Configure a dedicated browser profile to use `127.0.0.1` on port `8080` as
   its proxy.
3. Retrieve Burp's CA certificate from the local Burp page.
4. Trust that CA only in the dedicated testing browser profile.
5. Browse the authorized site and inspect **Proxy** history and the **Target**
   site map.

The recording uses a 2019 Firefox and Burp interface, so menu locations may
differ in current versions. Burp's bundled browser may also simplify setup.

> [!CAUTION]
> A trusted interception CA can decrypt HTTPS traffic seen by that browser.
> Keep it out of daily-use profiles and remove it when the lab is no longer
> needed.

### Information available in traffic

- Request methods, paths, query strings, cookies, and parameters
- Response status codes, headers, and bodies
- Server, framework, CMS, and version disclosures
- API endpoints and third-party services loaded by the page
- Internal hostnames or naming conventions exposed in headers or content

Turning interception off allows traffic to flow while Burp continues recording
history. Passive inspection of normal browsing differs from Burp Professional's
active scanner, which sends additional test requests and requires explicit
authorization.

## Google Fu

Search operators reduce noise and expose indexed assets or documents.

```text
site:example.com
site:example.com -www
site:example.com filetype:pdf
site:example.com filetype:docx
site:example.com filetype:xlsx
site:example.com filetype:csv
```

- `site:` limits results to a domain.
- A leading minus excludes a term from results.
- `filetype:` focuses on a document format.
- Combining operators helps locate alternate subdomains, public documents,
  backups, source material, or accidental disclosures.

Search results may contain confidential-looking data, but finding a URL does
not authorize deeper access. Record the discovery and follow the engagement's
reporting and evidence-handling process.

## Utilizing Social Media

Professional networks and social platforms can reveal:

- Employee names, roles, teams, and reporting relationships
- Badge design, office layout, workstations, or visible software
- Email-address candidates derived from the organization's naming convention
- Technologies, vendors, projects, or locations mentioned in posts
- Changes in employment that help assess whether other records are current

Treat the result as an intelligence lead rather than established fact. Images
may be old, profiles may be inaccurate, and several people may share the same
name. Corroborate important conclusions and record the source and collection
date.

Automated scraping can violate platform terms, create detectable traffic, or
collect unnecessary personal data. Use approved accounts and collection methods,
minimize personal information, and do not contact employees unless social
engineering is explicitly in scope.

## Reconnaissance Checklist

- Validate the target and reread current scope.
- Separate passive sources from actions that contact target systems or users.
- Build an asset inventory with provenance and timestamps.
- Collect email formats and identities with confidence labels.
- Handle breach data as sensitive evidence.
- Enumerate subdomains and confirm each one is in scope.
- Fingerprint technologies with more than one source.
- Preserve exact queries and evidence so results are reproducible.
- Convert observations into hypotheses for later scanning and enumeration.
