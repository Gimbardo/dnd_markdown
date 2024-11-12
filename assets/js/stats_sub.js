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

async function substitute_stats(title) {
  try {
    const response = await fetch('/assets/json/' + title + ".json");
    const data_file = await response.json();
    const substitution_map = prepare_json(data_file);
    const class_map = await class_info(data_file)
    const background_map = await background_info(data_file)
    const race_map = await race_info(data_file)
    json_substitute({...substitution_map, ...class_map, ...background_map, ...race_map});
  } catch (error) {
    console.log("Can't read JSON stat file" + error);
  }
}

function prepare_json(data_file){
  proficiency = Math.ceil(data_file["LVL"]/4)+1
  let substitution_map = {
    "LVL": data_file["LVL"],
    "PROF": proficiency,
    "CA": data_file["CA"]
  }

  for(let stat in stats_map) {
    base_mod = stat_mod(data_file[stat])
    substitution_map[stat] = data_file[stat]
    substitution_map[stat+"_MOD"] = base_mod
    substitution_map[stat+"_ST"] = st_mod(base_mod, data_file, stat)

    for(let skill of stats_map[stat]["skills"]){
      substitution_map[skill] = skill_mod(base_mod, data_file, skill)
    }
    substitution_map
  }
  substitution_map["PP"] = substitution_map['Perception']+10
  substitution_map["HP"] = data_file["HP"] || calc_hp(data_file["LVL"], substitution_map["CON_MOD"], data_file["HITDICE"])
  
  if(data_file["SpellcastingAbility"]) {
    stat = data_file["SpellcastingAbility"]
    substitution_map["SPELL_AB"] = stats_map[stat]["name"]
    substitution_map["SPELL_DC"] = 8 + proficiency + substitution_map[stat+"_MOD"]
    substitution_map["SPELL_ATK"] = proficiency + substitution_map[stat+"_MOD"]
  }
  return {...data_file, ...substitution_map}
}

function json_substitute(substitution_map){
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

// Class

async function class_info(data_file){
  let data = {}
  let class_url = `https://2014.5e.tools/data/class/fluff-class-${data_file?.CLASS?.toLowerCase()}.json`
  await fetch(class_url)
    .then((response) => response.json())
    .then((json) => data = json_class_info(json, data_file))
    .catch(function(error) {
      console.log("Can't read this class' JSON" + error);
    })
  return data
}

function json_class_info(json, data_file) {
  let giuseppe = json["classFluff"][0]
  let subclass = json["subclassFluff"].filter((subclass) => {
    return [subclass["name"].toLowerCase(), subclass["shortName"].toLowerCase()].includes(data_file["SUBCLASS"].toLowerCase())
  })[0]

  return {
    CLASS_URL: `https://5e.tools/classes.html#${giuseppe["name"].toLowerCase()}_${giuseppe["source"].toLowerCase()},state:sub-${subclass["shortName"].toLowerCase()}-${subclass["source"].toLowerCase()}=b1`,
    CLASS: giuseppe["name"],
    SUBCLASS_SHORT: subclass["shortName"],
    SUBCLASS: subclass["name"]
  }
}

// Background

async function background_info(data_file) {
  let data = {}
  let background_url = `https://2014.5e.tools/data/backgrounds.json`
  await fetch(background_url)
    .then((response) => response.json())
    .then((json) => data = json_background_info(json, data_file))
    .catch(function(error) {
      console.log("Can't read this background's JSON" + error);
    })
  return data
}

function json_background_info(json, data_file) {
  let background = json["background"].filter((background) => {
    return background["name"].toLowerCase() === data_file["BACKGROUND"].toLowerCase()
  })[0]

  return {
    BACKGROUND: background["name"],
    BACKGROUND_URL: `https://5e.tools/backgrounds.html#${background["name"].toLowerCase()}_${background["source"].toLowerCase()}`
  }
}

// Race

async function race_info(data_file) {
  let data = {}
  let race_url = `https://2014.5e.tools/data/races.json`
  await fetch(race_url)
    .then((response) => response.json())
    .then((json) => data = json_race_info(json, data_file))
    .catch(function(error) {
      console.log("Can't read this race's JSON" + error);
    })
  return data
}

function json_race_info(json, data_file) {
  let race = json["race"].filter((race) => {
    filter_name = race["name"].toLowerCase() === data_file["RACE"].toLowerCase()
    if(!data_file["RACE_SOURCE"])
      return filter_name
    filter_source = race["source"].toLowerCase() === data_file["RACE_SOURCE"].toLowerCase()
    return filter_name && filter_source
  })[0]

  return {
    RACE_URL: `https://2014.5e.tools/races.html#${race["name"].toLowerCase()}_${race["source"].toLowerCase()}`
  }
}
