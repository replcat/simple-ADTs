type ADT<T> = {
  of(value: T): ADT<T>
  map<U>(fn: (value: T) => U): ADT<U>
}

type Atom<T> = ADT<T> & {
  unwrap(): T
}

type Some<T> = Atom<T> & {
  value: T
}

type None = Atom<never>
