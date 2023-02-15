const { Message, TextChannel } = require("discord.js");
const courseinfo = require("./courseinfo.js");

module.exports = {
    name: "course",
    description: "Provides info on a course",
    /**
     * 
     * @param {Message} message 
     * @param {string[]} args 
     */
    async execute(message, args) {
        let dept, code;
        if (!args.length) {
            if (!(message.channel instanceof TextChannel))
                return message.channel.send("Why are you dm-ing me?")
                    .then(msg => {
                        msg.delete({timeout: 7_000}).catch(console.error);
                        message.delete({timeout: 500}).catch(console.error);
                    });
            
            const split = message.channel.name.split("-");
            dept = split[0], code = split[1];

        } else {
            const matches = message.content.match(/[A-z]{4}([^\w]|_){0,}[0-9]{4}/g)
	        if (!matches) return null;

            const firstMatch = matches[0];
            dept = firstMatch.substring(0, 4).toUpperCase();
            code = firstMatch.substring(firstMatch.length - 4);
        }

        const includePrereqs = !!message.content.match(/\-v|prereq/gi);
        const embed = await courseinfo(dept.toUpperCase(), code, includePrereqs);
        return embed?.setFooter({ text: "Run s.course dept-#### to see information on a course!" });

    }
}
