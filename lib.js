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
    return this instanceof constructor
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
    throw new TypeError(`Unwrapped an empty ${this["name"]}`)
  }

  Outcome.prototype.unwrap_or = function(value) {
    assert(value != null, `unwrap_or expects a value (got ${inspect_type(value)})`)
    if ("value" in this && this instanceof Just) return this.value
    return value
  }

  Outcome.prototype.unwrap_or_else = function(fn) {
    assert(typeof fn === "function", `unwrap_or_else expects a function (got ${inspect_type(fn)})`)
    if ("value" in this && this instanceof Just) return this.value
    return fn()
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

  const delegate_to_instance = method => (...params) => instance =>
    method in instance
      ? instance[method](...params)
      : instance

  for (const type of [Outcome, Just, Nothing, Failure, Maybe, Result]) {
    type["isa"] = () => instance => instance.isa(type)
    type["join"] = delegate_to_instance("join")
    type["flatten"] = delegate_to_instance("flatten")
    type["ap"] = delegate_to_instance("ap")
    type["chain"] = delegate_to_instance("chain")
    type["map"] = delegate_to_instance("map")
    type["traverse"] = delegate_to_instance("traverse")
    type["fold"] = delegate_to_instance("fold")
    type["match"] = delegate_to_instance("match")
  }

  function Subject(value) {
    if (!(this instanceof Subject)) return new Subject(value)
    this.name = "Subject"
    this.subscribers = []
    this.value = value
    this.is_completed = false
  }

  Subject.prototype = Object.create(Outcome.prototype)
  Subject.prototype.constructor = Subject

  Subject.prototype.subscribe = function(subscriber) {
    assert(typeof subscriber === "object", `subscribe expects an object (got ${inspect_type(subscriber)})`)
    assert(subscriber.next || subscriber.complete, `expected at least one of next or complete`)
    if (subscriber.next) assert(typeof subscriber.next === "function", `subscriber.next must be a function (got ${inspect_type(subscriber.next)})`)
    if (subscriber.complete) assert(typeof subscriber.complete === "function", `subscriber.complete must be a function (got ${inspect_type(subscriber.complete)})`)
    if (!this.is_completed) {
      this.subscribers?.push(subscriber)
      if (this.value !== undefined && "next" in subscriber) {
        subscriber.next(this.value)
      }
    } else if ("complete" in subscriber) {
      subscriber.complete()
    }
  }

  Subject.prototype.next = function(value) {
    assert(value != null, `next expects a value (got ${value})`)
    if (!this.is_completed) {
      this.value = value
      this.subscribers
        ?.filter(subscriber => subscriber.next)
        .forEach(subscriber => subscriber.next(value))
    }
  }

  Subject.prototype.complete = function() {
    if (!this.is_completed) {
      this.is_completed = true
      this.subscribers
        ?.filter(subscriber => subscriber.complete)
        .forEach(subscriber => subscriber.complete())
      this.subscribers = []
    }
  }

  Subject.prototype.map = function(fn) {
    const new_subject = Subject()
    this.subscribe({
      next: value => new_subject.next(fn(value)),
      complete: () => new_subject.complete(),
    })
    return new_subject
  }

  Subject.prototype.filter = function(predicate) {
    const new_subject = Subject()
    this.subscribe({
      next: value => {
        if (predicate(value)) {
          new_subject.next(value)
        }
      },
      complete: () => new_subject.complete(),
    })
    return new_subject
  }

  Subject.prototype.merge = function(other) {
    const new_subject = Subject()
    this.subscribe({
      next: value => new_subject.next(value),
      complete: () => new_subject.complete(),
    })
    other.subscribe({
      next: value => new_subject.next(value),
      complete: () => new_subject.complete(),
    })
    return new_subject
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
