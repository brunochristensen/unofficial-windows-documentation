---
title: "Practical Ethical Hacking"
description: "Course notes for Practical Ethical Hacking, organized by section."
writeup_parent: pnpt-course-notes
course_id: practical-ethical-hacking
course_title: "Practical Ethical Hacking"
nav_order: 0
---

*Course overview to be added.*

## Sections

{% assign sections = site.writeups | where: "writeup_parent", "practical-ethical-hacking" | sort: "section_number" %}
{% for section in sections %}
- [{{ section.title }}]({{ section.url | relative_url }}){% if section.description %} — {{ section.description }}{% endif %}
{% endfor %}
