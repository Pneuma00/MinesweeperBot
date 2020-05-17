const Discord = require('discord.js');
const Canvas = require('canvas');
const Random = require('../funcs/random.js');
const { toHMS } = require('../funcs/date.js');

require('../funcs/array_prototype.js');

const print = settings => {
  return new Promise(async (resolve, reject) => {
    let { map, width, height } = settings;

    const canvas = Canvas.createCanvas((width + 2) * 32, (height + 2) * 32);
    const ctx = canvas.getContext('2d');

    const numtiles = [];
    const unopen = await Canvas.loadImage('assets/unopen.png');
    numtiles[0] = await Canvas.loadImage('assets/open.png');
    const mine = await Canvas.loadImage('assets/mine.png');
    const flag = await Canvas.loadImage('assets/flag.png');
    for (let i = 1; i <= 8; i++) {
      numtiles[i] = await Canvas.loadImage(`assets/${i}.png`);
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
          : unopen
          , j * 32, i * 32, 32, 32);
      }
    }

    resolve(canvas.toBuffer());
  });
}

const tempMap = (settings) => {
  const { width, height } = settings;
  return {
    mines: [],
    numbers: Array(height + 2).fill(null).map(() => Array(width + 2).fill(0)),
    opened: Array(height + 2).fill(null).map(() => Array(width + 2).fill(0))
  };
}

const newMap = (settings, x, y) => {
  const { width, height, mines_cnt } = settings;

  const map = {
    mines: [],
    numbers: Array(height + 2).fill(null).map(() => Array(width + 2).fill(NaN)),
    opened: Array(height + 2).fill(null).map(() => Array(width + 2).fill(-1)),
    flaged: Array(height + 2).fill(null).map(() => Array(width + 2).fill(0))
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

const open = (settings, x, y) => {
  const { map, width, height } = settings;

  if (map.opened[y][x]) return 'opened';
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
      if (queue.includesArray([pos[0] + dy[k], pos[1] + dx[k]]) || map.opened[pos[0] + dy[k]][pos[1] + dx[k]]) continue;
      queue.push([pos[0] + dy[k], pos[1] + dx[k]]);
    }
  }
  return 'success';
}

const flag = (settings, x, y) => {
  const { map, width, height } = settings;

  if (map.opened[y][x]) return 'opened';
  
  map.flaged[y][x] = map.flaged[y][x] ? 0 : 1;
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

module.exports = async options => {
  const { player, channel, client, settings } = options;
  let { width, height, map, mines_cnt } = settings;
  const dm = await player.createDM();

  client.playing.push(player.id);

  if (!map) map = tempMap(settings);

  let gameover = false, turn = 0, startTime = new Date(), uptime = 0;
  const filter = msg => msg.author.id === player.id;

  const attachment = new Discord.MessageAttachment();
  let embed = new Discord.MessageEmbed();

  uptime = toHMS(startTime - new Date());

  attachment.setFile(await print({ ...settings, ...{ map: map } }), `minesweeper_${turn}.png`);
  embed.setColor('BLUE')
    .setTitle('지뢰찾기 게임')
    .setDescription(`**📗 ${width} X ${height} | 💣 ${mines_cnt} | 🔄 ${turn} | ⌛ ${uptime.hours.toString().padStart(2, '0')}:${uptime.minutes.toString().padStart(2, '0')}:${uptime.seconds.toString().padStart(2, '0')}**`)
    .setTimestamp()
    .setFooter(`${player.tag} 님의 게임`)
    .attachFiles([attachment])
    .setImage(`attachment://minesweeper_${turn}.png`);

  let msg = await dm.send(player, embed);

  channel.send(`${player}, DM에서 지뢰찾기를 플레이하세요!`);

  while (!gameover) {
    const collected = await dm.awaitMessages(filter, { max: 1, time: 120000, errors: ['time'] })
      .catch(collected => {
        gameover = true;
        uptime = toHMS(startTime - new Date());
        embed.setColor('RED').setTimestamp()
          .setDescription(`**📗 ${width} X ${height} | 💣 ${mines_cnt} | 🔄 ${turn} | ⌛ ${uptime.hours.toString().padStart(2, '0')}:${uptime.minutes.toString().padStart(2, '0')}:${uptime.seconds.toString().padStart(2, '0')}**\n\n시간 초과로 게임오버되었습니다...`)
      });

    const y = parseInt(collected.first().content.split(' ')[0]), x = parseInt(collected.first().content.split(' ')[1]);

    msg.delete();

    if (!turn) map = newMap(settings, x, y);

    const openResult = open({ ...settings, ...{ map: map } }, x, y);

    if (openResult === 'mine') {
      gameover = true, turn += 1;
      uptime = toHMS(startTime - new Date());
      attachment.setFile(await print({ ...settings, ...{ map: map } }), `minesweeper_${turn}.png`);
      embed.setColor('RED').setTimestamp()
        .setDescription(`**📗 ${width} X ${height} | 💣 ${mines_cnt} | 🔄 ${turn} | ⌛ ${uptime.hours.toString().padStart(2, '0')}:${uptime.minutes.toString().padStart(2, '0')}:${uptime.seconds.toString().padStart(2, '0')}**\n\n지뢰가 터져서 게임오버되었습니다...`)
        .attachFiles([attachment])
        .setImage(`attachment://minesweeper_${turn}.png`);
    }
    else if (openResult === 'opened') {
      uptime = toHMS(startTime - new Date());
      embed.setTimestamp()
        .setDescription(`**📗 ${width} X ${height} | 💣 ${mines_cnt} | 🔄 ${turn} | ⌛ ${uptime.hours.toString().padStart(2, '0')}:${uptime.minutes.toString().padStart(2, '0')}:${uptime.seconds.toString().padStart(2, '0')}**\n\n이미 열린 칸을 다시 열 수 없습니다.`);
    }
    else if (openResult === 'success') {
      turn += 1;
      uptime = toHMS(startTime - new Date());
      attachment.setFile(await print({ ...settings, ...{ map: map } }), `minesweeper_${turn}.png`);
      embed.setTimestamp()
          .setDescription(`**📗 ${width} X ${height} | 💣 ${mines_cnt} | 🔄 ${turn} | ⌛ ${uptime.hours.toString().padStart(2, '0')}:${uptime.minutes.toString().padStart(2, '0')}:${uptime.seconds.toString().padStart(2, '0')}**\n\n`)
          .attachFiles([attachment])
          .setImage(`attachment://minesweeper_${turn}.png`);

      if (checkComplete({ ...settings, ...{ map: map } })) {
        gameover = true;
        embed.setColor('GREEN').setTimestamp()
          .setDescription(`**📗 ${width} X ${height} | 💣 ${mines_cnt} | 🔄 ${turn} | ⌛ ${uptime.hours.toString().padStart(2, '0')}:${uptime.minutes.toString().padStart(2, '0')}:${uptime.seconds.toString().padStart(2, '0')}**\n\n축하합니다! 지뢰를 제외한 모든 칸을 열었습니다.`);
      }
    }
    
    msg = await dm.send(player, embed);
  }
  client.playing.splice(client.playing.indexOf(player.id), 1);

  channel.send(embed.setTitle(player.username + '님의 게임 결과'));
}