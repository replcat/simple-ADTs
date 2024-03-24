type Innermost<T> = T extends Base<infer U> ? Innermost<U> : T

type Constructors = {
  Base: <T>(value: T) => Base<NonNullable<T>>

  Box:
    & (<T>(value: T) => Box<NonNullable<T>>)
    & {
      ap: <T, U>(fn: Box<(value: T) => U>) => (box: Box<T>) => Box<U>
      chain: <T, F extends Box<any>>(fn: (value: Innermost<T>) => F) => (box: Box<T>) => F
      flatten: () => <T>(box: Box<T>) => Box<Innermost<T>>
      join: () => <T>(box: Box<Box<T>>) => Box<T>
      map: <T, U>(fn: (value: T) => U) => (box: Box<T>) => Box<U>
      traverse: <T, F extends Box<any>>(fn: (value: T) => F) => (box: Box<T>) => Box<F>
      fold: <T, U>(fn: (value: T) => U) => (box: Box<T>) => U
    }

  Maybe:
    & (<T>(value?: T) => Maybe<NonNullable<T>>)
    & {
      ap: <T, U>(fn: Maybe<(value: T) => U>) => (maybe: Maybe<T>) => Maybe<U>
      chain: <T, F extends Maybe<any>>(fn: (value: Innermost<T>) => F) => (maybe: Maybe<T>) => F
      flatten: () => <T>(maybe: Maybe<T>) => Maybe<Innermost<T>>
      join: () => <T>(maybe: Maybe<Maybe<T>>) => Maybe<T>
      map: <T, U>(fn: (value: T) => U) => (maybe: Maybe<T>) => Maybe<U>
      traverse: <T, F extends Maybe<any>>(fn: (value: T) => F) => (maybe: Maybe<T>) => Maybe<F>
      fold: <T, U, E>(on_value: (value?: T) => U, on_none?: () => E) => (maybe: Maybe<T>) => U | E
      match: <T, N>(matcher: {
        Some: (value: T) => N
        None: () => N
      }) => (maybe: Maybe<T>) => N
    }

  Result:
    & (<T>(value?: T, on_null?: string | Error) => Result<NonNullable<T>>)
    & {
      ap: <T, U>(fn: Result<(value: T) => U>) => (result: Result<T>) => Result<U>
      chain: <T, F extends Result<any>>(fn: (value: Innermost<T>) => F) => (result: Result<T>) => F
      flatten: () => <T>(result: Result<T>) => Result<Innermost<T>>
      join: () => <T>(result: Result<Result<T>>) => Result<T>
      map: <T, U>(fn: (value: T) => U) => (result: Result<T>) => Result<U>
      traverse: <T, F extends Result<any>>(fn: (value: T) => F) => (result: Result<T>) => Result<F>
      fold: <T, U, E>(on_value: (value: T) => U, on_error?: (error: Error) => E) => (result: Result<T>) => U | E
      match: <T, F>(matcher: {
        Some: (value: T) => F
        Fail: (error: Error) => F
      }) => (result: Result<T>) => F
    }

  Some: <T>(value: NonNullable<T>) => Some<NonNullable<T>>
  None: () => None
  Fail: (error?: string | Error, cause?: unknown) => Fail
}

/**
 * The most general type, a union of everything.
 * No (useful) runtime representation.
 */
interface Base<T = unknown> {
  name: "Some" | "None" | "Fail"
  isa<U>(constructor: (arg?: any) => U): this is U extends Some ? Some<T>
    : U extends None ? None
    : U extends Fail ? Fail
    : U extends Box ? Box<T>
    : U extends Maybe ? Maybe<T>
    : U extends Result ? Result<T>
    : Base<T> // :3
  unwrap(): T
  unwrap_or<U>(value: U): T | U
  unwrap_or_else<U>(fn: () => U): T | U
  join<U>(this: U): U extends Some<Some<infer V>> ? Some<V> : U
  flatten<U>(this: U): U extends Some<infer V> ? Some<Innermost<V>> : U
  map<U>(fn: (value: T) => NonNullable<U>): Base<NonNullable<U>>
  chain<U, F extends Base<NonNullable<U>>>(fn: (value: Innermost<T>) => F): F
  fold<U, E>(on_value: (value?: T) => U, otherwise?: (error: Error) => E): U | E
  match<JOut, NOut, FOut>(matcher: {
    Some: (value: T) => JOut
    None: () => NOut
    Fail: (error: Error) => FOut
  }): Consolidate<JOut | NOut | FOut>
}

