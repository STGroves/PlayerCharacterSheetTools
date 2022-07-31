<<<<<<< HEAD
---
---
=======
------
<body>
>>>>>>> 5806d09a0df76c5277b22a0e2e06aa87671d223f
{% assign doclist = site.pages | sort: 'url'  %}
    <ul>
       {% for doc in doclist %}
            {% if doc.name contains '.md' or doc.name contains '.html' %}
                <li><a href="{{ site.baseurl }}{{ doc.url }}">{{ doc.url }}</a></li>
            {% endif %}
        {% endfor %}
    </ul>
</body>
