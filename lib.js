/** @type {Constructors} */
const constructors = (() => {
  /**
   * @template T
   * @param {T} value
   * @returns {globalThis.Mystery<NonNullable<T>>}
   */
  function Mystery(value) {
    return Some(value)
  }

  Mystery.prototype = Object.create(Object.prototype)
  Mystery.prototype.constructor = function() {
    throw new TypeError(`${Mystery.name} cannot be directly constructed`)
  }

  /** @type {Mystery["isa"]} */
  Mystery.prototype.isa = function(constructor) {
    assert(typeof constructor === "function", `expected a constructor (got ${constructor})`)
    if (constructor.name === "Mystery") return this.name === "Some" || this.name === "None" || this.name === "Fail"
    if (constructor.name === "Maybe") return this.name === "Some" || this.name === "None"
    if (constructor.name === "Result") return this.name === "Some" || this.name === "Fail"
    return this instanceof constructor
  }

  /** @type {globalThis.Mystery["map"]} */
  Mystery.prototype.map = function(fn) {
    assert(typeof fn === "function", `map expects a function (got ${fn})`)
    return "value" in this
      ? this.constructor(fn(this.value))
      : this
  }

  Mystery.prototype.match = function(matcher) {
    if (typeof matcher.Some === "function" && this.isa(Some)) return matcher.Some(this.value)
    if (typeof matcher.None === "function" && this.isa(None)) return matcher.None()
    if (typeof matcher.Fail === "function" && this.isa(Fail)) return matcher.Fail(this["error"])
    throw new TypeError(`No match for ${this["name"] ?? "unknown type"}`)
  }

  /** @type {globalThis.Mystery["unwrap"]} */
  Mystery.prototype.unwrap = function() {
    if ("value" in this) return this.value
    throw new TypeError(`Unwrapped an empty ${this.name}`)
  }

  /**
   * @template T
   * @parame {T} [value]
   * @returns {globalThis.Maybe<NonNullable<T>>}
   */
  function Maybe(value) {
    return value == null ? None() : Some(value)
  }

  Maybe.prototype = Mystery.prototype
  Maybe.prototype.constructor = function() {
    throw new TypeError(`${Maybe.name} cannot be directly constructed`)
  }

  /**
   * @template T
   * @param {T} value
   * @param {string | Error} [on_null]
   * @returns {globalThis.Result<NonNullable<T>>}
   */
  function Result(value, on_null) {
    if (value == null) return Fail(on_null)
    return Some(value)
  }

  Result.prototype = Mystery.prototype
  Result.prototype.constructor = function() {
    throw new TypeError(`${Result.name} cannot be directly constructed`)
  }

  /**
   * @template T
   * @param {NonNullable<T>} value
   * @returns {globalThis.Some<NonNullable<T>>}
   */
  function Some(value) {
    assert(value != null, `${Some.name}.value cannot be null or undefined.`)
    return Object.create(Some.prototype, {
      name: { value: "Some" },
      value: { value, enumerable: true },
    })
  }

  Some.prototype = Object.create(Mystery.prototype)
  Some.prototype.constructor = Some

  /**
   * @returns {globalThis.None}
   */
  function None() {
    return Object.create(None.prototype, {
      name: { value: "None" },
    })
  }

  None.prototype = Object.create(Mystery.prototype)
  None.prototype.constructor = None

  /**
   * @param {string | Error} error
   * @param {unknown} [cause]
   * @returns {globalThis.Fail}
   */
  function Fail(error, cause) {
    if (!(error instanceof Error)) {
      error = new Error(error ?? "(unspecified)")
      error.stack = trim_stack(error.stack)
    }
    if (cause) error.cause = cause
    return Object.create(Fail.prototype, {
      name: { value: "Fail" },
      error: { value: error, enumerable: true },
      message: { get: () => error.message, enumerable: true },
    })
  }

  Fail.prototype = Object.create(Mystery.prototype)
  Fail.prototype.constructor = Fail

  return {
    Mystery,
    Maybe,
    Result,
    Some,
    None,
    Fail,
  }
})()

/**
 * @param {string | undefined} stack
 */
function trim_stack(stack) {
  if (typeof stack !== "string") return stack
  const [first, ...rest] = stack.split("\n")
  return [first, ...rest.slice(1)].join("\n")
}

/**
 * @param {*} condition
 * @param {string} message
 * @return {asserts condition}
 */
function assert(condition, message) {
  if (!condition) {
    const error = new TypeError(`Invariant violation: ${message}`)
    error.stack = trim_stack(error.stack)
    throw error
  }
}

export { constructors }
