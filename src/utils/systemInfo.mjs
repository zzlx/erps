import os from 'os';

export default function sysinfo() {
  return {
    EOL: os.EOL,
    arch: os.arch(),
    //constants: os.constants,
    cpus: os.cpus(),
    endianness: os.endianness(),
    freemem: os.freemem(),
    hostname: os.hostname(),
    networkInterfaces: os.networkInterfaces(),
    platform: os.platform(),
    release: os.release(),
    totalmem: os.totalmem(),
    type: os.type(),
    uptime: os.uptime(),
    userInfo: os.userInfo(),
  };
}

// test
//console.log(sysinfo());
