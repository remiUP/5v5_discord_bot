const config = require("./config.json");
const Discord = require("discord.js");
const { MessageEmbed } = require('discord.js');
require('dotenv').config();


const intents = new Discord.Intents(32767);
const client = new Discord.Client({ intents });

var channelId;
var currentPollId;
var servers;

if (process.env.run_mode == "prod"){
	channelId = config.prod[0].channelId;
	serverId = config.prod[0].serverId;
	servers = config.prod;
	console.log("⚠️ Starting in production mode ⚠️");
}
else {
	channelId = config.dev.channelId;
	serverId = config.dev.serverId;
	servers = [config.dev];
	if (process.env.run_mode !== "dev"){
		console.log("Incorrect value for 'run_mode' in the config file : defaulting to development mode");
	}
	console.log("🚧 Starting in development mode 🚧");
}

var createdAt;
var currentPollId;

const addStringTime = (date, timeString) => {
	const matches = timeString.match(/(\d+)h(\d+)?/);
	return new Date(date.getTime() + ((matches[0] || 0)*60 + (matches[1] || 0))*60*1000)
}

const createPoll = async (pingPlayers, targetChannelId, color, title, desc, duration, number) => {
	const channel = await client.channels.cache.get(targetChannelId);
	channel.bulkDelete(99);
	createdAt = new Date();
	expiration = addStringTime(createdAt, duration || config.defaults.duration);
	const embed = new MessageEmbed()
		.setColor(color || config.defaults.color)
		.setTitle(title || config.defaults.title)
		.setDescription(desc || config.defaults.description)
		.addField('Poll Duration', duration || config.defaults.duration, true)
		.addField('Required number', number || config.defaults.number, true)
		.addField('Creation', createdAt.toLocaleString(), true)
		.addField('Expiration', expiration.toLocaleString(), true);
	const message = await channel.send({embeds: [embed]});
	await message.react('✅');
	currentPollId = message.id;
}

client.once("ready",async () => {
	console.log("5v5 bot online");
	//await createPoll(false);
	await createPoll(false, servers[0].channelId);
});

client.on('messageReactionAdd', async (reaction,user) =>{
	if (user.bot || reaction.message.channelId !== channelId || reaction.message.id !== currentPollId) return;
	let now = new Date();
	if (now - createdAt > 4*60*60*1000){
		createPoll(false, servers[0].channelId);
	}
	const count = reaction.count - 1;
	console.log(`Count : ${count}`);
	if (count == (process.env.run_mode=="prod" ? 10 : 1)){
		reaction.users.fetch()
			.then((users) => {
				let msg = '';
				users.forEach((user) => {
					if (user.bot) return;
					msg += `${user.toString()}  `;
				});
				reaction.message.channel.send(msg);
			})
	}
});

client.on("messageCreate", async (message) => {

	if (message.author.bot || message.channelId !== channelId) return;
	if (message.content === "new"){
		await createPoll(true, servers[0].channelId);
	}
	else{
		message.delete();
	}
});


client.login(process.env.token);