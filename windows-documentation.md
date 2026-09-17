---
layout: page
title: "Unofficial Windows Documentation"
description: "Observed Windows behavior, internals, system components, and practical reference material."
permalink: /windows-documentation/
---

Notes and reference material for understanding Windows behavior in real-world
environments.

This documentation is based on practical investigation and is not affiliated
with, authorized by, or endorsed by Microsoft.

## Topics

{% assign documents = site.docs | sort: "title" %}
{% for document in documents %}
- [{{ document.title }}]({{ document.url | relative_url }}){% if document.description %} — {{ document.description }}{% endif %}
{% endfor %}
