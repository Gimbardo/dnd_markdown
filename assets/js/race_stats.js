export async function race_info(data_file) {
    let data = {}
    const race_url = `https://raw.githubusercontent.com/Gimbardo/5etools-scrape/refs/heads/main/data/races.json`
    await fetch(race_url)
        .then((response) => response.json())
        .then((json) => data = json_race_info(json, data_file))
        .catch(function(error) {
        console.log("Can't read this race's JSON" + error);
        })
    return data
}
  
function json_race_info(json, data_file) {
    const race = json["race"].filter((race) => {
        let filter_name = race["name"].toLowerCase() === data_file["RACE"].toLowerCase()
        if(!data_file["RACE_SOURCE"])
        return filter_name
        let filter_source = race["source"].toLowerCase() === data_file["RACE_SOURCE"].toLowerCase()
        return filter_name && filter_source
    })[0]

    return {
        RACE_URL: `https://2014.5e.tools/races.html#${race["name"].toLowerCase()}_${race["source"].toLowerCase()}`
    }
}
