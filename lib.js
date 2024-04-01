/** @type {Pipe} */
var pipe = (...args) => value => args.reduce((acc, fn) => fn(acc), value)

/** @type {Curry} */
var curry = (fn, ...args) =>
  args.length >= fn.length
    ? fn(...args)
    : curry.bind(null, fn, ...args)

function inspect_type(variable) {
  if (variable === null) return "null"
  if (variable instanceof Object) return variable.constructor.name
  return typeof variable
}

/** @type {Constructors} */
// @ts-ignore: the following block is not type checked
const constructors = (() => {
  function Outcome(value) {
    if (value == null) return Nothing()
    if (value instanceof Nothing) return value

    if (value instanceof Error) return Failure(value)
    if (value instanceof Failure) return value

    return Just(value)
  }

  Outcome.prototype = Object.create(Object.prototype, {
    name: {
      get: function() {
        return this.constructor.name
      },
    },
  })

  Outcome.prototype.constructor = function() {
    throw new TypeError(`${Outcome.name} cannot be directly constructed`)
  }

  Outcome.prototype.isa = function(constructor) {
    assert(typeof constructor === "function", `expected a constructor (got ${inspect_type(constructor)})`)
    assert("name" in this, `expected Outcome instance to have a name property`)
    if (constructor.name === "Outcome") return this.name === "Just" || this.name === "Nothing" || this.name === "Failure"
    if (constructor.name === "Maybe") return this.name === "Just" || this.name === "Nothing"
    if (constructor.name === "Result") return this.name === "Just" || this.name === "Failure"
    return this instanceof constructor
  }

  Outcome.prototype.map = function(fn) {
    assert(typeof fn === "function", `map expects a function (got ${fn})`)
    return (this instanceof Just)
      ? this.constructor(fn(this["value"]))
      : this
  }

  Outcome.prototype.ap = function(wrapped_fn) {
    assert(wrapped_fn instanceof Outcome, `expected a wrapped type (got ${inspect_type(wrapped_fn)})`)
    if (!(wrapped_fn instanceof Just)) return wrapped_fn
    const inner_fn = wrapped_fn["value"]
    assert(typeof inner_fn === "function", `ap expects a function (got ${inspect_type(inner_fn)})`)
    return (this instanceof Just)
      ? this.constructor(inner_fn(this["value"]))
      : this
  }

  Outcome.prototype.join = function() {
    return (this instanceof Just && this["value"] instanceof Outcome)
      ? this["value"]
      : this
  }

  Outcome.prototype.flatten = function() {
    let joined = this
    while (joined instanceof Just && joined["value"] instanceof Just) {
      // @ts-ignore
      joined = joined.join()
    }
    return joined
  }

  Outcome.prototype.traverse = function(fn) {
    assert(typeof fn === "function", `traverse expects a function (got ${inspect_type(fn)})`)
    if (!(this instanceof Just)) return this
    return (this["value"] instanceof Just)
      ? Just(this["value"]["traverse"](fn))
      : fn(this["value"]).map(Just)
  }

  Outcome.prototype.chain = function(fn) {
    assert(typeof fn === "function", `chain expects a function (got ${inspect_type(fn)})`)
    if (!(this instanceof Just)) return this
    return (this["value"] instanceof Just)
      ? Just(this["value"]["chain"](fn))
      : fn(this["value"])
  }

  Outcome.prototype.fold = function(on_just, otherwise) {
    if (this instanceof Just) return on_just(this["value"])
    return (this instanceof Failure)
      ? otherwise(this["error"])
      : otherwise()
  }

  Outcome.prototype.match = function(matcher) {
    if (typeof matcher.Just === "function" && this instanceof Just) return matcher.Just(this["value"])
    if (typeof matcher.Nothing === "function" && this instanceof Nothing) return matcher.Nothing()
    if (typeof matcher.Failure === "function" && this instanceof Failure) return matcher.Failure(this["error"])
    throw new TypeError(`No match for ${this["name"] ?? "unknown type"}`)
  }

  Outcome.prototype.unwrap = function() {
    if (this instanceof Just) return this["value"]
    if (this instanceof Failure) throw this["error"]
    throw new TypeError(`Tried to unwrap an empty ${this["name"]}`)
  }

  Outcome.prototype.unwrap_or = function(fallback) {
    assert(fallback != null, `unwrap_or expects a value (got ${inspect_type(fallback)})`)
    if (this instanceof Just) return this["value"]
    return fallback
  }

  Outcome.prototype.unwrap_or_else = function(fallback_fn) {
    assert(typeof fallback_fn === "function", `unwrap_or_else expects a function (got ${inspect_type(fallback_fn)})`)
    if (this instanceof Just) return this["value"]
    return fallback_fn()
  }

  Outcome.prototype.unwrap_error = function() {
    if (this instanceof Failure) return this["error"]
    throw new TypeError(`Tried to unwrap_error an a ${this["name"]}`)
  }

  Outcome.prototype.unwrap_error_or = function(fallback) {
    assert(fallback != null, `unwrap_error_or expects a value (got ${inspect_type(fallback)})`)
    if (this instanceof Failure) return this["error"]
    return fallback
  }

  Outcome.prototype.unwrap_error_or_else = function(fallback_fn) {
    assert(typeof fallback_fn === "function", `unwrap_error_or_else expects a function (got ${inspect_type(fallback_fn)})`)
    if (this instanceof Failure) return this["error"]
    return fallback_fn()
  }

  function Maybe(value) {
    if (value == null) return Nothing()
    if (value instanceof Nothing) return value
    return Just(value)
  }

  function Result(value) {
    if (value == null) return Failure()
    if (value instanceof Error) return Failure(value)
    if (value instanceof Failure) return value
    return Just(value)
  }

  function Just(value) {
    assert(value != null, `Just expects a value (got ${inspect_type(value)})`)
    return Object.create(Just.prototype, {
      value: { value, enumerable: true },
    })
  }

  Just.prototype = Object.create(Outcome.prototype)
  Just.prototype.constructor = Just

  function Nothing() {
    return Object.create(Nothing.prototype)
  }

  Nothing.prototype = Object.create(Outcome.prototype)
  Nothing.prototype.constructor = Nothing

  function Failure(error) {
    if (error instanceof Failure) return error

    if (!(error instanceof Error)) {
      error = new Error(error ?? "(unspecified)")
      error.stack = trim_stack(error.stack)
    }

    return Object.create(Failure.prototype, {
      message: { value: error.message, enumerable: true },
      error: { value: error },
    })
  }

  Failure.prototype = Object.create(Outcome.prototype)
  Failure.prototype.constructor = Failure

  function Subject(init = Nothing()) {
    assert(init instanceof Outcome, `Subject expects an Outcome (got ${inspect_type(init)})`)

    const instance = Object.create(Subject.prototype, {
      inner: { value: init, configurable: true },

      value: { enumerable: false, configurable: true },
      error: { enumerable: false, configurable: true },

      subscribers: { value: [], configurable: true },
      is_completed: { value: false, configurable: true },
    })

    instance.next(init)

    return instance
  }

  Subject.prototype = Object.create(Object.prototype, {
    [Symbol.toStringTag]: {
      value: function() {
        return this.is_completed ? "∅" : String(this.subscribers.length)
      },
    },
  })

  Subject.prototype.constructor = Subject

  Subject.prototype.complete = function() {
    assert("subscribers" in this && Array.isArray(this.subscribers), `expected Subject instance to have a subscribers array`)
    if (this["is_completed"]) return
    for (const subscriber of this.subscribers) {
      if (subscriber.complete) subscriber.complete()
    }
    Object.defineProperties(this, {
      subscribers: { value: [] },
      is_completed: { value: true },
    })
    Object.freeze(this)
  }

  Subject.prototype.subscribe = function(subscriber) {
    assert(typeof subscriber === "object", `subscribe expects an object (got ${inspect_type(subscriber)})`)
    assert(subscriber.next || subscriber.complete, `subscribe expects at least one handler`)
    assert(!subscriber.next || typeof subscriber.next === "function", `subscribe expects next handler to be a function (got ${inspect_type(subscriber.next)})`)
    assert(!subscriber.complete || typeof subscriber.complete === "function", `subscribe expects complete handler to be a function (got ${inspect_type(subscriber.complete)})`)
    assert("subscribers" in this && Array.isArray(this.subscribers), `exected Subject instance to have a subscribers array`)
    if (this["is_completed"]) return
    this.subscribers.push(subscriber)
  }

  Subject.prototype.next = function(next = Nothing()) {
    assert(next instanceof Outcome, `next expects an Outcome (got ${inspect_type(next)})`)
    if (this["is_completed"]) return
    Object.defineProperties(this, {
      inner: { configurable: true, value: next },
      value: { configurable: true, value: next instanceof Just ? next["value"] : undefined, enumerable: next instanceof Just },
      error: { configurable: true, value: next instanceof Failure ? next["error"] : undefined, enumerable: next instanceof Failure },
    })
    for (const subscriber of this["subscribers"]) {
      if (subscriber.next) subscriber.next(this["inner"])
    }
  }

  Subject.prototype.derive = function(fn) {
    assert(typeof fn === "function", `compute expects a function (got ${inspect_type(fn)})`)
    const derived_instance = Subject(fn(this["inner"]))
    this["subscribe"]({
      next: next => derived_instance.next(fn(next)),
      complete: () => derived_instance.complete(),
    })
    return derived_instance
  }

  Subject.prototype.merge = function(...subjects) {
    const merged = Subject(this["inner"])
    for (const subject of [this, ...subjects]) {
      subject.subscribe({ next: next => merged.next(next) })
    }
    return merged
  }

  const delegable_methods = ["join", "flatten", "ap", "chain", "map", "traverse", "fold", "match", "unwrap", "unwrap_or", "unwrap_or_else", "unwrap_error", "unwrap_error_or", "unwrap_error_or_else"]

  // expose the inner type's methods on the Subject type
  for (const method of delegable_methods) {
    Subject.prototype[method] = function(...args) {
      return this["inner"][method](...args)
    }
  }

  // add standalone functions to the type constructors
  for (const constructor of [Outcome, Just, Nothing, Failure, Maybe, Result]) {
    // isa has a slightly different signature
    constructor["isa"] = () => instance => instance.isa(constructor)
    for (const method of delegable_methods) {
      constructor[method] = (...params) => instance => instance[method](...params)
    }
  }

  return {
    Outcome,
    Maybe,
    Result,
    Just,
    Nothing,
    Failure,
    Subject,
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

export { constructors, curry, inspect_type, pipe }
