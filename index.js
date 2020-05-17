require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();

const config = require("./config.json");
client.config = config;

client.commands = new Discord.Collection();
client.playing = [];

const fs = require('fs');

fs.readdirSync('./commands/').filter(file => file.endsWith('.js')).forEach(file => {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
});

fs.readdirSync("./events/").forEach(file => {
  const event = require(`./events/${file}`);
  const eventName = file.split(".")[0];
  client.on(eventName, event.bind(null, client));
});

client.login();