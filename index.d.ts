// Type definitions for parity-pmr 0.1
// Project: https://github.com/paritytrading/node-parity-pmr#readme
// Definitions by: Leo Vujanić <https://github.com/leovujanic>
// Full protocol specification can be found here https://github.com/paritytrading/parity/blob/master/libraries/net/doc/PMR.md#readme
import {Buffer} from "node";

export interface Version {
    messageType: "V",
    version: number;
}

export interface OrderEntered {
    messageType: "E",
    timestamp: number;
    username: string;
    orderNumber: number;
    side: "B" | "S";
    instrument: string;
    quantity: number;
    price: number;
}

export interface OrderAdded {
    messageType: "A",
    timestamp: number;
    orderNumber: number;
}

export interface OrderCanceled {
    messageType: "X",
    timestamp: number;
    orderNumber: number;
    canceledQuantity: number;
}

export interface Trade {
    messageType: "T",
    timestamp: number;
    restingOrderNumber: number;
    incomingOrderNumber: number;
    quantity: number;
    matchNumber: number;
}

export function format(message: Version | OrderEntered | OrderAdded | OrderCanceled | Trade): Buffer;

export function parse(buffer: Buffer): Version | OrderEntered | OrderAdded | OrderCanceled | Trade;
