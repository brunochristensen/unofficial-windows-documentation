---
layout: page
title: "Tools & Resources"
permalink: /tools/
---

A running list of tools, utilities, and references..

> [!NOTE]
> This page is a work in progress — more links and write-ups are on the way.

## Utilities

- _Coming soon._

## Reference

- [Microsoft Learn](https://learn.microsoft.com/en-us/windows/) — official docs

## Useful Queries

{% assign queries = site.tools | where: "tool_section", "useful-queries" | sort: "nav_order" %}
{% for query in queries %}
- [{{ query.title }}]({{ query.url | relative_url }}){% if query.description %} — {{ query.description }}{% endif %}
{% endfor %}

## Baselined Behavior

{% assign baselines = site.tools | where: "tool_section", "baselined-behavior" | sort: "nav_order" %}
{% for baseline in baselines %}
- [{{ baseline.title }}]({{ baseline.url | relative_url }}){% if baseline.description %} — {{ baseline.description }}{% endif %}
{% endfor %}
