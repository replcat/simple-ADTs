type Constructors = {
  Atom: <T>(value_or_error?: T) => Atom<T extends Error ? never : T>
  Maybe: <T>(value?: T) => Maybe<T>
  Result: <T>(value_or_error?: T) => Result<T extends Error ? never : T>
  Just: <T>(value: NonNullable<T>) => Just<NonNullable<T>>
  Nothing: () => Nothing
  Failure: (message_or_error?: string | Error, cause?: unknown) => Failure
}

interface Atom<T = unknown> {
  name: "Just" | "Nothing" | "Failure"
  isa<U>(constructor: (arg?: any) => U): this is U extends Just ? Just<T>
    : U extends Nothing ? Nothing
    : U extends Failure ? Failure
    : U extends Maybe ? Maybe<T>
    : U extends Result ? Result<T>
    : Atom<T> // :3
  unwrap(): T
  map<U>(fn: (value: T) => U): Atom<U>
  match<JOut, NOut, FOut>(matcher: {
    Just: (value: T) => JOut
    Nothing: () => NOut
    Failure: (error: Error) => FOut
  }): Consolidate<JOut | NOut | FOut>
}

interface Maybe<T = unknown> extends Atom<T> {
  name: "Just" | "Nothing"
  map<U>(fn: (value: T) => U): Maybe<U>
  match<JOut, NOut>(matcher: {
    Just: (value: T) => JOut
    Nothing: () => NOut
  }): Consolidate<JOut | NOut>
}

interface Result<T = unknown> extends Atom<T> {
  name: "Just" | "Failure"
  map<U>(fn: (value: T) => U): Result<U>
  match<JOut, FOut>(matcher: {
    Just: (value: T) => JOut
    Failure: (error: Error) => FOut
  }): Consolidate<JOut | FOut>
}

interface Just<T = unknown> extends Atom<T> {
  name: "Just"
  value: NonNullable<T>
  map<U>(fn: (value: T) => U): Just<U>
  match<JOut>(matcher: {
    Just: (value: T) => JOut
  }): Consolidate<JOut>
}

interface Nothing extends Atom<never> {
  name: "Nothing"
  map<U>(fn: (value: never) => U): this
  match<NOut>(matcher: {
    Nothing: () => NOut
  }): Consolidate<NOut>
}

interface Failure extends Atom<never>, Error {
  name: "Failure"
  error: Error
  get message(): string
  map<U>(fn: (value: never) => U): this
  match<FOut>(matcher: {
    Failure: (error: Error) => FOut
  }): Consolidate<FOut>
}

// hacks! using the tuple to create a fake type for typescript to reason about,
// so that the conditional doesn't get distributed over the union, which would
// result in e.g. `Maybe<number> | Maybe<nothing>` instead of `Maybe<number>`
type Consolidate<Union> = [Union] extends [Just<infer T>] ? Just<T>
  : [Union] extends [Nothing] ? Nothing
  : [Union] extends [Failure] ? Failure
  : [Union] extends [Just<infer T> | Nothing] ? Maybe<T>
  : [Union] extends [Just<infer T> | Failure] ? Result<T>
  : [Union] extends [Just<infer T> | Nothing | Failure] ? Atom<T>
  : Union // not never, to allow other types through
