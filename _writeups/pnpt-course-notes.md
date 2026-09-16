---
title: "PNPT Course Notes"
description: "Course notes organized across the PNPT certification path."
---

*PNPT certification path overview to be added.*

## Courses

{% assign courses = site.writeups | where: "writeup_parent", "pnpt-course-notes" | sort: "nav_order" %}
{% for course in courses %}
- [{{ course.title }}]({{ course.url | relative_url }}){% if course.description %} — {{ course.description }}{% endif %}
{% endfor %}
