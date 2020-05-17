module.exports = {
  simpleDate: date => {
    return `${date.getFullYear()}.${date.getMonth()+1}.${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  },
  
  toHMS: ms => {
    const hours = ((ms % 3600000) - ms) / 3600000;
    ms %= 3600000;
    const minutes = ((ms % 60000) - ms) / 60000;
    ms %= 60000;
    const seconds = ((ms % 1000) - ms) / 1000;
    ms %= 1000;
    return { hours: hours, minutes: minutes, seconds: seconds, ms: ms };
  } 
}