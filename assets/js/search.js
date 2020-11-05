---
layout: null
---
{% assign title = site.settings | where: 'slug', 'general' | map: 'title' | first %}
{% assign nav = site.menus | where: 'slug', 'header' | map: 'items' | map: 'title' | push: '' | unshift: title | unshift: title | unshift: '·' %}
window.search = [
  {% for page in site.pages %}
  {% assign replace = nav | unshift: page.title | join: ' ' %}
  {
    "title": "{{page.title}}",
    "url": "{{page.url}}",
    "content": "{{page.output | strip_html | normalize_whitespace | replace: replace, ''}}"
  },
  {% endfor %}
  {% for post in site.posts %}
  {% assign replace = nav | unshift: post.title | join: ' ' %}
  {
    "title": "{{post.title}}",
    "url": "{{post.url}}",
    "content": "{{post.output | strip_html | normalize_whitespace | replace: replace, '' }}"
  }{% unless forloop.last %}, {% endunless %}
  {% endfor %}
];