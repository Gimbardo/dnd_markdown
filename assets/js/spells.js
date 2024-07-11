base_api_url = "https://5e.tools/data/spells/spells-"

function fetch_spell_info(url){
  spell = new Spell(url)
  fetch(spell.api_url())
    .then((response) => response.json())
    .then((json) => spell.save_spell_info(json))
    .catch(function(error) {
      console.log("Can't read this spell's JSON");
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
    spell = json.spell.filter(item => item.name.toLowerCase() == this.name)[0]
    console.log(spell)
  }
}

// fetch_spell_info("https://5e.tools/spells.html#motivational%20speech_ai")