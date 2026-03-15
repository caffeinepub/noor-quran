import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface User {
    name: string;
    sessionToken: string;
    phone: string;
    registeredAt: Time;
}
export interface Dua {
    id: bigint;
    title: string;
    text: string;
    arabicText: string;
}
export type Time = bigint;
export interface backendInterface {
    addDua(adminToken: string, title: string, text: string, arabicText: string): Promise<bigint>;
    adminLogin(username: string, password: string): Promise<string>;
    deleteDua(adminToken: string, duaId: bigint): Promise<void>;
    getAllDuas(): Promise<Array<Dua>>;
    getAllUsers(adminToken: string): Promise<Array<User>>;
    getCurrentUser(sessionToken: string): Promise<User>;
    getDuaById(duaId: bigint): Promise<Dua>;
    getQuranSettings(): Promise<[string, Array<[bigint, boolean]>]>;
    getVisitorCount(): Promise<bigint>;
    incrementVisitorCount(): Promise<void>;
    loginUser(phone: string): Promise<string>;
    registerUser(name: string, phone: string): Promise<string>;
    setReciterUrl(adminToken: string, url: string): Promise<void>;
    setSurahEnabled(adminToken: string, surahNumber: bigint, enabled: boolean): Promise<void>;
}
