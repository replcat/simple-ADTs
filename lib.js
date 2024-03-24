/** @type {Constructors} */
// @ts-ignore: the following block is not type checked
const constructors = (() => {
  function Base(value) {
    return Some(value)
  }

  Base.prototype = Object.create(Object.prototype)
  Base.prototype.constructor = function() {
    throw new TypeError(`${Base.name} cannot be directly constructed`)
  }

  // if you apply the function type to this the compiler dies :3
  Base.prototype.isa = function(constructor) {
    assert(typeof constructor === "function", `expected a constructor (got ${constructor})`)
    if (constructor.name === "Base") return this["name"] === "Some" || this["name"] === "None" || this["name"] === "Fail"
    if (constructor.name === "Maybe") return this["name"] === "Some" || this["name"] === "None"
    if (constructor.name === "Result") return this["name"] === "Some" || this["name"] === "Fail"
    if (constructor.name === "Box") return this["name"] === "Some"
    return this instanceof constructor
  }

  /** @this {globalThis.Base} */
  Base.prototype.map = function(fn) {
    assert(typeof fn === "function", `map expects a function (got ${fn})`)
    return "value" in this
      ? this.constructor(fn(this.value))
      : this
  }

  /**  @this {globalThis.Base} */
  Base.prototype.ap = function(wrapped_fn) {
    assert(wrapped_fn instanceof Base, `expected a wrapped type (got ${wrapped_fn})`)
    if (!("value" in wrapped_fn)) return wrapped_fn
    assert(typeof wrapped_fn.value === "function", `ap expects a function (got ${wrapped_fn.value})`)
    return ("value" in this)
      ? this.constructor(wrapped_fn.value(this.value))
      : this
  }

  Base.prototype.join = function() {
    return this instanceof Some && this["value"] instanceof Some ? this["value"] : this
  }

  Base.prototype.flatten = function() {
    let joined = this
    while (joined instanceof Some && joined["value"] instanceof Some) {
      // @ts-ignore
      joined = joined.join()
    }
    return joined
  }

  Base.prototype.traverse = function(fn) {
    assert(typeof fn === "function", `traverse expects a function (got ${fn})`)
    if (!(this instanceof Some)) return this
    return (this["value"] instanceof Some)
      ? Some(this["value"]["traverse"](fn))
      : fn(this["value"]).map(this.constructor)
  }

  Base.prototype.chain = function(fn) {
    assert(typeof fn === "function", `chain expects a function (got ${fn})`)
    if (!(this instanceof Some)) return this
    return (this["value"] instanceof Some)
      ? Some(this["value"]["chain"](fn))
      : fn(this["value"])
  }

  Base.prototype.fold = function(on_some, otherwise) {
    if (this instanceof Some) return on_some(this["value"])
    return "error" in this
      ? otherwise(this["error"])
      : otherwise()
  }

  Base.prototype.match = function(matcher) {
    if (typeof matcher.Some === "function" && this instanceof Some) return matcher.Some(this["value"])
    if (typeof matcher.None === "function" && this instanceof None) return matcher.None()
    if (typeof matcher.Fail === "function" && this instanceof Fail) return matcher.Fail(this["error"])
    throw new TypeError(`No match for ${this["name"] ?? "unknown type"}`)
  }

  Base.prototype.unwrap = function() {
    if ("value" in this && this instanceof Some) return this.value
    if ("error" in this && this instanceof Fail) throw this.error
    throw new TypeError(`Unwrapped an empty ${this["name"]}`)
  }

  Base.prototype.unwrap_or = function(value) {
    if (value == null) throw new TypeError(`unwrap_or expects a value (got ${value})`)
    if ("value" in this && this instanceof Some) return this.value
    return value
  }

  Base.prototype.unwrap_or_else = function(fn) {
    if (typeof fn !== "function") throw new TypeError(`unwrap_or_else expects a function (got ${fn})`)
    if ("value" in this && this instanceof Some) return this.value
    return fn()
  }

  function Maybe(value) {
    assert(!(value instanceof Fail), `${Maybe.name} cannot be constructed with a Fail`)
    if (value instanceof None) return value
    return value == null ? None() : Some(value)
  }

  function Result(value, on_null) {
    assert(!(value instanceof None), `${Result.name} cannot be constructed with a None`)
    if (value instanceof Fail) return value
    return value == null ? Fail(on_null) : Some(value)
  }

  function Box(value) {
    assert(value != null, `${Box.name}.value cannot be null or undefined.`)
    return Some(value)
  }

  function Some(value) {
    assert(value != null, `${Some.name}.value cannot be null or undefined.`)
    return Object.create(Some.prototype, {
      name: { value: "Some" },
      value: { value, enumerable: true },
    })
  }

  Some.prototype = Object.create(Base.prototype)
  Some.prototype.constructor = Some

  function None() {
    return Object.create(None.prototype, {
      name: { value: "None" },
    })
  }

  None.prototype = Object.create(Base.prototype)
  None.prototype.constructor = None

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

  const delegate_to_instance = method => (...params) => instance =>
    method in instance
      ? instance[method](...params)
      : instance

  // methods which can be called independently via the type constructors
  const standalone_methods = ["ap", "chain", "flatten", "join", "map", "traverse", "fold", "match"]
  for (const method of standalone_methods) {
    Box[method] = delegate_to_instance(method)
    Maybe[method] = delegate_to_instance(method)
    Result[method] = delegate_to_instance(method)
  }

  return {
    Base,
    Box,
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
