import * as os from "os";
import {v4 as uuid} from "uuid";
import {Client} from "./client";


export enum PlayerState {
  Waiting = "WAITING",
  Matching = "MATCHING",
  Ready = "READY",
  Playing = "PLAYING",
  GameOver = "GAMEOVER",
}


export class Player {
  name: string;
  server: string;
  state: PlayerState = PlayerState.Waiting;
  opponent?: string;

  client?: Client;
  channel?: string;

  messages = 0;
  mps = 0;

  /**
   * @param name For now, use client.id as name
   * @param server
   */
  constructor(name: string, server: string) {
    this.name = name;
    this.server = server;
  }

  /**
   * Remove properties that can't or shouldn't be serialized to JSON.
   */
  stringifySafe(): object {
    return {...this, client: undefined, clientId: this.client?.id};
  }
}
