export async function background_info(data_file) {
    let data = {}
    const background_url = `https://raw.githubusercontent.com/Gimbardo/5etools-scrape/refs/heads/main/data/backgrounds.json`
    await fetch(background_url)
      .then((response) => response.json())
      .then((json) => data = json_background_info(json, data_file))
      .catch(function(error) {
        console.log("Can't read this background's JSON" + error);
      })
    return data
  }
  
  function json_background_info(json, data_file) {
    const background = json["background"].filter((background) => {
      return background["name"].toLowerCase() === data_file["BACKGROUND"].toLowerCase()
    })[0]
  
    return {
      BACKGROUND: background["name"],
      BACKGROUND_URL: `https://5e.tools/backgrounds.html#${background["name"].toLowerCase()}_${background["source"].toLowerCase()}`
    }
  }
  