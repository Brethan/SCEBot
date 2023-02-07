const rp = require("request-promise")
const { MessageEmbed } = require("discord.js");

module.exports = async (department, code) => {
    const url = `https://calendar.carleton.ca/search/?P=${department}%20${code}`
    const title = "<div class=\"searchresult search-courseresult\">";
    const courseblock = "<div class=\"courseblock\">";
    const additional = "<div class=\"coursedescadditional\">";

    const html = await rp(url);
    if (typeof html !== "string") 
        return null;

    if (html.includes("Results not found.")) 
        return null;
    
    if (!(html.includes(courseblock) && html.includes(additional) && html.includes(title)))
        return null;

    /** 
     * @param {string} html_str 
     */
    const removeHeaders = (html_str) => {
        while (html_str.match(/<|>/gi)) {
            const openIndex = html_str.indexOf("<"), closeIndex = html_str.indexOf(">") + 1;
            const header = html_str.substring(openIndex, closeIndex);
            html_str = html_str.replace(header, "");
        }
        return html_str.trim();
    }

    const title_start = html.indexOf(title) + title.length;
    const title_end = html.indexOf(courseblock);
    const courseTitle = removeHeaders(html.substring(title_start, title_end));

    const course_start = html.indexOf(courseblock) + courseblock.length;
    const course_end = html.indexOf(additional);
    const courseDesc = removeHeaders(html.substring(course_start, course_end));
    //console.log(courseDesc.trim());

    const add_start = html.indexOf(additional) + additional.length;
    let courseAdd = html.substring(add_start).replace(/<br\/>/g, "\n");
    courseAdd = removeHeaders(courseAdd.substring(0, courseAdd.indexOf("</div>")))
    // console.log(courseAdd);

    const embed = new MessageEmbed().setTitle(courseTitle)
        .setURL(url)
        .setDescription(courseDesc + "\n\n" + courseAdd)
        .setColor("GREEN")
    return embed
}