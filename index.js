/*
 * IMPORTANT INFO
 ! DEPRECATED METHOD, DONT USE
 ? SHOULD THIS INFO BE EXPOSED
 TODO: THINGS TO DO
*/

const Discord = require('discord.js');
const client = new Discord.Client();
const fetch =  require('node-fetch'); 
const course = require("./user_modules/course.js")
require("dotenv").config();

// * Constants

const acse = "Architecture/Arch Engineering"
const convert = {
    // Engineering Half
    // MAAE Dept. 
    AE: "Aerospace Engineering", BMM: "Biomedical Mech",
    ME: "Mechanical Engineering", SREE: "SREE",
    // SCE Dept.
    BME: "Biomedical Elec",             COME: "Communications Engineering",
    CSE: "Computer Systems Engineering", SE: "Software Engineering",
    // CIVE Dept.
    ARCHE: acse, ACSE: acse, 
    CE: "Civil Engineering",
    // ELEC Dept.
    EE: "Electrical Engineering", EP: "Engineering Physics",
    // Design Half
    ARCH: acse, ID: "Industrial Design",
    IRM: "IRM", IMD: "IMD", MPD: "MPD", OSS: "OSS", NET: "NET",
    // Non Eng / Design
    BSP: "Business, Social, Political", AL: "Arts, Languages",
    CS: "Computer Science", MATH: "Math", SCIENCE: "Science",
    // Year Standing
    FIRST: "[First Year Standing]", SECOND: "[Second Year Standing]",
    THIRD: "[Third Year Standing]", FOURTH: "[Fourth Year Standing]",
    // Pronouns
    HH: "he/him", SH: "she/her", TT: "they/them",
    // Singletons (Misc.)
    MAKER: "Maker Club",
}

// * GLOBAL VARIABLES
const prefix = '#';
let receptionChannel;
let rolesChannel;
let announcementChannel = '';
let lobbyChannel = '';
let logsChannel = process.env.LOGS;
let interactiveChannel = '';
let fetched = false;


// * FUNCTIONS

const response = require("./user_modules/response.js");

function toVoteEmbed (message, title, options, timeout, emojiList, forceEndPollEmoji) {
    const { MessageEmbed } = require("discord.js");

    const defEmojiList = [
        "\u0031\u20E3",
        "\u0032\u20E3",
        "\u0033\u20E3",
        "\u0034\u20E3",
        "\u0035\u20E3",
        "\u0036\u20E3",
        "\u0037\u20E3",
        "\u0038\u20E3",
        "\u0039\u20E3",
        "\uD83D\uDD1F",
    ];

    const voteEmbed = async (
        message,
        title,
        options,
        timeout = 30,
        emojiList = defEmojiList.slice(),
        forceEndPollEmoji = "\u2705"
    ) => {
        if (!message && !message.channel)
            return message.reply("Channel access denied.");
        if (!title) return message.reply("Please specify the title.");
        if (!options) {
            options = ["Yes", "No"];
        }
        if (options.length < 2)
            return message.reply("Please provide more than two options.");
        if (options.length > emojiList.length)
            return message.reply(
                `Please do not exceed ${emojiList.length} options.`
            );

        let text = `To vote, react using the emojis below.\n ${
            timeout > 0
                ? "The poll will end in **" + timeout + "** seconds."
                : "They poll will **manually end**, as decided by the creator."
        }\n The creator of this poll can end it forcefully using the ${forceEndPollEmoji} emoji.\n\n`;
        const emojiInfo = {};
        for (const option of options) {
            const emoji = emojiList.splice(0, 1);
            emojiInfo[emoji] = { option: option, votes: 0 };
            text += `${emoji} : \`${option}\`\n\n`;
        }
        const usedEmojis = Object.keys(emojiInfo);
        usedEmojis.push(forceEndPollEmoji);

        const poll = await message.channel.send(
            embedBuilder(title, message.author)
                .setDescription(text)
                .setColor("#e4cd3b")
                .setThumbnail(message.guild.iconURL())
        );
        for (const emoji of usedEmojis) await poll.react(emoji);

        const reactionCollector = poll.createReactionCollector(
            (reaction, user) =>
                usedEmojis.includes(reaction.emoji.name) && !user.bot,
            timeout === 0 ? {} : { time: timeout * 1000 }
        );
        const voterInfo = new Map();
        reactionCollector.on("collect", (reaction, user) => {
            if (usedEmojis.includes(reaction.emoji.name)) {
                if (
                    reaction.emoji.name === forceEndPollEmoji &&
                    message.author.id === user.id
                )
                    return reactionCollector.stop();
                if (
                    reaction.emoji.name === forceEndPollEmoji &&
                    message.author.id !== user.id
                )
                    return;
                emojiInfo[reaction.emoji.name].votes = reaction.count - 1;
            }
        });
        reactionCollector.on("end", () => {
            text = "*The poll has ended!*\n The results are:\n\n";
            for (const emoji in emojiInfo)
                text += `• \`${emojiInfo[emoji].option}\` - \`${emojiInfo[emoji].votes} votes\`\n\n`;
            poll.delete();
            message.channel.send(
                embedBuilder(title, message.author).setDescription(text)
            );
        });
    };
    

    const embedBuilder = (title, author) => {
        return new MessageEmbed()
            .setTitle(`Poll - ${title}`)
            .setFooter(
                `Created by ${author.tag}`,
                author.displayAvatarURL()
            );
    };
    voteEmbed(message, title, options, timeout, emojiList, forceEndPollEmoji);
    module.exports = voteEmbed; 
}  

