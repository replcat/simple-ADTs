type Constructors = {
  Mystery: <T>(value: T) => Mystery<NonNullable<T>>
  Maybe: <T>(value?: T) => Maybe<NonNullable<T>>
  Result: <T>(value?: T, on_null?: string | Error) => Result<NonNullable<T>>
  Some: <T>(value: NonNullable<T>) => Some<NonNullable<T>>
  None: () => None
  Fail: (error?: string | Error, cause?: unknown) => Fail
}

/**
 * The most general type, a union of everything.
 * No (useful) runtime representation.
 */
interface Mystery<T = unknown> {
  name: "Some" | "None" | "Fail"
  isa<U>(constructor: (arg?: any) => U): this is U extends Some ? Some<T>
    : U extends None ? None
    : U extends Fail ? Fail
    : U extends Maybe ? Maybe<T>
    : U extends Result ? Result<T>
    : Mystery<T> // :3
  unwrap(): T
  map<U>(fn: (value: T) => NonNullable<U>): Mystery<NonNullable<U>>

  ap<U>(this: Mystery<(value: T) => U>, arg: Mystery<T>): Mystery<U>

  chain<U>(fn: (value: T) => NonNullable<U>): U extends None ? None
    : U extends Fail ? Fail
    : NonNullable<U> extends Maybe<infer V> ? Maybe<V>
    : NonNullable<U> extends Result<infer V> ? Result<V>
    : NonNullable<U> extends Some<infer V> ? Some<V>
    : NonNullable<U> extends Mystery<infer V> ? Mystery<V>
    : Mystery<NonNullable<U>>

  match<JOut, NOut, FOut>(matcher: {
    Some: (value: T) => JOut
    None: () => NOut
    Fail: (error: Error) => FOut
  }): Consolidate<JOut | NOut | FOut>
}

/**
 * Union of Some and None.
 * No runtime representation.
 */
interface Maybe<T = unknown> extends Mystery<T> {
  name: "Some" | "None"
  map<U>(fn: (value: T) => NonNullable<U>): Maybe<NonNullable<U>>
  match<JOut, NOut>(matcher: {
    Some: (value: T) => JOut
    None: () => NOut
  }): Consolidate<JOut | NOut>
}

/**
 * Union of Some and Fail.
 * No runtime representation.
 */
interface Result<T = unknown> extends Mystery<T> {
  name: "Some" | "Fail"
  map<U>(fn: (value: T) => NonNullable<U>): Result<NonNullable<U>>
  match<JOut, FOut>(matcher: {
    Some: (value: T) => JOut
    Fail: (error: Error) => FOut
  }): Consolidate<JOut | FOut>
}

/**
 * A value that isn't merely hypothetical — it's right there, look.
 * Corresponds to the `Some` type at runtime.
 */
interface Some<T = unknown> extends Mystery<T> {
  name: "Some"
  value: NonNullable<T>
  map<U>(fn: (value: T) => NonNullable<U>): Some<NonNullable<U>>
  match<JOut>(matcher: {
    Some: (value: T) => JOut
  }): Consolidate<JOut>
}

/**
 * An absent value that was optional anyway, so no big deal.
 * Corresponds to the `None` type at runtime.
 */
interface None extends Mystery<never> {
  name: "None"
  map<U>(fn: (value: never) => U): this
  match<NOut>(matcher: {
    None: () => NOut
  }): Consolidate<NOut>
}

/**
 * An absent value that *possibly* should have existed (but it depends).
 * Corresponds to the `Fail` type at runtime.
 */
interface Fail extends Mystery<never>, Error {
  name: "Fail"
  error: Error
  get message(): string
  map<U>(fn: (value: never) => U): this
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
  : [Union] extends [Some<infer T> | None | Fail] ? Mystery<T>
  : Union // not never, to allow other types through
