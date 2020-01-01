/*
 * Copyright 2017 Parity authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const PMR = require('./');
const assert = require('assert');

describe('PMR', function () {
  const messages = [
    {
      name: 'Version',
      formatted: [
        0x56,
        0x00, 0x00, 0x00, 0x01,
      ],
      parsed: {
        messageType: PMR.MessageType.VERSION,
        version: 1,
      },
    },
    {
      name: 'Order Entered',
      formatted: [
        0x45,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
        0x46, 0x4f, 0x4f, 0x20, 0x20, 0x20, 0x20, 0x20,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02,
        0x42,
        0x42, 0x41, 0x52, 0x20, 0x20, 0x20, 0x20, 0x20,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04,
      ],
      parsed: {
        messageType: PMR.MessageType.ORDER_ENTERED,
        timestamp: 1,
        username: 'FOO     ',
        orderNumber: 2,
        side: PMR.Side.BUY,
        instrument: 'BAR     ',
        quantity: 3,
        price: 4,
      },
    },
    {
      name: 'Order Added',
      formatted: [
        0x41,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02,
      ],
      parsed: {
        messageType: PMR.MessageType.ORDER_ADDED,
        timestamp: 1,
        orderNumber: 2,
      },
    },
    {
      name: 'Order Canceled',
      formatted: [
        0x58,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03,
      ],
      parsed: {
        messageType: PMR.MessageType.ORDER_CANCELED,
        timestamp: 1,
        orderNumber: 2,
        canceledQuantity: 3,
      },
    },
    {
      name: 'Trade',
      formatted: [
        0x54,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04,
        0x00, 0x00, 0x00, 0x05,
      ],
      parsed: {
        messageType: PMR.MessageType.TRADE,
        timestamp: 1,
        restingOrderNumber: 2,
        incomingOrderNumber: 3,
        quantity: 4,
        matchNumber: 5,
      },
    },
  ];

  describe('#format()', function () {
    messages.forEach((message) => {
      it(`handles ${message.name} message`, function () {
        assert.deepStrictEqual(PMR.format(message.parsed), Buffer.from(message.formatted));
      });
    });

    it('handles unknown message type', function () {
      const message = {
        messageType: '?'
      };

      assert.throws(() => PMR.format(message), /Unknown message type: \?/);
    });

    it('handles too short string', function () {
      const formatted = [
        0x45,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
        0x46, 0x4f, 0x4f, 0x20, 0x20, 0x20, 0x20, 0x20,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02,
        0x42,
        0x42, 0x41, 0x52, 0x20, 0x20, 0x20, 0x20, 0x20,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04,
      ];

      const parsed = {
        messageType: PMR.MessageType.ORDER_ENTERED,
        timestamp: 1,
        username: 'FOO',
        orderNumber: 2,
        side: PMR.Side.BUY,
        instrument: 'BAR     ',
        quantity: 3,
        price: 4,
      };

      assert.deepStrictEqual(PMR.format(parsed), Buffer.from(formatted));
    });

    it('handles too long string', function () {
      const formatted = [
        0x45,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
        0x46, 0x4f, 0x4f, 0x20, 0x42, 0x41, 0x52, 0x20,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02,
        0x42,
        0x51, 0x55, 0x55, 0x58, 0x20, 0x20, 0x20, 0x20,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04,
      ];

      const parsed = {
        messageType: PMR.MessageType.ORDER_ENTERED,
        timestamp: 1,
        username: 'FOO BAR BAZ',
        orderNumber: 2,
        side: PMR.Side.BUY,
        instrument: 'QUUX',
        quantity: 3,
        price: 4,
      }

      assert.deepStrictEqual(PMR.format(parsed), Buffer.from(formatted));
    });
  });

  describe('#parse()', function () {
    messages.forEach((message) => {
      it(`handles ${message.name} message`, function () {
        assert.deepStrictEqual(PMR.parse(Buffer.from(message.formatted)), message.parsed);
      });
    });

    it('handles unknown message type', function () {
      const buffer = Buffer.from([ 0x3f ]);

      assert.throws(() => PMR.parse(buffer), /Unknown message type: 63/);
    });
  });
});
