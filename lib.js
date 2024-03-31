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
    if (value instanceof Error) return Failure(value)
    if (value instanceof Failure) return value
    return Just(value)
  }

  Outcome.prototype = Object.create(Object.prototype)
  Outcome.prototype.constructor = function() {
    throw new TypeError(`${Outcome.name} cannot be directly constructed`)
  }

  // if you apply the function type to this the compiler dies :3
  Outcome.prototype.isa = function(constructor) {
    assert(typeof constructor === "function", `expected a constructor (got ${constructor})`)
    if (constructor.name === "Outcome") return this["name"] === "Just" || this["name"] === "Nothing" || this["name"] === "Failure"
    if (constructor.name === "Maybe") return this["name"] === "Just" || this["name"] === "Nothing"
    if (constructor.name === "Result") return this["name"] === "Just" || this["name"] === "Failure"
    if (constructor.name === "Just") return this["name"] === "Just"
    if (constructor.name === "Nothing") return this["name"] === "Nothing"
    if (constructor.name === "Failure") return this["name"] === "Failure"
    throw new TypeError(`isa: No match for type of ${inspect_type(constructor)}`)
  }

  /** @this {globalThis.Outcome} */
  Outcome.prototype.map = function(fn) {
    assert(typeof fn === "function", `map expects a function (got ${fn})`)
    return "value" in this
      ? this.constructor(fn(this.value))
      : this
  }

  /**  @this {globalThis.Outcome} */
  Outcome.prototype.ap = function(wrapped_fn) {
    assert(wrapped_fn instanceof Outcome, `expected a wrapped type (got ${inspect_type(wrapped_fn)})`)
    if (!("value" in wrapped_fn)) return wrapped_fn
    assert(typeof wrapped_fn.value === "function", `ap expects a function (got ${inspect_type(wrapped_fn.value)})`)
    return ("value" in this)
      ? this.constructor(wrapped_fn.value(this.value))
      : this
  }

  Outcome.prototype.join = function() {
    return this instanceof Just && this["value"] instanceof Just ? this["value"] : this
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
      : fn(this["value"]).map(this.constructor)
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
    return "error" in this
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
    if ("value" in this && this instanceof Just) return this.value
    if ("error" in this && this instanceof Failure) throw this.error
    throw new TypeError(`Tried to unwrap an empty ${this["name"]}`)
  }

  Outcome.prototype.unwrap_or = function(fallback) {
    assert(fallback != null, `unwrap_or expects a value (got ${inspect_type(fallback)})`)
    if ("value" in this && this instanceof Just) return this.value
    return fallback
  }

  Outcome.prototype.unwrap_or_else = function(fallback_fn) {
    assert(typeof fallback_fn === "function", `unwrap_or_else expects a function (got ${inspect_type(fallback_fn)})`)
    if ("value" in this && this instanceof Just) return this.value
    return fallback_fn()
  }

  Outcome.prototype.unwrap_error = function() {
    if ("error" in this && this instanceof Failure) return this.error
    throw new TypeError(`Tried to unwrap_error an a ${this["name"]}`)
  }

  Outcome.prototype.unwrap_error_or = function(fallback) {
    assert(fallback != null, `unwrap_error_or expects a value (got ${inspect_type(fallback)})`)
    if ("error" in this && this instanceof Failure) return this.error
    return fallback
  }

  Outcome.prototype.unwrap_error_or_else = function(fallback_fn) {
    assert(typeof fallback_fn === "function", `unwrap_error_or_else expects a function (got ${inspect_type(fallback_fn)})`)
    if ("error" in this && this instanceof Failure) return this.error
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
    assert(value != null && !(value instanceof Error), `Just expects a value (got ${inspect_type(value)})`)
    return Object.create(Just.prototype, {
      name: { value: "Just" },
      value: { value, enumerable: true },
    })
  }

  Just.prototype = Object.create(Outcome.prototype)
  Just.prototype.constructor = Just

  function Nothing() {
    return Object.create(Nothing.prototype, {
      name: { value: "Nothing" },
    })
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
      name: { value: "Failure" },
      error: { value: error, enumerable: true },
      message: { get: () => error.message, enumerable: true },
    })
  }

  Failure.prototype = Object.create(Outcome.prototype)
  Failure.prototype.constructor = Failure

  function Subject(init = Nothing()) {
    let inner

    const instance = Object.create(Subject.prototype, {
      [Symbol.toStringTag]: {
        get: () => instance.completed ? "∅" : String(instance.subscribers.length),
      },

      inner: { value: init, configurable: true },
      value: { enumerable: false, configurable: true },
      error: { enumerable: false, configurable: true },

      completed: { value: false, configurable: true },
      complete: {
        configurable: true,
        value: () => {
          for (const subscriber of instance.subscribers) {
            if (subscriber.complete) subscriber.complete()
          }
          Object.defineProperties(instance, {
            subscribers: { value: [] },
            completed: { value: true },
            complete: { value: () => {} },
          })
        },
      },

      subscribers: { value: [], configurable: true },
      subscribe: {
        value: subscriber => {
          assert(typeof subscriber === "object", `subscribe expects an object (got ${inspect_type(subscriber)})`)
          assert(subscriber.next || subscriber.complete, `subscribe expects at least one handler`)
          assert(!subscriber.next || typeof subscriber.next === "function", `subscribe expects next handler to be a function (got ${inspect_type(subscriber.next)})`)
          assert(!subscriber.complete || typeof subscriber.complete === "function", `subscribe expects complete handler to be a function (got ${inspect_type(subscriber.complete)})`)
          instance.subscribers.push(subscriber)
        },
      },

      next: {
        value: next => {
          inner = next instanceof Outcome ? next : Outcome(next)
          Object.defineProperties(instance, {
            inner: { value: inner, configurable: true },
            value: { value: "value" in inner ? inner.value : undefined, enumerable: "value" in inner, configurable: true },
            error: { value: "error" in inner ? inner.error : undefined, enumerable: "error" in inner, configurable: true },
          })
          for (const subscriber of instance.subscribers) {
            if (subscriber.next) subscriber.next(inner)
          }
        },
      },
    })

    for (const method of [...delegable_methods, ...unwrap_methods]) {
      Object.defineProperty(instance, method, {
        value: function(...args) {
          return inner[method](...args)
        },
      })
    }

    Object.defineProperty(instance, "derive", {
      value: fn => {
        assert(typeof fn === "function", `compute expects a function (got ${inspect_type(fn)})`)
        const derived_instance = Subject(fn(inner))
        instance.subscribe({
          next: next => derived_instance.next(fn(next)),
          complete: () => derived_instance.complete(),
        })
        return derived_instance
      },
    })

    Object.defineProperty(instance, "merge", {
      value: (...subjects) => {
        const merged = Subject(inner)
        for (const subject of [instance, ...subjects]) {
          subject.subscribe({ next: next => merged.next(next) })
        }
        return merged
      },
    })

    instance.next(init)

    return instance
  }

  Subject.prototype = Object.create(Object.prototype)
  Subject.prototype.constructor = Subject

  const unwrap_methods = ["unwrap", "unwrap_or", "unwrap_or_else", "unwrap_error", "unwrap_error_or", "unwrap_error_or_else"]
  const delegable_methods = ["join", "flatten", "ap", "chain", "map", "traverse", "fold", "match"]

  const delegate_to_instance = method => (...params) => instance =>
    method in instance
      ? instance[method](...params)
      : instance

  for (const type of [Outcome, Just, Nothing, Failure, Maybe, Result]) {
    type["isa"] = () => instance => instance.isa(type)
    for (const method of delegable_methods) {
      type[method] = delegate_to_instance(method)
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
