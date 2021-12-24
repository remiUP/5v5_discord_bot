const config = require("./config.json");
const Discord = require("discord.js");
const { MessageEmbed } = require('discord.js');
require('dotenv').config();


const intents = new Discord.Intents(32767);
const client = new Discord.Client({ intents });

var channelId;
var currentPollId;

if (process.env.run_mode == "prod"){
	channelId = config.prod[0].channelId;
	serverId = config.prod[0].serverId;
	console.log("⚠️ Starting in production mode ⚠️");
}
else {
	channelId = config.dev.channelId;
	serverId = config.dev.serverId;
	if (process.env.run_mode !== "dev"){
		console.log("Incorrect value for 'run_mode' in the config file : defaulting to development mode");
	}
	console.log("🚧 Starting in development mode 🚧");
}

var createdAt;
var currentPollId;

const createPoll = async (pingPlayers) => {
	const channel = await client.channels.cache.get(channelId);
	channel.bulkDelete(99);
	createdAt = new Date();
	expiration = new Date(createdAt.getTime() + 4*60*60*1000);
	const embed = new MessageEmbed()
		.setColor("#256579")
		.setTitle("Nouveau 5v5 !")
		.setDescription('Ajoutez une réaction pour vous déclarer comme volontaire pour un 5v5 !\
		Quand 10 personnes se seront portées volontaires, vous serez ping pour venir jouer')
		.addField('Poll Duration', '4h', true)
		.addField('Required number', '10', true)
		.addField('Creation', createdAt.toLocaleString(), true)
		.addField('Expiration', expiration.toLocaleString(), true);
	const message = await channel.send({embeds: [embed]});
	await message.react('✅');
	currentPollId = message.id;
}

client.once("ready",async () => {
	console.log("5v5 bot online");
	await createPoll(false);
});

client.on('messageReactionAdd', async (reaction,user) =>{
	if (user.bot || reaction.message.channelId !== channelId || reaction.message.id !== currentPollId) return;
	let now = new Date();
	if (now - createdAt > 4*60*60*1000){
		createPoll(false);
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
		await createPoll(true);
	}
	else{
		message.delete();
	}
});


client.login(process.env.token);