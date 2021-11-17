/// <reference types="node" />
import { IncomingMessage } from 'http';
export declare function getRawBody(stream: IncomingMessage): Promise<Buffer>;
