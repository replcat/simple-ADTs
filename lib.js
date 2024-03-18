/**
 * @template T
 * @abstract
 */
export class ADT {
  /**
   * @param {T} value
   * @returns {this}
   */
  of(value) {
    // @ts-ignore
    return new this.constructor(value)
  }

  /**
   * @template U
   * @param {(value: T) => U} fn
   * @returns {ADT<U>}
   */
  map(fn) {
    // @ts-ignore
    return new this.constructor(fn(this.value))
  }
}

/**
 * @template T
 * @extends {ADT<T>}
 * @abstract
 */
export class Atom extends ADT {
  unwrap() {
    if ("value" in this) {
      return this.value
    } else {
      throw new Error(`Unwrapped an empty ${this.constructor.name}`)
    }
  }
}

/**
 * @template T
 * @extends {Atom<T>}
 */
export class Some extends Atom {
  value

  /**
   * @param {T} value
   */
  constructor(value) {
    super()
    this.value = value
  }

  /**
   * @template U
   * @param {(value: T) => U} fn
   * @returns {Some<U>}
   * @override
   */
  map(fn) {
    return new Some(fn(this.value))
  }
}

/**
 * @extends {Atom<never>}
 */
export class None extends Atom {
  /**
   * @template U
   * @param {(value: never) => U} fn
   * @returns {None}
   * @override
   */
  map(fn) {
    return this
  }
}
