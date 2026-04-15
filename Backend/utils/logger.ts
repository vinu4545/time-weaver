export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger {
  private context: string;
  private static level: LogLevel = LogLevel.INFO;

  constructor(context: string) {
    this.context = context;
  }

  public static setLevel(level: LogLevel): void {
    Logger.level = level;
  }

  public debug(message: string, ...args: any[]): void {
    if (Logger.level <= LogLevel.DEBUG) {
      console.debug(`[DEBUG] ${this.context}: ${message}`, ...args);
    }
  }

  public info(message: string, ...args: any[]): void {
    if (Logger.level <= LogLevel.INFO) {
      console.info(`[INFO] ${this.context}: ${message}`, ...args);
    }
  }

  public warn(message: string, ...args: any[]): void {
    if (Logger.level <= LogLevel.WARN) {
      console.warn(`[WARN] ${this.context}: ${message}`, ...args);
    }
  }

  public error(message: string, ...args: any[]): void {
    if (Logger.level <= LogLevel.ERROR) {
      console.error(`[ERROR] ${this.context}: ${message}`, ...args);
    }
  }
}
