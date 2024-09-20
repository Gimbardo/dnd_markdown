
stats_map =  {
  "STR": stat("Strength", ["Athletics"]),
  "DEX": stat("Dexterity", ["Acrobatics", "SleightOfHand", "Stealth", "Initiative"]),
  "CON": stat("Constitution", []),
  "INT": stat("Intelligence", ["Arcana", "Nature", "History", "Religion", "Investigation"]),
  "WIS": stat("Wisdom", ["AnimalHandling", "Perception", "Medicine", "Insight", "Survival"]),
  "CHA": stat("Charisma", ["Performance", "Deception", "Persuasion", "Intimidation"])
}

function stat(name, skills) {
  return { "name": name, "skills": skills }
}

let proficiency = 0

function substitute_stats(title) {

  return fetch('/assets/json/' + title + ".json")
    .then((response) => response.json())
    .then((json) => json_substitute(json))
    .catch(function(error) {
      console.log("Can't read JSON stat file" + error);
    })
}

function json_substitute(stats_file){
  proficiency = Math.ceil(stats_file["LVL"]/4)+1
  substitution_map = {
    "LVL": stats_file["LVL"],
    "PROF": proficiency,
    "CA": stats_file["CA"]
  }

  for(let stat in stats_map) {
    base_mod = stat_mod(stats_file[stat])
    substitution_map[stat] = stats_file[stat]
    substitution_map[stat+"_MOD"] = base_mod
    substitution_map[stat+"_ST"] = st_mod(base_mod, stats_file, stat)

    for(let skill of stats_map[stat]["skills"]){
      substitution_map[skill] = skill_mod(base_mod, stats_file, skill)
    }
    substitution_map
  }
  substitution_map["PP"] = substitution_map['Perception']+10
  substitution_map["HP"] = stats_file["HP"] || calc_hp(stats_file["LVL"], substitution_map["CON_MOD"], stats_file["HITDICE"])
  
  if(stats_file["SpellcastingAbility"]) {
    stat = stats_file["SpellcastingAbility"]
    substitution_map["SPELL_AB"] = stats_map[stat]["name"]
    substitution_map["SPELL_DC"] = 8 + proficiency + substitution_map[stat+"_MOD"]
    substitution_map["SPELL_ATK"] = proficiency + substitution_map[stat+"_MOD"]
  }

  for(let key in substitution_map) {
    value = substitution_map[key]
    document.body.innerHTML = document.body.innerHTML.split(build_keyword(key)).join(value);
  }
}

function stat_mod(stat) {
  return Math.floor((stat-10)/2)
}

function st_mod(base_mod, stats_file, stat) {
  if(stats_file["STProf"]?.includes(stat))
    return base_mod + proficiency
  return base_mod
}

function skill_mod(base_mod, stats_file, skill){
  if(stats_file["Expertise"]?.includes(skill))
    return base_mod + proficiency*2
  else if(stats_file["SkillProf"]?.includes(skill))
    return base_mod + proficiency
  else if(stats_file["JackOfAllTrades"])
    return base_mod + Math.floor(proficiency/2)
  return base_mod
}

function calc_hp(lev, con, dice){
  medium_roll = (dice/2)+1+con
  return (lev-1)*medium_roll + dice + con
}

function build_keyword(key) {
  return "[[" + key + "]]"
}

function signed(n) {
  return (n<=0?"-":"+") + n
}
