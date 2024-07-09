stats_skill_map =  {
  "STR": ["Athletics"],
  "DEX": ["Acrobatics", "SleightOfHand", "Stealth", "Initiative"],
  "CON": [],
  "INT": ["Arcana", "Nature", "History", "Religion", "Investigation"],
  "WIS": ["AnimalHandling", "Perception", "Medicine", "Insight", "Survival"],
  "CHA": ["Performance", "Deception", "Persuasion", "Intimidation"]
}

proficiency = 0

function substitute_stats(title) {

  fetch('/assets/json/' + title + ".json")
    .then((response) => response.json())
    .then((json) => json_substitute(json))
    .catch(function(error) {
      console.log("Can't read JSON stat file");
    })
}

function json_substitute(stats_file){
  proficiency = Math.ceil(stats_file["LVL"]/4)+1
  substitution_map = {
    "LVL": stats_file["LVL"],
    "PROF": proficiency,
    "CA": stats_file["CA"]
  }

  for(let stat in stats_skill_map) {
    base_mod = stat_mod(stats_file[stat])

    substitution_map[stat] = stats_file[stat]
    substitution_map[stat+"_MOD"] = base_mod
    substitution_map[stat+"_ST"] = st_mod(base_mod, stats_file, stat)

    for(let skill of stats_skill_map[stat]){
      substitution_map[skill] = skill_mod(base_mod, stats_file, skill)
    }
    substitution_map
  }
  substitution_map["PP"] = substitution_map['Perception']+10
  substitution_map["HP"] = stats_file["HP"] || calc_hp(stats_file["LVL"], substitution_map["CON_MOD"], stats_file["HITDICE"]),

  console.log(substitution_map)
  for(let key in substitution_map) {
    let value = substitution_map[key];
    document.body.innerHTML = document.body.innerHTML.split(build_keyword(key)).join(value);
  }
}

function stat_mod(stat) {
  return Math.floor((stat-10)/2)
}

function st_mod(base_mod, stats_file, stat) {
  stats_file["STProf"]
  return base_mod
}

function skill_mod(base_mod, stats_file, skill){
  mod = base_mod
  if(stats_file["JackOfAllTrades"]){
    mod += Math.floor(proficiency/2)
  } else {
    if(stats_file["SkillProf"]?.includes(skill))
      mod += proficiency
    if(stats_file["Expertise"]?.includes(skill))
      mod += proficiency
  }
  return mod
}

function calc_hp(lev, con, dice){
  medium_roll = (dice/2)+1+con
  return (lev-1)*medium_roll + dice + con
}

function build_keyword(key) {
  return "[[" + key + "]]"
}
