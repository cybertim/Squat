export type SQTWatcher = {
    name: string,
    callback: (obj?: SQTObject) => void,
    last?: SQTObject
}

export class SQTObject {
    uuid?: string;
    value?: string;
}

export type SQTAction = (obj?: SQTObject) => void;
