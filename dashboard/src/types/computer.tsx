export interface ComputerInfo {
    system:  System;
    cpu:     CPU;
    memory:  Memory;
    network: Network[];
    process: null;
    images:  Images;
    docker:  null;
}

export interface CPU {
    cores: number;
    model: string;
    speed: string;
    cpus:  Cpus[];
}

export interface Cpus {
    core:  number;
    model: string;
    speed: number;
}

export interface Images {
    message: string;
}

export interface Memory {
    total:        string;
    free:         string;
    used:         string;
    usagePercent: string;
}

export interface Network {
    name:      string;
    addresses: Address[];
}

export interface Address {
    address:  string;
    family:   string;
    mac:      string;
    netmask:  string;
    cidr:     string;
    internal: boolean;
}

export interface System {
    hostname: string;
    platform: string;
    release:  string;
    arch:     string;
    uptime:   number;
    userInfo: UserInfo;
}

export interface UserInfo {
    uid:      number;
    gid:      number;
    username: string;
    homedir:  string;
    shell:    null;
}

export interface Device {
    system: string;
    platform: string;
    version: string;
    user: string;
    serverToken: string;
    mytoken: string;
}