// Type definitions for parity-pmr 0.1
// Project: https://github.com/paritytrading/node-parity-pmr#readme
// Definitions by: Leo Vujanić <https://github.com/leovujanic>
// Full protocol specification can be found here https://github.com/paritytrading/parity/blob/master/libraries/net/doc/PMR.md#readme
import {Buffer} from "node";

export enum MessageType {
    ORDER_ADDED = "A",
    ORDER_ENTERED = "E",
    ORDER_CANCELED = "X",
    VERSION = "V",
    TRADE = "T",
}

export enum Side {
    BUY = "B",
    SELL = "S"
}

export interface Version {
    messageType: MessageType.VERSION,
    version: number;
}

export interface OrderEntered {
    messageType: MessageType.ORDER_ENTERED,
    timestamp: number;
    username: string;
    orderNumber: number;
    side: Side;
    instrument: string;
    quantity: number;
    price: number;
}

export interface OrderAdded {
    messageType: MessageType.ORDER_ADDED,
    timestamp: number;
    orderNumber: number;
}

export interface OrderCanceled {
    messageType: MessageType.ORDER_CANCELED,
    timestamp: number;
    orderNumber: number;
    canceledQuantity: number;
}

export interface Trade {
    messageType: MessageType.TRADE,
    timestamp: number;
    restingOrderNumber: number;
    incomingOrderNumber: number;
    quantity: number;
    matchNumber: number;
}

export function format(message: Version | OrderEntered | OrderAdded | OrderCanceled | Trade): Buffer;

export function parse(buffer: Buffer): Version | OrderEntered | OrderAdded | OrderCanceled | Trade;
