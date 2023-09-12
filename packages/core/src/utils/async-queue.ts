/**
 * A resolver type used in promise resolution within the AsyncQueue.
 * @template T The type of value to resolve the promise with.
 */
type Resolver<T> = (value: IteratorResult<T>) => void

/**
 * An object containing a resolver function.
 * @template T The type of value to resolve the promise with.
 */
interface Waiter<T> {
  resolve: Resolver<T>
}

/**
 * An async queue that supports async iteration. The queue is FIFO: items read from the queue
 * are in the same order they were added.
 *
 * @class
 * @template T The type of elements in the queue.
 *
 * @example
 *
 * const queue = new AsyncQueue<number>();
 * queue.push(1);
 * queue.push(2);
 *
 * for await (const value of queue) {
 *   console.log(value);
 * }
 */
export class AsyncQueue<T> {
  private _queue: Array<T> = []
  private _waiters: Array<Waiter<T>> = []

  /**
   * Adds a value to the end of the queue. If there's a pending Promise from a `next()`
   * call, the Promise will be resolved with the `value`.
   *
   * @param {T} value - The value to be added to the queue.
   */
  push(value: T): void {
    if (this._waiters.length > 0) {
      const waiter = this._waiters.shift()
      if (waiter) {
        waiter.resolve({ value, done: false })
      }
    } else {
      this._queue.push(value)
    }
  }

  /**
   * Returns an async iterable iterator for the queue.
   *
   * @returns {AsyncIterator<T>} An async iterable iterator that can be used in a for-await-of loop.
   */
  [Symbol.asyncIterator](): AsyncIterator<T> {
    return {
      next: (): Promise<IteratorResult<T>> => {
        if (this._queue.length > 0) {
          const value = this._queue.shift()
          return Promise.resolve({ value: value as T, done: false })
        } else {
          return new Promise(resolve => this._waiters.push({ resolve }))
        }
      }
    }
  }

  /**
   * Removes all elements from the queue and resolves any pending Promises returned by `next()`
   * with `{ done: true }`.
   */
  flush(): void {
    this._queue = []
    while (this._waiters.length > 0) {
      const waiter = this._waiters.shift()
      if (waiter) {
        waiter.resolve({ done: true } as IteratorResult<T>)
      }
    }
  }
}
