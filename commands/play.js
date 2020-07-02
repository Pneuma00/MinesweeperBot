const Discord = require('discord.js');
const Canvas = require('canvas');
const Random = require('../funcs/random.js');
const { toHMS } = require('../funcs/date.js');

require('../funcs/array_prototype.js');

// ====================================================================================================

const print = settings => {
  return new Promise(async (resolve, reject) => {
    let { map, width, height } = settings;

    const canvas = Canvas.createCanvas((width + 2) * 32, (height + 2) * 32);
    const ctx = canvas.getContext('2d');

    const numtiles = [];
    const unopen = await Canvas.loadImage('assets/classic/unopen.png');
    numtiles[0] = await Canvas.loadImage('assets/classic/open.png');
    const mine = await Canvas.loadImage('assets/classic/mine.png');
    const flag = await Canvas.loadImage('assets/classic/flag.png');
    for (let i = 1; i <= 8; i++) {
      numtiles[i] = await Canvas.loadImage(`assets/classic/${i}.png`);
    }

    ctx.font = '20px Arial';
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#000000';
    for (let i = 1; i <= height; i++) {
      ctx.fillText(i, 10, i * 32 + 24);
      ctx.fillText(i, canvas.width - 22, i * 32 + 24);
    }
    for (let j = 1; j <= width; j++) {
      ctx.fillText(j, j * 32 + 10, 24);
      ctx.fillText(j, j * 32 + 10, canvas.height - 10);
    }

    for (let i = 1; i <= height; i++) {
      for (let j = 1; j <= width; j++) {
        ctx.drawImage(
          map.opened[i][j]
          ? (map.mines.includesArray([i, j]) ? mine : numtiles[map.numbers[i][j]])
          : (map.flaged[i][j] ? flag : unopen)
          , j * 32, i * 32, 32, 32);
      }
    }

    resolve(canvas.toBuffer());
  });
}

// ====================================================================================================

const tempMap = (settings) => {
  const { width, height } = settings;
  return {
    mines: [],
    numbers: Array(height + 2).fill(null).map(() => Array(width + 2).fill(0)),
    opened: Array(height + 2).fill(null).map(() => Array(width + 2).fill(0)),
    flaged: Array(height + 2).fill(null).map(() => Array(width + 2).fill(false))
  };
}

const newMap = (settings, x, y) => {
  const { width, height, mines_cnt } = settings;

  const map = {
    mines: [],
    numbers: Array(height + 2).fill(null).map(() => Array(width + 2).fill(NaN)),
    opened: Array(height + 2).fill(null).map(() => Array(width + 2).fill(-1)),
    flaged: Array(height + 2).fill(null).map(() => Array(width + 2).fill(false))
  };
  
  available = [];
  for (let i = 1; i <= height; i++) {
    for (let j = 1; j <= width; j++) {
      if (Math.abs(i - y) <= 1 && Math.abs(j - x) <= 1) continue;
      available.push([i, j]);
    }
  }

  for (let cnt = 0; cnt < mines_cnt; cnt++) {
    let index = Random.getRandomInt(0, available.length);
    map.mines.push(available[index]);
    available.splice(index, 1);
  }

  for (let i = 1; i <= height; i++) {
    for (let j = 1; j <= width; j++) {
      map.numbers[i][j] = 0;
    }
  }

  const dx = [0, 1, 1, 1, 0, -1, -1, -1], dy = [-1, -1, 0, 1, 1, 1, 0, -1];
  for (let cnt = 0; cnt < map.mines.length; cnt++) {
    for (let k = 0; k < 8; k++) {
      if (map.mines.includesArray([map.mines[cnt][0] + dy[k], map.mines[cnt][1] + dx[k]])) continue;
      map.numbers[map.mines[cnt][0] + dy[k]][map.mines[cnt][1] + dx[k]] += 1;
    }
  }

  for (let i = 1; i <= height; i++) {
    for (let j = 1; j <= width; j++) {
      map.opened[i][j] = 0;
    }
  }

  return map;
}

const checkComplete = settings => {
  const { map, width, height, mines_cnt } = settings;

  cnt = 0;
  for (let i = 1; i <= height; i++) {
    for (let j = 1; j <= width; j++) {
      if (!map.opened[i][j]) cnt++;
    }
  }
  
  return cnt === mines_cnt ? true : false;
}

// ====================================================================================================

