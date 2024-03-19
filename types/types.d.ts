type Constructors = {
  Just:
    & (<T>(value: NonNullable<T>) => Just<NonNullable<T>>)
    & (new<T>(value: NonNullable<T>) => Just<NonNullable<T>>)
  Nothing:
    & (() => Nothing)
    & (new() => Nothing)
  Failure:
    & ((error?: Error | string, ...notes: any) => Failure)
    & (new(error?: Error | string, ...notes: any) => Failure)
  // TODO add (fake) type constructors for Maybe and Result?
}

interface Base<T = unknown> {
  isa<U extends Base>(constructor: (value?: any) => U): this is U
  map<U>(fn: (value: T) => U): Base<U>
  match<J, N, F>(matcher: ThreewayMatcher<T, J, N, F>): J | N | F
  unwrap(): T
}

interface Just<T = unknown> extends Base<T> {
  name: "Just"
  value: NonNullable<T>
  map<U>(fn: (value: T) => U): Just<U>
  match<U>(matcher: JustMatcher<T, U>): U
}

interface Nothing extends Base<never> {
  name: "Nothing"
  map<U>(fn: (value: never) => U): this
  match<N>(matcher: NothingMatcher<never, N>): N
}

interface Failure extends Base<never>, Error {
  name: "Failure"
  map<U>(fn: (value: never) => U): this
  match<F>(matcher: FailureMatcher<never, F>): F
}

interface Maybe<T = unknown> extends Base<T> {
  name: Just["name"] | Nothing["name"]
  map<U>(fn: (value: T) => U): Maybe<U>
  match<J, N>(matcher: MaybeMatcher<T, J, N>): J | N
}

interface Result<T = unknown> extends Base<T> {
  name: Just["name"] | Failure["name"]
  map<U>(fn: (value: T) => U): Result<U>
  match<J, F>(matcher: ResultMatcher<T, J, F>): J | F
}

interface Threeway<T = unknown> extends Base<T> {
  name: Just["name"] | Nothing["name"] | Failure["name"]
  map<U>(fn: (value: T) => U): Threeway<U>
  match<J, N, F>(matcher: ThreewayMatcher<T, J, N, F>): J | N | F
}

type JustMatcher<T, J> = {
  Just: (value: T) => J
}

type NothingMatcher<T, N> = {
  Nothing: () => N
}

type FailureMatcher<T, F> = {
  Failure: (error: Failure) => F
}

type MaybeMatcher<T, J, N> = {
  Just: (value: T) => J
  Nothing: () => N
}

type ResultMatcher<T, J, F> = {
  Just: (value: T) => J
  Failure: (error: Failure) => F
}

type ThreewayMatcher<T, J, N, F> = {
  Just: (value: T) => J
  Nothing: () => N
  Failure: (error: Failure) => F
}
