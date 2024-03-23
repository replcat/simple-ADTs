/** @type {Constructors} */
// @ts-ignore
const constructors = (() => {
  // Note that the type safety within this block is pretty weak!

  /**
   * @this {globalThis.Base<T>}
   * @template T
   * @param {NonNullable<T>} value
   * @returns {globalThis.Base<NonNullable<T>>}
   */
  function Base(value) {
    return Some(value)
  }

  Base.prototype = Object.create(Object.prototype)
  Base.prototype.constructor = function() {
    throw new TypeError(`${Base.name} cannot be directly constructed`)
  }

  // if you apply the function type to this the compiler dies :3
  /** @this {globalThis.Base<T>} */
  Base.prototype.isa = function(constructor) {
    assert(typeof constructor === "function", `expected a constructor (got ${constructor})`)
    if (constructor.name === "Base") return this.name === "Some" || this.name === "None" || this.name === "Fail"
    if (constructor.name === "Maybe") return this.name === "Some" || this.name === "None"
    if (constructor.name === "Result") return this.name === "Some" || this.name === "Fail"
    return this instanceof constructor
  }

  /**
   * @this {globalThis.Base<T>}
   * @type {globalThis.Base["map"]}
   */
  Base.prototype.map = function(fn) {
    assert(typeof fn === "function", `map expects a function (got ${fn})`)
    return "value" in this
      ? this.constructor(fn(this.value))
      : this
  }

  /**
   * @this {globalThis.Base<T>}
   * @type {globalThis.Base["ap"]}
   */
  Base.prototype.ap = function(wrapped_fn) {
    assert(wrapped_fn instanceof Base, `expected a wrapped type (got ${wrapped_fn})`)
    if (!("value" in wrapped_fn)) return wrapped_fn
    assert(typeof wrapped_fn.value === "function", `ap expects a function (got ${wrapped_fn.value})`)
    return ("value" in this)
      ? this.constructor(wrapped_fn.value(this.value))
      : this
  }

  /**
   * @this {globalThis.Base<T>}
   * @type {globalThis.Base["chain"]}
   */
  Base.prototype.chain = function(fn) {
    assert(typeof fn === "function", `chain expects a function (got ${fn})`)
    // @ts-ignore
    return "value" in this
      ? fn(this.value)
      : this
  }

  /**
   * @this {globalThis.Base<T>}
   * @type {globalThis.Base<T>["match"]}
   */
  Base.prototype.match = function(matcher) {
    // @ts-ignore
    if (typeof matcher.Some === "function" && this.isa(Some)) return matcher.Some(this.value)
    // @ts-ignore
    if (typeof matcher.None === "function" && this.isa(None)) return matcher.None()
    // @ts-ignore
    if (typeof matcher.Fail === "function" && this.isa(Fail)) return matcher.Fail(this["error"])
    throw new TypeError(`No match for ${this["name"] ?? "unknown type"}`)
  }

  /**
   * @this {globalThis.Some<T> | globalThis.None | globalThis.Fail}
   * @type {globalThis.Base<T>["unwrap"]}
   */
  Base.prototype.unwrap = function() {
    if ("value" in this) return this.value
    if ("error" in this) throw this.error
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

  /**
   * @template T
   * @param {T} value
   * @param {string | Error} [on_null]
   * @returns {globalThis.Result<NonNullable<T>>}
   */
  function Result(value, on_null) {
    return value == null ? Fail(on_null) : Some(value)
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

  Some.prototype = Object.create(Base.prototype)
  Some.prototype.constructor = Some

  /**
   * @returns {globalThis.None}
   */
  function None() {
    return Object.create(None.prototype, {
      name: { value: "None" },
    })
  }

  None.prototype = Object.create(Base.prototype)
  None.prototype.constructor = None

  /**
   * @param {string | Error} [error]
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

  Fail.prototype = Object.create(Base.prototype)
  Fail.prototype.constructor = Fail

  return {
    Base,
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
    const error = new TypeError(message ?? "(unspecified)")
    error.stack = trim_stack(error.stack)
    throw error
  }
}

export { constructors }
