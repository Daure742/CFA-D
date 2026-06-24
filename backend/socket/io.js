// socket/io.js - expose the Socket.IO instance to controllers
let ioInstance = null;

module.exports = {
  setIo: (io) => { ioInstance = io; },
  getIo: () => ioInstance
};