// * STATUS INDICATOR
client.once('ready', () => {
    console.log('Online');
});

// * BOT TOKEN LOGIN
client.login(process.env.TOKEN);

// * LOGGER
client.on('messageDelete', message => {
    // Cannot recover deleted message partials
    if (message.partial)
        return;
    if (message.content.startsWith(prefix))
        return;

	console.log(`A message by ${message.author.tag} was deleted, but we don't know by who yet.`);
    const embed = new Discord.MessageEmbed()
        .setDescription(`**Message sent by ${message.author} deleted in ${message.channel}**`
            + `\nContent: "${message.content}`)
        .setAuthor("Sender: " + message.author.tag, message.author.displayAvatarURL())
        .setFooter(`Author: ${message.author.id} | Message ID: ${message.id}`)
        .setTimestamp()
        .setColor("YELLOW");

    const { guild } = message;
    /** @type {Discord.TextChannel} */
    const channel = guild?.channels.resolve(logsChannel);
    channel.send(embed);
});

// * REQUESTED COMMANDS
client.on('message', message => {
    if (!message.author.bot)
        console.log(message.author.username, ': ', message.content); // logs messages sent

    const member = message.member; // sender
    const msg = message.content.slice(6).trim(); // all message content
    const args = message.content.slice(prefix.length).trim().split(' '); // array of content info
    const command = args.shift().toUpperCase(); // command attached to prefix
    
    if(!message.content.startsWith(prefix) || message.author.bot) {
        return; // if msg doesnt start w/ prefix, return
    } else if (command === 'CHANNEL') {
        switch (args[0]) {
            case "reception":
                receptionChannel = message.channel.id;
                break;
            case "roles":
                rolesChannel = message.channel.id;
                break;
            case "announcement":
                announcementChannel = message.channel.id;
                break;
            case "lobby":
                lobbyChannel = message.channel.id;
                break;
            case "logs":
                logsChannel = message.channel.id;
                break;
            case "interact":
                interactiveChannel = message.channel.id;
                break;
        }      

    } else if (command === 'DP') {
        if (!message.mentions.users.size) {
            return message.channel.send(`${message.author.displayAvatarURL({ format: "png", dynamic: true })}`);
        }
        const avatarList = message.mentions.users.map(user => {
            return `${user.displayAvatarURL({ format: "png", dynamic: true })}`;
        });
        message.channel.send(avatarList);
        
    } else if (command === 'EVICT') {
        const amount = parseInt(args[0]) + 1;
        if (!message.member.hasPermission("MANAGE_MESSAGES")) { // checks if sender has manage_member perms
                message.channel.send('You are not authorized to use this command.')
                return;
            }
        else if (isNaN(amount)) {
            return message.reply('Please specify how many messages are to be deleted.');
        }
        else if (amount <= 1 || amount > 100) {
            return message.reply('Please specify more than one message to be deleted.');
        }
        message.channel.bulkDelete(amount, true).catch(err => {
            console.error(err);
            message.channel.send('There was an error, please contact a moderator.');
        });

    } else if (command.match(/ASSIGN|REMOVE/)) {
        const role = message.guild.roles.cache.find(role => role.name === convert[args[0].toUpperCase()]);
        const deleteMsg = (msg) => msg.delete({timeout: 7000});
        /** @type {"add" | "remove"} */
        const method = command === "ASSIGN" ? "add" : "remove";
        member.roles[method](role).catch(e => {
            message.reply('there was an error, please follow the format above.').then(deleteMsg);
            console.error(e);
        });
        if(role) message.react('👍');
        deleteMsg(message); 

    } else if (command === 'COUNT') {
        try {
            const alias = args[0].toUpperCase();
            const role = message.guild.roles.cache.find(role => role.name === convert[alias]);
            if (role)  {
                message.react('👍');
                message.reply(`There are currently ${role.members.size} members in ${role.name}.`);
            }

          } catch(e) {
            message.reply('there was an error, that role could not be found.')
                .then(msg => {
                    msg.delete({timeout: 7000});
                });
            console.error(e);
            message.react('👎');
          }

    } else if (command === 'POLL') {
        let title = args[0];
        let timeout = args[1];
        let emojiList = ['⬆️','⬇️','↕️'];
        let forceEndPollEmoji = '💯';
        let options = args.slice(2);
        toVoteEmbed(message, title, options, timeout, emojiList, forceEndPollEmoji);

    } else if (command === 'ALLIN') {
        const voiceChannel = message.member.voice.channel;
        console.log(receptionChannel);
        if (!voiceChannel) return message.channel.send("Please join a voice channel");
        voiceChannel.members.forEach(function(guildMember, guildMemberId) {
            console.log(guildMemberId, guildMember.user.username);
            message.channel.send(`<@${guildMemberId}> ${msg}`);
        });
    } else if (command === "COURSE") {
        course.execute(message, args);
    }

});

