---
layout: null
---
window.search = [
  {% for page in site.pages %}
  {
    "title": "{{page.title}}",
    "url": "{{page.url}}",
    "content": "{{page.output | strip_html | normalize_whitespace }}"
  }{% unless forloop.last %},{% endunless %}
  {% endfor %}
];