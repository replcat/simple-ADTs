/** @type {Constructors} */
// @ts-ignore
const ADT = (() => {
  // Note that the type safety in this block is deliberately pretty weak!

  /**
   * @param {string|undefined} stack
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

  /** @type {PropertyDescriptorMap} */
  const common_properties = {
    isa: {
      /** @type {Atom["isa"]} */
      value: function(constructor) {
        // @ts-ignore
        if (constructor.name === "Atom") return this.name === "Just" || this.name === "Nothing" || this.name === "Failure"
        // @ts-ignore
        if (constructor.name === "Maybe") return this.name === "Just" || this.name === "Nothing"
        // @ts-ignore
        if (constructor.name === "Result") return this.name === "Just" || this.name === "Failure"

        return this instanceof constructor
      },
    },

    map: {
      /** @type {Atom["map"]} */
      value: function(fn) {
        constraint(typeof fn === "function", `map expects a function (got ${fn})`)
        return this.value
          ? this.constructor(fn(this.value))
          : this
      },
    },

    match: {
      value: function(matcher) {
        if (matcher.Just && this["isa"](Just)) return matcher.Just(this.value)
        if (matcher.Nothing && this["isa"](Nothing)) return matcher.Nothing()
        if (matcher.Failure && this["isa"](Failure)) return matcher.Failure(this["error"])
        throw new TypeError(`No match for ${this["name"] ?? "unknown type"}`)
      },
    },
  }

  /**
   * @template T
   * @param {T|Error} [value_or_error]
   * @returns {globalThis.Atom<NonNullable<T>>}
   */
  function Atom(value_or_error) {
    if (value_or_error == null) return Nothing()
    if (value_or_error instanceof Error) return Failure(value_or_error)
    return Just(value_or_error)
  }

  /**
   * @template T
   * @parame {T} [value]
   * @returns {globalThis.Maybe<NonNullable<T>>}
   */
  function Maybe(value) {
    return value == null ? Nothing() : Just(value)
  }

  /**
   * @template T
   * @param {T|Error} value_or_error
   * @returns {globalThis.Result<NonNullable<T>>}
   */
  function Result(value_or_error) {
    if (value_or_error == null) return Failure("Result value was null or undefined")
    if (value_or_error instanceof Error) return Failure(value_or_error)
    return Just(value_or_error)
  }

  /**
   * @template T
   * @param {NonNullable<T>} value
   * @returns {globalThis.Just<NonNullable<T>>}
   */
  function Just(value) {
    constraint(value != null, "Just value should not be null or undefined")
    return Object.create(Just.prototype, {
      name: { value: "Just" },
      value: { value, enumerable: true },
      ...common_properties,
    })
  }

  /**
   * @returns {globalThis.Nothing}
   */
  function Nothing() {
    return Object.create(Nothing.prototype, {
      name: { value: "Nothing", enumerable: false },
      ...common_properties,
    })
  }

  /**
   * @param {string | Error} error
   * @param {unknown} [cause]
   * @returns {globalThis.Failure}
   */
  function Failure(error, cause) {
    if (!(error instanceof Error)) {
      error = new Error(error ?? "(unspecified)")
      error.stack = trim_stack(error.stack)
    }
    if (cause) error.cause = cause
    return Object.create(Failure.prototype, {
      name: { value: "Failure" },
      error: { value: error, enumerable: true },
      message: { get: () => error.message, enumerable: true },
      ...common_properties,
    })
  }

  return {
    Atom,
    Maybe,
    Result,
    Just,
    Nothing,
    Failure,
  }
})()

export { ADT }
