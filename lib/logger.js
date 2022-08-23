const pino = require("pino");
const pretty = require("pino-pretty");
const logdir = `./logs/`;

const createSonicBoom = (dest) =>
  pino.destination({ dest: dest, append: true, sync: true, mkdir: true });

const streams = [
  {
    stream: pretty({
      colorize: true,
      sync: true,
      translateTime: "SYS:dd-mm-yyyy HH:MM:ss",
      ignore: "pid,hostname",
    }),
  },
  { stream: createSonicBoom(`${logdir}/info.log`) },
  { level: "error", stream: createSonicBoom(`${logdir}/error.log`) },
  { level: "debug", stream: createSonicBoom(`${logdir}/debug.log`) },
  { level: "fatal", stream: createSonicBoom(`${logdir}/fatal.log`) },
];

// const today = new Date()
// const day = today.getUTCDate()
// const month = today.getUTCMonth()
// const year = today.getUTCFullYear()
// const logFileName = day + '-' + month + '-' + year

// const streams = [
//     { stream: process.stdout },
//     { stream: fs.createWriteStream(`./logs/${logFileName}.log`, { flags: 'a' }) },
// ]

const log = pino(
  {
    // transport: {
    //     target: 'pino-pretty',
    //     options: {
    //         translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
    //         ignore: 'pid,hostname'
    //     },
    // },
    level: "info",
  },
  pino.multistream(streams)
);

module.exports = { log };
