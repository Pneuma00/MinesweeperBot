const Discord = require('discord.js');

module.exports = {
  name: 'invite',
  description: '봇 초대 코드를 표시합니다.',
  run: async (message, args) => {
    const dev = message.client.users.cache.get(message.client.config.devID);

    const embed = new Discord.MessageEmbed()
      .setColor('ORANGE')
      .setTitle('Minesweeper 봇 초대 방법')
      .setTimestamp()
      .setDescription(
        '**https://koreanbots.dev/bots/709754957175324703**\n' +
        '위 링크에 들어가서 초대하기 버튼을 눌러주세요!\n\n' +
        '+ ❤ 하트 누르는 것도 잊지 마세요!'
      )
      .setFooter(`Made by ${dev.username}`, dev.displayAvatarURL());

    message.channel.send(embed);
  },
};