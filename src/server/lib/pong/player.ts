import * as os from "os";
import {v4 as uuid} from "uuid";


enum PlayerState {
  Waiting = "WAITING",
  Matching = "MATCHING",
  Ready = "READY",
  Playing = "PLAYING",
}


export class Player {
  name: string = uuid();
  server: string = os.hostname();
  state: PlayerState = PlayerState.Waiting;
  opponent: Player | undefined = undefined;

  /**
   * @param name For now, use client.id as name
   */
  constructor(name: string | undefined = undefined) {
    if (name) this.name = name;
  }
}
