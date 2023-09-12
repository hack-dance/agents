/**
 * LogGenerator Class
 *
 * This class handles log entries. It allows writing log entries into a queue,
 * reading from the queue in an asynchronous iterable way, and controlling the reading state.
 *
 * @class
 */

export class LogGenerator {
  private logQueue: Array<{ log: string; group?: string }> = []
  private resolve: ((value?: unknown) => void) | null = null
  private reading = false
  private readingStopped = false

  /**
   * Writes a log entry to the queue. Optionally, a group can be specified.
   *
   * @method
   * @param {Object} logEntry - The log entry.
   * @param {string} logEntry.log - A string representing the log entry.
   * @param {string} [logEntry.group] - An optional string representing the group associated with the log entry.
   *
   * @example
   *
   * const logGenerator = new LogGenerator();
   * logGenerator.write({ log: "Starting process...", group: "ProcessLogs" });
   *
   */
  public write({ log, group }: { log: string; group?: string }) {
    this.logQueue.push({ log, group })
    this.resolve && this.resolve()
  }

  /**
   * Returns an asynchronous generator that yields log entries as they become available.
   *
   * @async
   * @generator
   * @yields {Object} logEntry - The log entry.
   * @yields {string} logEntry.log - A string representing the log entry.
   * @yields {string} [logEntry.group] - An optional string representing the group associated with the log entry.
   *
   * @example
   *
   * const logGenerator = new LogGenerator();
   * logGenerator.startReading();
   * for await (const entry of logGenerator.read()) {
   *   console.log(entry.log);
   * }
   *
   */
  public async *read() {
    while (true) {
      if (this.logQueue.length > 0) {
        yield this.logQueue.shift()
      } else if (this.readingStopped) {
        this.reading = false
        return
      } else {
        await new Promise(resolve => (this.resolve = resolve))
      }
    }
  }

  /**
   * Indicates that the LogGenerator should start yielding log entries.
   *
   * @method
   *
   * @example
   *
   * const logGenerator = new LogGenerator();
   * logGenerator.startReading();
   *
   */
  public startReading() {
    this.readingStopped = false
    this.reading = true
  }

  /**
   * Indicates that the LogGenerator should stop yielding log entries.
   *
   * @method
   *
   * @example
   *
   * const logGenerator = new LogGenerator();
   * logGenerator.startReading();
   * // ... later ...
   * logGenerator.stopReading();
   *
   */
  public stopReading() {
    this.readingStopped = true
    this.reading = false
  }

  /**
   * Returns the current reading state of the LogGenerator.
   *
   * @method
   * @returns {boolean} - `true` if currently reading, `false` otherwise.
   *
   * @example
   *
   * const logGenerator = new LogGenerator();
   * logGenerator.startReading();
   * console.log(logGenerator.isReading());  // Outputs: true
   * logGenerator.stopReading();
   * console.log(logGenerator.isReading());  // Outputs: false
   *
   */
  public isReading() {
    return this.reading
  }
}
