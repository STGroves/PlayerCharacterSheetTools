<<<<<<< HEAD
---
---
<<<<<<< HEAD
=======
------
<body>
>>>>>>> 5806d09a0df76c5277b22a0e2e06aa87671d223f
=======
<html>
    <body>
>>>>>>> e2aeb9f58e25080233162998e25253c4aba68cd0
{% assign doclist = site.pages | sort: 'url'  %}
    <ul>
       {% for doc in doclist %}
            {% if doc.name contains '.md' or doc.name contains '.html' %}
                <li><a href="{{ site.baseurl }}{{ doc.url }}">{{ doc.url }}</a></li>
            {% endif %}
        {% endfor %}
    </ul>
<<<<<<< HEAD
</body>
=======
    </body>
</html>
>>>>>>> e2aeb9f58e25080233162998e25253c4aba68cd0
