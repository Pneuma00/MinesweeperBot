const Discord = require('discord.js');

module.exports = {
  name: 'help',
  description: '봇 도움말을 표시합니다.',
  run: async (message, args) => {
    const dev = message.client.users.cache.get(message.client.config.devID);

    const embed = new Discord.MessageEmbed()
      .setColor('ORANGE')
      .setTitle('Minesweeper 봇 도움말')
      .setTimestamp()
      .setDescription(
        '**/play** - 지뢰찾기 게임을 플레이 할 수 있습니다.\n' +
        '**/help** - 이 도움말을 볼 수 있습니다.\n' +
        '**/playing** - 지뢰찾기 게임을 플레이 중인 유저들을 보여줍니다.\n' +
        '**/invite** - 지뢰찾기 봇 초대 링크를 표시합니다.\n\n' + 
        '`o <행> <열>` 로 칸을 열 수 있습니다. (예: `o 5 3`)\n' +
        '`f <행> <열>` 로 칸에 깃발을 꽂을 수 있습니다. (예: `f 2 7`)\n' + 
        '`c <행> <열>` 로 열린 칸 주변을 청소할 수 있습니다. (예: `c 6 4`)\n'
      )
      .setFooter(`Made by ${dev.username}`, dev.displayAvatarURL());

    message.channel.send(embed);
  },
};