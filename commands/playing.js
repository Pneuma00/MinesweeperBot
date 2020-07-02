const Discord = require('discord.js');

module.exports = {
  name: 'playing',
  description: '현재 플레이 중인 유저 목록을 보여줍니다.',
  run: async (message, args) => {
    const embed = new Discord.MessageEmbed()
      .setColor('ORANGE')
      .setTitle(`현재 플레이 중인 유저`)
      .setTimestamp()
      .setDescription(`${message.client.playing.map(id => message.client.users.cache.get(id).tag).join('\n')}`)
      .setFooter(message.author.username, message.author.displayAvatarURL())

    message.channel.send(embed);
  },
};