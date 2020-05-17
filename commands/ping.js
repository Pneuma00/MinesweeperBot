module.exports = {
  name: 'ping',
  description: '핑을 측정합니다.',
  async execute(message, args) {
    const msg = await message.channel.send("Ping?");
    msg.edit(`Pong! Latency is ${msg.createdTimestamp - message.createdTimestamp}ms.`);
  },
};