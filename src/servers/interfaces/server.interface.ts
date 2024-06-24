export interface Server {
  url: string;
  priority: number;
}

export interface ServerWithStatus extends Server {
  isOnline: boolean;
}
