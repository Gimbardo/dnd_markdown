export async function class_info(data_file) {
	let data = {}
	const class_url = `https://2014.5e.tools/data/class/fluff-class-${data_file?.CLASS?.toLowerCase()}.json`
	await fetch(class_url)
		.then((response) => response.json())
		.then((json) => data = json_class_info(json, data_file))
		.catch(function(error) {
			console.log("Can't read this class' JSON" + error);
		})
	return data
}

function json_class_info(json, data_file) {
	const giuseppe = json["classFluff"][0]
	const subclass = json["subclassFluff"].filter((subclass) => {
		return [subclass["name"].toLowerCase(), subclass["shortName"].toLowerCase()].includes(data_file["SUBCLASS"].toLowerCase())
	})[0]

	return {
		CLASS_URL: `https://5e.tools/classes.html#${giuseppe["name"].toLowerCase()}_${giuseppe["source"].toLowerCase()},state:sub-${subclass["shortName"].toLowerCase()}-${subclass["source"].toLowerCase()}=b1`,
		CLASS: giuseppe["name"],
		SUBCLASS_SHORT: subclass["shortName"],
		SUBCLASS: subclass["name"]
	}
}