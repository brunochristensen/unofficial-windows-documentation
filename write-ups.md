---
layout: page
title: "Write-ups"
permalink: /write-ups/
---

Longer-form investigations, notes, and reviews.

## Recent

{% assign writeups = site.writeups | sort: "title" %}
{% for w in writeups %}
{% unless w.writeup_parent %}
- [{{ w.title }}]({{ w.url | relative_url }}){% if w.description %} — {{ w.description }}{% endif %}
{% endunless %}
{% endfor %}
