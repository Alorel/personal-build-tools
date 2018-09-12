interface OkSafeResult<T> {
  ok: true;

  result: T;
}

interface FailSafeResult<T> {
  err: Error;

  ok: false;

  result?: T;
}

export type SafeResult<T> = OkSafeResult<T> | FailSafeResult<T>;
