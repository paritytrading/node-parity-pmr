'use strict';

const MessageType = {
  ORDER_ADDED: 'A',
  ORDER_ENTERED: 'E',
  ORDER_CANCELED: 'X',
  VERSION: 'V',
  TRADE: 'T'
};

const Side = {
  BUY: 'B',
  SELL: 'S'
};

exports.Side = Side;
exports.MessageType = MessageType;

exports.format = (message) => {
  switch (message.messageType) {
    case MessageType.VERSION:
      return formatVersion(message);
    case MessageType.ORDER_ENTERED:
      return formatOrderEntered(message);
    case MessageType.ORDER_ADDED:
      return formatOrderAdded(message);
    case MessageType.ORDER_CANCELED:
      return formatOrderCanceled(message);
    case MessageType.TRADE:
      return formatTrade(message);
    default:
      throw new Error('Unknown message type: ' + message.messageType);
  }
};

exports.parse = (buffer) => {
  const messageType = buffer.readUInt8(0);

  switch (messageType) {
    case 0x56:
      return parseVersion(buffer);
    case 0x45:
      return parseOrderEntered(buffer);
    case 0x41:
      return parseOrderAdded(buffer);
    case 0x58:
      return parseOrderCanceled(buffer);
    case 0x54:
      return parseTrade(buffer);
    default:
      throw new Error('Unknown message type: ' + messageType);
  }
};

function formatVersion(message) {
  const buffer = Buffer.allocUnsafe(5);

  buffer.writeUInt8(0x56, 0);
  buffer.writeUInt32BE(message.version, 1);

  return buffer;
}

function parseVersion(buffer) {
  return {
    messageType: MessageType.VERSION,
    version: buffer.readUInt32BE(1),
  };
}

function formatOrderEntered(message) {
  const buffer = Buffer.allocUnsafe(50);

  buffer.writeUInt8(0x45, 0);
  writeUInt64BE(buffer, message.timestamp, 1);
  writeString(buffer, message.username, 9, 8);
  writeUInt64BE(buffer, message.orderNumber, 17);
  writeString(buffer, message.side, 25, 1);
  writeString(buffer, message.instrument, 26, 8);
  writeUInt64BE(buffer, message.quantity, 34);
  writeUInt64BE(buffer, message.price, 42);

  return buffer;
}

function parseOrderEntered(buffer) {
  return {
    messageType: MessageType.ORDER_ENTERED,
    timestamp: readUInt64BE(buffer, 1),
    username: readString(buffer, 9, 8),
    orderNumber: readUInt64BE(buffer, 17),
    side: readString(buffer, 25, 1),
    instrument: readString(buffer, 26, 8),
    quantity: readUInt64BE(buffer, 34),
    price: readUInt64BE(buffer, 42),
  };
}

function formatOrderAdded(message) {
  const buffer = Buffer.allocUnsafe(17);

  buffer.writeUInt8(0x41, 0);
  writeUInt64BE(buffer, message.timestamp, 1);
  writeUInt64BE(buffer, message.orderNumber, 9);

  return buffer;
}

function parseOrderAdded(buffer) {
  return {
    messageType: MessageType.ORDER_ADDED,
    timestamp: readUInt64BE(buffer, 1),
    orderNumber: readUInt64BE(buffer, 9),
  };
}

function formatOrderCanceled(message) {
  const buffer = Buffer.allocUnsafe(25);

  buffer.writeUInt8(0x58, 0);
  writeUInt64BE(buffer, message.timestamp, 1);
  writeUInt64BE(buffer, message.orderNumber, 9);
  writeUInt64BE(buffer, message.canceledQuantity, 17);

  return buffer;
}

function parseOrderCanceled(buffer) {
  return {
    messageType: MessageType.ORDER_CANCELED,
    timestamp: readUInt64BE(buffer, 1),
    orderNumber: readUInt64BE(buffer, 9),
    canceledQuantity: readUInt64BE(buffer, 17),
  };
}

function formatTrade(message) {
  const buffer = Buffer.allocUnsafe(37);

  buffer.writeUInt8(0x54, 0);
  writeUInt64BE(buffer, message.timestamp, 1);
  writeUInt64BE(buffer, message.restingOrderNumber, 9);
  writeUInt64BE(buffer, message.incomingOrderNumber, 17);
  writeUInt64BE(buffer, message.quantity, 25);
  buffer.writeUInt32BE(message.matchNumber, 33);

  return buffer;
}

function parseTrade(buffer) {
  return {
    messageType: MessageType.TRADE,
    timestamp: readUInt64BE(buffer, 1),
    restingOrderNumber: readUInt64BE(buffer, 9),
    incomingOrderNumber: readUInt64BE(buffer, 17),
    quantity: readUInt64BE(buffer, 25),
    matchNumber: buffer.readUInt32BE(33),
  };
}

function writeUInt64BE(buffer, value, offset) {
  buffer.writeUInt32BE(value / 0x100000000, offset);
  buffer.writeUInt32BE(value % 0x100000000, offset + 4);
}

function readUInt64BE(buffer, offset) {
  const high = buffer.readUInt32BE(offset);
  const low = buffer.readUInt32BE(offset + 4);

  return 0x100000000 * high + low;
}

function writeString(buffer, value, offset, length) {
  const count = buffer.write(value, offset, length, 'ascii');

  buffer.fill(0x20, offset + count, offset + length);
}

function readString(buffer, offset, length) {
  return buffer.toString('ascii', offset, offset + length);
}
