const Discord = require("discord.js");
require('dotenv').config();


const intents = new Discord.Intents(32767);

const client = new Discord.Client({ intents });

const channelId = "919984229176201269";

var currentPollId;

const createPoll = async () => {
	const channel = await client.channels.cache.get(channelId);
	const message = await client.channels.cache.get(channelId).send("Ajoutez une réaction pour vous déclarer comme volontaire pour un 5v5 !");
	await message.react('✅');
	return message.id;
}

client.once("ready",async () => {
	console.log("5v5 bot online");
	const channel = await client.channels.cache.get(channelId);
	channel.bulkDelete(99);
	currentPollId = await createPoll();
	console.log(`CurrentPollId : ${currentPollId}`);
});

client.on('messageReactionAdd', async (reaction,user) =>{
	if (user.bot || reaction.message.channelId !== channelId || reaction.message.id !== currentPollId) return;
	const count = reaction.count - 1;
	console.log(`Count : ${count}`);
	if (count > 0){
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

client.on("messageCreate", (message) => {
	if (message.author.bot || message.channelId !== channelId) return;
	message.delete();
});


client.login(process.env.token);