---
permalink: /
title: Home
image: /assets/media/photo-1525538182201-02cd1909effb.jpeg
description: This is the homepage of a great website!
sections:
  - title: Hero
    blocks:
      - type: text
        text: dasdada
        class: dasdadadad
      - type: image
        src: /assets/media/photo-1485827329522-c625acce0067.jpeg
        alt: adsada
        ratio: 3by2
        loading: lazy
      - type: list
        tag: ul
        layout: list
        perPage: 1
        max: 0
        text: dsdadas
        items:
          - text: |-
              # cenas

              ## mais cenas

              ![octopussy](/assets/media/photo-1485827329522-c625acce0067.jpeg)

              [cena](https://cena.com)
      - type: collection
        layout: list
        perPage: 1
        max: 0
        collection: organizations
        filters:
          - condition: is
            key: relationship
            value: client
      - type: map
        markers:
          - name: sdfsf
            latitude: sdfdsf
            longitude: sdfsfsd
    script: /assets/js/search.js
---
