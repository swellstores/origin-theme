// Helper to work out what the updated filter state should be
// Takes the current filter state (object), the filter to update, and the value to update
// Returns an updated filter state (object)
export function mergeFilterState(filterState, filter, optionValue) {
  // TODO validate params
  // TODO support passing filterState as object ({ id: value }) or array ([{ id, value }])
  const { id, type, options } = filter

  const state = { ...filterState }

  // If an option value isn't passed, remove the filter from the state
  if (!optionValue) {
    delete state[id]
    return state
  }

  // Work out the correct filter state given the provided option value
  switch (type) {
    case 'select': {
      // Add or remove the option value, retaining the same order as filter options
      const currentValues = Array.isArray(state[id]) ? state[id] : []

      // Build a new array of option values that we want to be retained or added
      const newValues = options.reduce((values, { value }) => {
        if (currentValues.includes(value) && value !== optionValue) {
          // Include if value isn't the one provided and is already in the current list
          values.push(value)
        } else if (!currentValues.includes(value) && value === optionValue) {
          // Include if value matches the one provided and isn't in the current list
          values.push(value)
        }
        // Otherwise ignore it so it's no longer included in the list

        return values
      }, [])

      // Set new state value only if the resulting array has items
      if (newValues.length) {
        state[id] = newValues
      } else {
        delete state[id]
      }

      return state
    }
    case 'range': {
      // Check the provided option value is an array with two values
      if (!Array.isArray(optionValue) || optionValue.length !== 2) {
        throw new Error(
          'The value for a range filter must be a tuple as [min, max]'
        )
      }

      // Set state value as range tuple
      state[id] = optionValue
      return state
    }

    default:
    // Something for booleans? TODO
  }
}
