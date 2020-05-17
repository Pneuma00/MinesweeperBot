module.exports = {
  name: 'mine',
  description: '지뢰찾기 게임을 시작합니다.',
  async execute(message, args) {
    if (message.client.playing.indexOf(message.author.id) !== -1) return message.reply('이미 진행중인 게임이 있습니다.');
    require('../games/game.js')({
      player: message.author,
      channel: message.channel,
      client: message.client,
      settings: {
        width: 9,
        height: 9,
        mines_cnt: 10
      }
    });
  },
};