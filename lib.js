/** @type {Constructors} */
// @ts-ignore
const ADT = (() => {
  /** @type {PropertyDescriptorMap} */
  const common_properties = {
    isa: {
      /** @type {ADT["isa"]} */
      value: function(constructor) {
        return this instanceof constructor
      },
    },
    map: {
      /** @type {ADT["map"]} */
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
      ...common_properties,
    })
  }

  Just.prototype.constructor = Just

  function Nothing() {
    return Object.create(Nothing.prototype, {
      ...common_properties,
    })
  }

  Nothing.prototype.constructor = Nothing

  function Failure(error) {
    let instance = error instanceof Error
      ? error
      : new Error(error ?? "(unspecified)")
    if (instance.stack) {
      const [first, ...rest] = instance.stack.split("\n")
      instance.stack = [first, ...rest.slice(1)].join("\n")
    }
    instance.name = "Failure"
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
