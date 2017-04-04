{% for item, key in data %}
  <ul class="mb-nav" id="dom_{{ item.index }}">
    <a href="{{ url }}"
       target="_blank"
       class="mb-blog-name"
       title="跳转至{{ key }}">
      {{ key }}
    </a>

    {% for sub in item %}
      <li class="mb-item">
        <a href="{{ sub.url }}" target="_blank" class="mb-title">
          {{ sub.title }}

          {% if sub.time %}
            <span class="blog-time">
              {{ sub.time }}
            </span>
          {% endif %}
        </a>
      </li>
    {% endfor %}
  </ul>
{% endfor %}