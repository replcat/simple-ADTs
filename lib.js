/** @type {Constructors} */
const constructors = (() => {
  // Note that the type safety in this block is deliberately pretty weak!

  /**
   * @template T
   * @param {T | Error} [value_or_error]
   * @returns {globalThis.Nebulous<NonNullable<T>>}
   */
  function Nebulous(value_or_error) {
    if (value_or_error == null) return None()
    if (value_or_error instanceof Error) return Fail(value_or_error)
    return Some(value_or_error)
  }

  Nebulous.prototype = Object.create(Object.prototype)
  Nebulous.prototype.constructor = function() {
    throw new TypeError("Nebulous cannot be directly constructed")
  }

  /** @type {Nebulous["is"]} */
  Nebulous.prototype.is = function(constructor) {
    // @ts-ignore
    if (constructor.name === "Nebulous") return this.name === "Some" || this.name === "None" || this.name === "Fail"
    // @ts-ignore
    if (constructor.name === "Maybe") return this.name === "Some" || this.name === "None"
    // @ts-ignore
    if (constructor.name === "Result") return this.name === "Some" || this.name === "Fail"

    return this instanceof constructor
  }

  /** @type {Nebulous["map"]} */
  Nebulous.prototype.map = function(fn) {
    constraint(typeof fn === "function", `map expects a function (got ${fn})`)
    return this.value
      ? this.constructor(fn(this.value))
      : this
  }

  Nebulous.prototype.match = function(matcher) {
    if (matcher.Some && this["is"](Some)) return matcher.Some(this.value)
    if (matcher.None && this["is"](None)) return matcher.None()
    if (matcher.Fail && this["is"](Fail)) return matcher.Fail(this["error"])
    throw new TypeError(`No match for ${this["name"] ?? "unknown type"}`)
  }

  /**
   * @template T
   * @parame {T} [value]
   * @returns {globalThis.Maybe<NonNullable<T>>}
   */
  function Maybe(value) {
    return value == null ? None() : Some(value)
  }

  Maybe.prototype = Nebulous.prototype
  Maybe.prototype.constructor = function() {
    throw new TypeError("Maybe cannot be directly constructed")
  }

  /**
   * @template T
   * @param {T | Error} value_or_error
   * @returns {globalThis.Result<NonNullable<T>>}
   */
  function Result(value_or_error) {
    if (value_or_error == null) return Fail("Result value was null or undefined")
    if (value_or_error instanceof Error) return Fail(value_or_error)
    return Some(value_or_error)
  }

  Result.prototype = Nebulous.prototype
  Result.prototype.constructor = function() {
    throw new TypeError("Result cannot be directly constructed")
  }

  /**
   * @template T
   * @param {NonNullable<T>} value
   * @returns {globalThis.Some<NonNullable<T>>}
   */
  function Some(value) {
    constraint(value != null, "Some value should not be null or undefined")
    return Object.create(Some.prototype, {
      name: { value: "Some" },
      value: { value, enumerable: true },
    })
  }

  Some.prototype = Object.create(Nebulous.prototype)
  Some.prototype.constructor = Some

  /**
   * @returns {globalThis.None}
   */
  function None() {
    return Object.create(None.prototype, {
      name: { value: "None" },
    })
  }

  None.prototype = Object.create(Nebulous.prototype)
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

  Fail.prototype = Object.create(Nebulous.prototype)
  Fail.prototype.constructor = Fail

  return {
    Nebulous,
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
function constraint(condition, message) {
  if (!condition) {
    const error = new TypeError(`Constraint was violated: ${message}`)
    error.stack = trim_stack(error.stack)
    throw error
  }
}

export { constructors }
