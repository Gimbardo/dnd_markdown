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

let tooltip
let overlay
let close_button
let default_tooltip_text
let clicked = false


function init_spells() {
  document.querySelectorAll('a').forEach(spellLink => {
    if(!spellLink.href.startsWith("https://5e.tools/spells.html"))
      return

    init_spell(spellLink)
  });
}

// Tooltip

function init_tooltip() {
  overlay = document.getElementById('overlay');
  tooltip = document.getElementById('spell-tooltip');
  close_button = document.getElementById('close-tooltip');
  default_tooltip_text = tooltip.innerHTML;
}

function hide_tooltip()
{
  clicked = false
  tooltip.innerHTML = default_tooltip_text
  tooltip.classList.remove('tooltip-visible');
  overlay.style.display = 'none';
}

function view_tooltip(event, spell){
  let to_replace = tooltip.innerHTML
  to_replace = to_replace.split("[[SPELL-NAME]]").join(spell.name)
  to_replace = to_replace.split("[[SPELL-LEVEL]]").join(spell.level_s())
  to_replace = to_replace.split("[[SPELL-CAST]]").join(spell.casting_time_s())
  to_replace = to_replace.split("[[SPELL-COMPONENTS]]").join(spell.components_s())
  to_replace = to_replace.split("[[SPELL-SCHOOL]]").join(spell.school_s())
  to_replace = to_replace.split("[[SPELL-RANGE]]").join(spell.range_s())
  to_replace = to_replace.split("[[SPELL-DURATION]]").join(spell.duration_s())
  to_replace = to_replace.split("[[SPELL-ENTRIES]]").join(spell.entries_s())

  tooltip.innerHTML = to_replace
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const modalHeight = tooltip.offsetHeight;
  tooltip.style.top = (window.innerHeight / 2 - modalHeight / 2 + scrollTop) + 'px';
  overlay.style.display = 'block';
  //tooltip.style.left = event.pageX + 20 + 'px';
  //tooltip.style.top = event.pageY - 100 + 'px';
  tooltip.classList.add('tooltip-visible');
}

// Spells

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
    spellLink.href = "javascript:void(0)"
    spellLink.role = "button"
    spellLink.addEventListener('click', (event) => {
      view_tooltip(event, this)
      clicked = true
    }, false);

    //spellLink.addEventListener('mouseover', (event) => {
    //  if(clicked)
    //    return
    //  view_tooltip(event, this)
    //});
//
    //spellLink.addEventListener('mouseout', () => {
    //  if(clicked)
    //    return
    //  hide_tooltip()
    //});

    //spellLink.addEventListener('mousemove', (event) => {
    //  if(clicked)
    //    return
    //  tooltip.style.left = event.pageX + 20 + 'px';
    //  tooltip.style.top = event.pageY - 100 + 'px';
    //});
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
