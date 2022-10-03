import * as os from "os";
import {v4 as uuid} from "uuid";
import {Client} from "./client";


export enum PlayerState {
  Waiting = "WAITING",
  Matching = "MATCHING",
  Ready = "READY",
  Playing = "PLAYING",
}


export class Player {
  name: string;
  server: string = os.hostname();
  state: PlayerState = PlayerState.Waiting;
  opponent: string | undefined = undefined;

  client: Client | undefined;
  channel: string | undefined;

  /**
   * @param name For now, use client.id as name
   */
  constructor(name: string) {
    this.name = name;
  }
}