/**
 * Definitely contains a value.
 * Just a Some at runtime.
 */
interface Box<T = unknown> extends Base<T> {
  name: "Some"
  value: NonNullable<T>
  map<U>(fn: (value: T) => NonNullable<U>): Box<NonNullable<U>>
  ap<U>(fn: Box<(value: T) => U>): Box<U>
  traverse<U, F extends Box<any>>(fn: (value: T) => F): F
  fold<U>(fn: (value: T) => U): U
}

/**
 * Union of Some and None.
 * No runtime representation.
 */
interface Maybe<T = unknown> extends Base<T> {
  name: "Some" | "None"
  map<U>(fn: (value: T) => NonNullable<U>): Maybe<NonNullable<U>>
  ap<U>(fn: Maybe<(value: T) => U>): Maybe<U>
  traverse<U, F extends Maybe<NonNullable<U>>>(fn: (value: Innermost<T>) => F): Maybe<F>
  fold<U, E>(on_value: (value: T) => U, on_none?: (_: never) => E): U | E
  match<JOut, NOut>(matcher: {
    Some: (value: T) => JOut
    None: () => NOut
  }): Consolidate<JOut | NOut>
}

/**
 * Union of Some and Fail.
 * No runtime representation.
 */
interface Result<T = unknown> extends Base<T> {
  name: "Some" | "Fail"
  map<U>(fn: (value: T) => NonNullable<U>): Result<NonNullable<U>>
  ap<U>(fn: Result<(value: T) => U>): Result<U>
  traverse<U, F extends Result<NonNullable<U>>>(fn: (value: Innermost<T>) => F): Result<F>
  fold<U, E>(on_value: (value: T) => U, on_error?: (error: Error) => E): U | E
  match<JOut, FOut>(matcher: {
    Some: (value: T) => JOut
    Fail: (error: Error) => FOut
  }): Consolidate<JOut | FOut>
}

/**
 * A value that isn't merely hypothetical — it's right there, look.
 * Corresponds to the `Some` type at runtime.
 */
interface Some<T = unknown> extends Base<T> {
  name: "Some"
  value: NonNullable<T>
  map<U>(fn: (value: T) => NonNullable<U>): Some<NonNullable<U>>
  ap<U>(fn: Some<(value: T) => U>): Some<U>
  traverse<U, F extends Some<NonNullable<U>>>(fn: (value: Innermost<T>) => F): Some<F>
  fold<U>(fn: (value: T) => U): U
  match<JOut>(matcher: {
    Some: (value: T) => JOut
  }): Consolidate<JOut>
}

/**
 * An absent value that was optional anyway, so no big deal.
 * Corresponds to the `None` type at runtime.
 */
interface None extends Base<never> {
  name: "None"
  map<U>(fn: (value: never) => U): this
  fold<E>(_: any, on_none: () => E): E
  match<NOut>(matcher: {
    None: () => NOut
  }): Consolidate<NOut>
}

/**
 * An absent value that *possibly* should have existed (but it depends).
 * Corresponds to the `Fail` type at runtime.
 */
interface Fail extends Base<never>, Error {
  name: "Fail"
  error: Error
  get message(): string
  map<U>(fn: (value: never) => U): this
  fold<E>(_: any, on_fail: (error: Error) => E): E
  match<FOut>(matcher: {
    Fail: (error: Error) => FOut
  }): Consolidate<FOut>
}

// hacks! using the tuple to create a fake type for typescript to reason about,
// so that the conditional doesn't get distributed over the union, which would
// result in e.g. `Maybe<number> | Maybe<none>` instead of `Maybe<number>`
type Consolidate<Union> = [Union] extends [Some<infer T>] ? Some<T>
  : [Union] extends [None] ? None
  : [Union] extends [Fail] ? Fail
  : [Union] extends [Some<infer T> | None] ? Maybe<T>
  : [Union] extends [Some<infer T> | Fail] ? Result<T>
  : [Union] extends [Some<infer T> | None | Fail] ? Base<T>
  : Union // not never, to allow other types through
