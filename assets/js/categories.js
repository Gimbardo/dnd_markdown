---
---

{%- for my_doc in site.sheets -%}

  {%- for category in my_doc.categories -%}
    {%- capture my_categories -%}
      {%- if my_categories -%}
        {{ my_categories | join: "," }},{{ category }}
      {%- else -%}
         {{ category }}
      {%- endif -%}
    {%- endcapture -%}
  {%- endfor -%}
{%- endfor -%}

{%- assign my_categories = my_categories | split: "," | uniq -%}

const categories = {
  {%- for category in my_categories -%}
    {{ category }}: [
      {%- for sheet in site.sheets -%}{% if sheet.categories contains category %}
        {
          url: `{{ site.baseurl }}{{ sheet.url }}`,
          title: `{{sheet.title}}`
        },
      {% endif %}{% endfor %}
    ],
  {%- endfor -%}
}

function handle_categories() {
  document.querySelectorAll(".category").forEach((category) => {
    category.addEventListener("click", function (e) {
      const sheets = categories[e.target.innerText.replace(" ","_")];
      let html = ``
      sheets.forEach(sheet=>{
        html += `
        <a class="modal-article" href="${sheet.url}">
          <h4>${sheet.title}</h4>
        </a>
        `
      })
      document.querySelector("#category-modal-title").innerText = e.target.innerText;
      document.querySelector("#category-modal-content").innerHTML = html;
      document.querySelector("#category-modal-bg").classList.toggle("open");
      document.querySelector("#category-modal").classList.toggle("open");
    });
  });

  document.querySelector("#category-modal-bg").addEventListener("click", function(){
    document.querySelector("#category-modal-title").innerText = "";
    document.querySelector("#category-modal-content").innerHTML = "";
    document.querySelector("#category-modal-bg").classList.toggle("open");
    document.querySelector("#category-modal").classList.toggle("open");
  })
}
