base_api_url = "https://5e.tools/data/spells/spells-"
schools_map = {
  "A": "Abjuration",
  "C": "Conjuration",
  "D": "Divination",
  "E": "Enchantment",
  "V": "Evocation",
  "I": "Illusion",
  "N": "Necromancy",
  "T": "Transmutation"
}

function init_spells() {
  document.querySelectorAll('a').forEach(spellLink => {
    if(!spellLink.href.startsWith("https://5e.tools/spells.html"))
      return

    init_spell(spellLink)
  });
}

function init_spell(spellLink){
  let spell = new Spell(spellLink.href)
  fetch(spell.api_url())
    .then((response) => response.json())
    .then((json) => spell.save_spell_info(json))
    .then(() => spell.init_anchor(spellLink))
    .catch(function(error) {
      console.log("Can't read this spell's JSON" + error);
    })
}

class Spell{
  constructor(url) {
    let name_book = url.split("#")[1].split("_")
    this.name = decodeURI(name_book[0])
    this.book = name_book[1]
    this.tooltip = document.getElementById('spell-tooltip');
    this.default_tooltip = this.tooltip.innerHTML
  }

  api_url(){
    return base_api_url + this.book + ".json"
  }

  save_spell_info(json) {
    let spell_info = json.spell.filter(item => item.name.toLowerCase() === this.name)[0]
    this.name = spell_info.name
    this.level = spell_info.level
    this.school = spell_info.school
    this.components = spell_info.components
    this.casting_time = spell_info.time
    this.range = spell_info.range
    this.duration = spell_info.duration
    this.entries = spell_info.entries
  }

  init_anchor(spellLink) {
    spellLink.addEventListener('mouseover', (event) => {
      let to_replace = this.tooltip.innerHTML
      to_replace = to_replace.split("[[SPELL-NAME]]").join(this.name)
      to_replace = to_replace.split("[[SPELL-LEVEL]]").join(this.level_s())
      to_replace = to_replace.split("[[SPELL-CAST]]").join(this.casting_time_s())
      to_replace = to_replace.split("[[SPELL-COMPONENTS]]").join(this.components_s())
      to_replace = to_replace.split("[[SPELL-SCHOOL]]").join(this.school_s())
      to_replace = to_replace.split("[[SPELL-RANGE]]").join(this.range_s())
      to_replace = to_replace.split("[[SPELL-DURATION]]").join(this.duration_s())
      to_replace = to_replace.split("[[SPELL-ENTRIES]]").join(this.entries_s())

      this.tooltip.innerHTML = to_replace
      this.tooltip.style.left = event.pageX + 20 + 'px';
      this.tooltip.style.top = event.pageY - 100 + 'px';
      this.tooltip.classList.add('tooltip-visible');
    });

    spellLink.addEventListener('mouseout', () => {
      this.tooltip.innerHTML = this.default_tooltip
      this.tooltip.classList.remove('tooltip-visible');
    });

    spellLink.addEventListener('mousemove', (event) => {
      this.tooltip.style.left = event.pageX + 20 + 'px';
      this.tooltip.style.top = event.pageY - 100 + 'px';
  });
  }

  level_s() {
    return this.level != 0 ? this.level : "Cantrip"
  }

  casting_time_s() {
    return this.casting_time.map( (elem) => elem.number + " " + elem.unit ).join(" or ")
  }

  components_s() {
    let components = []
    if(this.components.v)
      components.push("V")
    if(this.components.s)
      components.push("S")
    if(this.components.m)
      components.push("M ("+this.components.m+")")
    return components.join(", ")
  }

  school_s() {
    return schools_map[this.school]
  }

  range_s(){
    let str = ""
    if(this.range.distance.amount)
      str = this.range.distance.amount + "-" + this.range.distance.type
    else
      str = this.range.distance.type
    
    if(this.range.type != "point")
      str = "Self(" + str + " " + this.range.type+ ")"
    return str
    
  }

  duration_s(){
    return this.duration.map((d) => {
      let str = ""
      if(d.type=="instant")
        return "Instantaneous"
      d.concentration && (str +="Concentration, up to ")
      str += d.duration.amount + " " + d.duration.type
      return str
    }).join(" or ")
  }

  entries_s(){
    return this.entries.map((entry) => {
      if(typeof entry == "string")
        return "<p>"+entry+"</p>"
      if(entry.type == "list"){
        return "<ul>" + entry.items.map((item) => "<li>" + item + "</li>").join("") + "</ul>"
      }
    } ).join("\n\n")
  }
}