client.on("guildMemberAdd",  async (member) => {
    if (member.partial) {
        member = await member.fetch();
    }

    const role = member.guild.roles.cache.find(r => r.name.toLowerCase() === "member");
    if (role)
        member.roles.add(role);

    
})

client.on("guildMemberUpdate", async (o, n) => {
    return;
    if (o.partial)
        o = await o.fetch();
    if (n.partial)
        n = await n.fetch();

    const nCache = n.roles.cache;
    const oCache = o.roles.cache;

    if (oCache.size != nCache.size) {
        const nArr = nCache.map(r => r.id);
        oCache.find(r => nCache.has())
    }
    
})
        
// * MODULAR
client.on('ready', async () => {
    /** @type {Discord.Guild} */
    const guild = await client.guilds.fetch(process.env.GUILD)
    const members = await guild.members.fetch();
    fetched = true;
    console.log("Commands ready!");

    // const role = (await guild.roles.fetch()).cache.find(r => r.name === "Member");
    // const noRoleMembers = members.filter(mem => !mem.roles.cache.has(role.id));
    // if (noRoleMembers.size === 0) return;

    // const channel = guild.channels.resolve(logsChannel);
    
    // await channel.send("Adding the Member role to " + noRoleMembers.size + " people");
    // for (const nrm of noRoleMembers.values()) {
    //     await nrm.roles.add(role);
    //     await new Promise(resolve => setTimeout(resolve, 1_000));
    // }    

    // await channel.send({ content: `Updated ${noRoleMembers.size} members with the Members role.`});
    // let dailyUpdatesChannel = client.channels.cache.get('749425029728698399');

    // setInterval(() => { // THIS IS THE LOOP WHICH WILL UPDATE THE DAILY UPDATES CHNL WITH WEATHER
    //     dailyUpdatesChannel.bulkDelete(1);
    //     response('https://api.openweathermap.org/data/2.5/onecall?lat=45.3876&lon=-75.6960&units=metric&exclude=minutely,current&appid=2083373d69c764744d4561d93e208821', 'https://api.openweathermap.org/data/2.5/weather?lat=45.3876&lon=-75.6960&units=metric&appid=2083373d69c764744d4561d93e208821', dailyUpdatesChannel, 'getWeather');
    // }, 3600000);
});



