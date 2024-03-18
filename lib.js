/** @type {Constructors} */
// @ts-ignore
const ADT = (() => {
  /** @type {PropertyDescriptorMap} */
  const base = {
    isa: {
      value: function(constructor) {
        return this instanceof constructor
      },
    },
    map: {
      value: function(fn) {
        return this.value
          ? this.constructor(fn(this.value))
          : this
      },
    },
  }

  function Just(value) {
    return Object.create(Just.prototype, {
      value: { value, enumerable: true },
      of: { value: Just },
      ...base,
    })
  }

  Just.prototype.constructor = Just

  function Nothing() {
    return Object.create(Nothing.prototype, {
      of: { value: Nothing },
      ...base,
    })
  }

  Nothing.prototype.constructor = Nothing

  function Failure(error) {
    /** @type {Error} */
    let instance
    if (error instanceof Error) {
      instance = error
    } else {
      instance = new Error(error ?? "(unspecified)")
      if (instance.stack) {
        const [first, ...rest] = instance.stack.split("\n")
        instance.stack = [first, ...rest.slice(1)].join("\n")
      }
    }
    instance.name = "Failure"
    Object.setPrototypeOf(instance, Failure.prototype)
    return instance
  }

  Failure.prototype.constructor = Failure
  Failure.prototype = Object.create(Error.prototype)
  Object.defineProperties(Failure.prototype, {
    constructor: { value: Failure },
    of: { value: Failure },
    ...base,
  })

  return {
    Just,
    Nothing,
    Failure,
  }
})()

export { ADT }
