const Discord = require("discord.js");
require('dotenv').config();


const intents = new Discord.Intents(32767);

const client = new Discord.Client({ intents });

const channelId = "920332564831563807";

var createdAt;
var currentPollId;

const createPoll = async (pingPlayers) => {
	const channel = await client.channels.cache.get(channelId);
	channel.bulkDelete(99);
	createdAt = new Date();
	const message = await channel.send(`Ajoutez une réaction pour vous déclarer comme volontaire pour un 5v5 !
Quand 10 personnes se seront portées volontaires, vous serez ping pour venir jouer (reset toutes les 4h).
${pingPlayers ? "\n <@&823636943736275005>" : ""}
\n(Ecrire "new" dans ce channel pour lancer un nouveau rassemblement)
\n \n \n Création : ${createdAt.toLocaleString()}`);
	await message.react('✅');
	currentPollId = message.id;
}

client.once("ready",async () => {
	console.log("5v5 bot online");
	await createPoll(false);
	// console.log(`CurrentPollId : ${currentPollId}`);
});

client.on('messageReactionAdd', async (reaction,user) =>{
	if (user.bot || reaction.message.channelId !== channelId || reaction.message.id !== currentPollId) return;
	let now = new Date();
	if (now - createdAt > 4*60*60*1000){
		createPoll(false);
	}
	const count = reaction.count - 1;
	console.log(`Count : ${count}`);
	if (count == 10){
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