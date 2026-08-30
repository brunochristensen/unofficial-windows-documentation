---
layout: page
title: "Write-ups"
permalink: /write-ups/
---

Longer-form investigations — digging into a piece of Windows behavior until it
either makes sense or turns out to be benign.

## Recent

{% assign writeups = site.writeups | sort: "title" %}
{% for w in writeups %}
- [{{ w.title }}]({{ w.url | relative_url }}){% if w.description %} — {{ w.description }}{% endif %}
{% endfor %}