const open = (settings, x, y) => {
  const { map, width, height } = settings;

  if (map.opened[y][x]) return 'opened';
  if (map.flaged[y][x]) return 'flaged';
  if (map.mines.includesArray([y, x])) {
    map.opened[y][x] = 1;
    return 'mine';
  }

  const queue = [[y, x]], dx = [0, 1, 1, 1, 0, -1, -1, -1], dy = [-1, -1, 0, 1, 1, 1, 0, -1];

  while (queue.length) {
    const pos = queue.shift();
    map.opened[pos[0]][pos[1]] = 1;
    
    if (map.numbers[pos[0]][pos[1]] !== 0) continue;
    for (let k = 0; k < 8; k++) {
      if (queue.includesArray([pos[0] + dy[k], pos[1] + dx[k]]) || map.opened[pos[0] + dy[k]][pos[1] + dx[k]] || map.flaged[pos[0] + dy[k]][pos[1] + dx[k]]) continue;
      queue.push([pos[0] + dy[k], pos[1] + dx[k]]);
    }
  }
  return 'success';
}

const flag = (settings, x, y) => {
  const { map, width, height } = settings;

  if (map.opened[y][x]) return 'opened';
  
  map.flaged[y][x] = map.flaged[y][x] ? 0 : 1;
  return 'success';
}

const clear = (settings, x, y) => {
  const { map, width, height } = settings;
  
  if (!map.opened[y][x]) return 'unopened';

  const dx = [0, 1, 1, 1, 0, -1, -1, -1], dy = [-1, -1, 0, 1, 1, 1, 0, -1];

  let cnt = 0;
  for (let k = 0; k < 8; k++) {
    if (map.flaged[y + dy[k]][x + dx[k]]) cnt++;
  }
  if (cnt < map.numbers[y][x]) return 'lack of flag';

  for (let k = 0; k < 8; k++) {
    if (!map.flaged[y + dy[k]][x + dx[k]] && map.mines.includesArray([y + dy[k], x + dx[k]])) {
      open(settings, x + dx[k], y + dy[k]);
      return 'mine';
    }
  }

  for (let k = 0; k < 8; k++) {
    open(settings, x + dx[k], y + dy[k]);
  }
  return 'success';
}

// ====================================================================================================

