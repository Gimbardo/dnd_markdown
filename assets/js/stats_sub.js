import { race_info } from '/assets/js/race_stats.js';
import { background_info } from '/assets/js/background_stats.js';
import { class_info } from '/assets/js/class_stats.js';

const stats_map =  {
  "STR": stat("Strength", ["Athletics"]),
  "DEX": stat("Dexterity", ["Acrobatics", "SleightOfHand", "Stealth", "Initiative"]),
  "CON": stat("Constitution", []),
  "INT": stat("Intelligence", ["Arcana", "Nature", "History", "Religion", "Investigation"]),
  "WIS": stat("Wisdom", ["AnimalHandling", "Perception", "Medicine", "Insight", "Survival"]),
  "CHA": stat("Charisma", ["Performance", "Deception", "Persuasion", "Intimidation"])
}

export async function substitute_stats(title) {
  try {
    const data_file = await fetch(`/assets/json/${title}.json`).then(r => r.json());
    
    const [class_data, background_data, race_data] = await Promise.all([
      class_info(data_file),
      background_info(data_file),
      race_info(data_file)
    ]);

    const substitution_map = prepare_json(data_file);
    const merged_data = Object.assign({},
      substitution_map,
      class_data,
      background_data,
      race_data
    );

    json_substitute(merged_data);

  } catch (error) {
    console.log("Can't read JSON stat file" + error);
  }
}

function stat(name, skills) {
  return { "name": name, "skills": skills }
}

let proficiency = 0

function prepare_json(data_file){
  proficiency = Math.ceil(data_file["LVL"]/4)+1
  const substitution_map = {
    "LVL": data_file["LVL"],
    "PROF": proficiency,
    "CA": data_file["CA"]
  }

  for(const stat in stats_map) {
    const base_mod = stat_mod(data_file[stat])
    substitution_map[stat] = data_file[stat]
    substitution_map[stat+"_MOD"] = base_mod
    substitution_map[stat+"_ST"] = st_mod(base_mod, data_file, stat)

    for(const skill of stats_map[stat]["skills"]){
      substitution_map[skill] = skill_mod(base_mod, data_file, skill)
    }
    substitution_map
  }
  substitution_map["PP"] = substitution_map['Perception']+10
  substitution_map["HP"] = data_file["HP"] || calc_hp(data_file["LVL"], substitution_map["CON_MOD"], data_file["HITDICE"])
  
  if(data_file["SpellcastingAbility"]) {
    const stat = data_file["SpellcastingAbility"]
    substitution_map["SPELL_AB"] = stats_map[stat]["name"]
    substitution_map["SPELL_DC"] = 8 + proficiency + substitution_map[stat+"_MOD"]
    substitution_map["SPELL_ATK"] = proficiency + substitution_map[stat+"_MOD"]
  }
  return {...data_file, ...substitution_map}
}

function json_substitute(substitution_map){
  for(const key in substitution_map) {
    const value = substitution_map[key]
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
    return (base_mod + (proficiency*2))
  else if(stats_file["SkillProf"]?.includes(skill))
    return base_mod + proficiency
  else if(stats_file["JackOfAllTrades"])
    return base_mod + Math.floor(proficiency/2)
  return base_mod
}

function calc_hp(lev, con, dice){
  const medium_roll = (dice/2)+1+con
  return (lev-1)*medium_roll + dice + con
}

function build_keyword(key) {
  return "[[" + key + "]]"
}

function signed(n) {
  return (n<=0?"-":"+") + n
}
