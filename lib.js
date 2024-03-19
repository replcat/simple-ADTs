/** @type {Constructors} */
// @ts-ignore
const ADT = (() => {
  /**
   * @param {string|undefined} stack
   */
  function format_stack(stack) {
    if (typeof stack !== "string") return stack
    const [first, ...rest] = stack.split("\n")
    return [first, ...rest.slice(1)].join("\n")
  }

  /**
   * @param  {*} args
   * @returns {string | undefined}
   */
  function format_notes(...args) {
    args = args.filter(arg => arg != null)
    if (args.length === 0) return
    return args.map(arg =>
      typeof arg === "string"
        ? arg
        : JSON.stringify(arg, null, 1)
          .replace(/\s+/g, " ") // remove newlines and normalise whitespace
          .replace(/"([^"]+)":/, "$1:") // remove quotes from object keys
    ).join(" ")
  }

  /**
   * @param {*} condition
   * @param {string} message
   * @return {asserts condition}
   */
  function constraint(condition, message) {
    if (!condition) {
      const error = new TypeError(`Constraint was violated: ${message}`)
      error.stack = format_stack(error.stack)
      throw error
    }
  }

  /** @type {PropertyDescriptorMap} */
  const common_properties = {
    isa: {
      /** @type {ADT["isa"]} */
      value: function(constructor) {
        constraint(typeof constructor === "function", `isa expects a constructor (got ${constructor})`)
        return this instanceof constructor
      },
    },
    map: {
      /** @type {ADT["map"]} */
      value: function(fn) {
        constraint(typeof fn === "function", `map expects a function (got ${fn})`)
        return this.value
          ? this.constructor(fn(this.value))
          : this
      },
    },
  }

  function Just(value) {
    constraint(value != null, "Just value should not be null or undefined")
    return Object.create(Just.prototype, {
      value: { value, enumerable: true },
      ...common_properties,
    })
  }

  Just.prototype.constructor = Just

  function Nothing() {
    constraint(arguments.length === 0, "Nothing takes no arguments")
    return Object.create(Nothing.prototype, {
      ...common_properties,
    })
  }

  Nothing.prototype.constructor = Nothing

  function Failure(first_argument, ...notes) {
    let instance = first_argument instanceof Error
      ? first_argument
      : new Error(format_notes(first_argument, ...notes))
    instance.name = "Failure"
    instance.stack = format_stack(instance.stack)
    Object.setPrototypeOf(instance, Failure.prototype)
    return instance
  }

  Failure.prototype.constructor = Failure
  Failure.prototype = Object.create(Error.prototype)
  Object.defineProperties(Failure.prototype, {
    constructor: { value: Failure },
    ...common_properties,
  })

  return {
    Just,
    Nothing,
    Failure,
  }
})()

export { ADT }
