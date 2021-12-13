const Discord = require("discord.js");
require('dotenv').config();


const intents = new Discord.Intents(32767);

const client = new Discord.Client({ intents });

client.on("ready", () => console.log("Test 2"));


client.login(process.env.token);