const game = async options => {
  const { player, channel, client, settings } = options;
  let { width, height, map, mines_cnt } = settings;
  const dm = await player.createDM();

  client.playing.push(player.id);

  map = tempMap(settings);

  let gameover = false,
    turn = 0,
    startTime = new Date(),
    uptime = 0;

  const filter = msg => msg.author.id === player.id && ['open', 'flag', 'clear', 'o', 'f', 'c'].includes(msg.content.split(' ')[0]);

  const attachment = new Discord.MessageAttachment();
  const embed = new Discord.MessageEmbed();

  uptime = toHMS(startTime - new Date());

  attachment.setFile(await print({ ...settings, ...{ map: map } }), `minesweeper_${turn}.png`);
  embed.setColor('BLUE')
    .setTitle('지뢰찾기 게임')
    .setDescription(`**📗 ${width} X ${height} | 💣 ${mines_cnt} | 🔄 ${turn} | ⌛ ${uptime.hours.toString().padStart(2, '0')}:${uptime.minutes.toString().padStart(2, '0')}:${uptime.seconds.toString().padStart(2, '0')}**`)
    .setTimestamp()
    .setFooter(`${player.tag} 님의 게임`)
    .attachFiles([attachment])
    .setImage(`attachment://minesweeper_${turn}.png`);

  let dmfail = false;
  
  let msg = await dm.send(player, embed).catch(err => {
    message.channel.send('DM을 보내는 데 실패했습니다.');
    dmfail = true;
  });

  if (dmfail) return;

  if (channel.type === 'text') channel.send(`${player}, DM에서 지뢰찾기를 플레이하세요!`);

  while (!gameover) {
    let timeover = false;

    const collected = await dm.awaitMessages(filter, { max: 1, time: 120000, errors: ['time'] })
      .catch(collected => { timeover = true; });

    if (timeover) {
      let uptime = toHMS(startTime - new Date());
      embed.setColor('RED').setTimestamp()
        .setDescription(`**📗 ${width} X ${height} | 💣 ${mines_cnt} | 🔄 ${turn} | ⌛ ${uptime.hours.toString().padStart(2, '0')}:${uptime.minutes.toString().padStart(2, '0')}:${uptime.seconds.toString().padStart(2, '0')}**\n\n시간 초과로 게임오버되었습니다...`)
      await dm.send(player, embed);
      break;
    }
    
    const content = collected.first().content;
    const behavior = content.split(' ')[0], y = parseInt(content.split(' ')[1]), x = parseInt(content.split(' ')[2]);

    if (isNaN(y) || isNaN(x)) {
      player.send('올바른 행과 열을 입력해주세요. (예. 5 3)');
      continue;
    }
    if (y < 1 || y > height || x < 1 || x > width) {
      player.send('올바른 범위의 행과 열을 입력해주세요.');
      continue;
    }

    msg.delete();

    if (!turn) map = newMap(settings, x, y);

    let desc = '', attachNew = false, attachName = '', uptime = toHMS(startTime - new Date());

    if (['open', 'o'].includes(behavior)) {
      const openResult = open({ ...settings, ...{ map: map } }, x, y);

      if (openResult === 'mine') {
        gameover = true, turn += 1, attachNew = true;
        desc = '지뢰가 터져서 게임오버되었습니다...'
        embed.setColor('RED');
      }
      else if (openResult === 'opened') {
        desc = '이미 열린 칸을 다시 열 수 없습니다.'
      }
      else if (openResult === 'flaged') {
        desc = '깃발이 꽂힌 칸을 열 수 없습니다.'
      }
      else if (openResult === 'success') {
        turn += 1, attachNew = true;
        if (checkComplete({ ...settings, ...{ map: map } })) {
          gameover = true;
          desc = '축하합니다! 지뢰를 제외한 모든 칸을 열었습니다.'
          embed.setColor('GREEN');
        }
      }
    }
    else if (['flag', 'f'].includes(behavior)) {
      const flagResult = flag({ ...settings, ...{ map: map } }, x, y);

      if (flagResult === 'opened') {
        desc = '이미 열린 칸에 깃발을 꽂을 수 없습니다.'
      }
      else if (flagResult === 'success') {
        turn += 1, attachNew = true;
      }
    }
    else if (['clear', 'c'].includes(behavior)) {
      const clearResult = clear({ ...settings, ...{ map: map } }, x, y);
      
      if (clearResult === 'unopened') {
        desc = '열리지 않은 칸의 주변을 청소할 수 없습니다.'
      }
      else if (clearResult === 'lack of flag') {
        desc = '해당 칸 주변에 꽂힌 깃발의 개수가 칸의 숫자보다 작아 청소할 수 없습니다.'
      }
      else if (clearResult === 'mine') {
        gameover = true, turn += 1, attachNew = true;
        desc = '지뢰가 터져서 게임오버되었습니다...'
        embed.setColor('RED');
      }
      else if (clearResult === 'success') {
        turn += 1, attachNew = true;
        if (checkComplete({ ...settings, ...{ map: map } })) {
          gameover = true;
          desc = '축하합니다! 지뢰를 제외한 모든 칸을 열었습니다.'
          embed.setColor('GREEN');
        }
      }
    }

    embed.setTimestamp()
      .setDescription(`**📗 ${width} X ${height} | 💣 ${mines_cnt} | 🔄 ${turn} | ⌛ ${uptime.hours.toString().padStart(2, '0')}:${uptime.minutes.toString().padStart(2, '0')}:${uptime.seconds.toString().padStart(2, '0')}**\n\n`
        + desc);
        
    if (attachNew) {
      attachment.setFile(await print({ ...settings, ...{ map: map } }), `minesweeper_${turn}.png`);
      embed.attachFiles([attachment])
        .setImage(`attachment://minesweeper_${turn}.png`);
    }

    msg = await dm.send(player, embed);
  }
  client.playing.splice(client.playing.indexOf(player.id), 1);

  if (channel.type === 'text') channel.send(embed.setTitle(player.username + '님의 게임 결과'));
}

module.exports = {
  name: 'play',
  description: '지뢰찾기 게임을 시작합니다.',
  run: async (message, args) => {
    if (message.client.playing.indexOf(message.author.id) !== -1) return message.reply('이미 진행중인 게임이 있습니다.');

    const difficulties = {
      easy: {
        width: 9,
        height: 9,
        mines_cnt: 10
      },
      medium: {
        width: 16,
        height: 16,
        mines_cnt: 40
      },
      hard: {
        width: 30,
        height: 16,
        mines_cnt: 99
      }
    }
    let difficulty;

    if (args[0] === 'medium') difficulty = difficulties.medium;
    else if (args[0] === 'hard') difficulty = difficulties.hard;
    else difficulty = difficulties.easy;

    game({
      player: message.author,
      channel: message.channel,
      client: message.client,
      settings: difficulty
    });
  },
};