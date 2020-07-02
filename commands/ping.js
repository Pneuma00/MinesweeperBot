const Discord = require('discord.js');

module.exports = {
  name: 'ping',
  description: '핑을 측정합니다.',
  run: async (message, args) => {
    const msg = await message.channel.send(`🏓 **Pinging...**`);

    const embed = new Discord.MessageEmbed()
      .setColor('ORANGE')
      .setTitle(`🏓 Pong!`)
      .setTimestamp()
      .setDescription(`**Discord API Latency**\n${message.client.ws.ping}ms\n\n**Latency**\n${msg.createdAt - message.createdAt}ms`)
      .setFooter(message.author.username, message.author.displayAvatarURL())

    msg.edit('', embed);
  },
};