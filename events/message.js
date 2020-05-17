const Discord = require('discord.js');
const { simpleDate } = require('../funcs/date');

module.exports = async (client, message) => {
  if (message.system) return;
  if (message.author.bot) return;

  if (message.content.indexOf(client.config.prefix) !== 0) return;

  if (message.channel.type === 'text')
    console.log(`[${simpleDate(message.createdAt)}] (Guild: ${message.guild.id}) (Channel: ${message.channel.id}) ${message.author.tag} : ${message.content}`);
  else console.log(`[${simpleDate(message.createdAt)}] (User: ${message.author.id}) ${message.author.tag} : ${message.content}`);

  const contents = message.content.slice(client.config.prefix.length).trim();
  const args = contents.split(/ +/g);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);

  if (!command) return message.reply('존재하지 않는 명령어입니다.');
 
  try {
    command.execute(message, args);
  }
  catch (error) {
    console.error(error);
    message.channel.send(`:octagonal_sign: 오류가 발생하였습니다: \`${error}\``);
    return;
  }
};