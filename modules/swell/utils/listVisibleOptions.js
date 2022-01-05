import get from 'lodash/get'

// Takes options array and optionState object
// Returns filtered array of options based on state values
export function listVisibleOptions(options, optionState) {
  return options.filter((option) =>
    shouldDisplayOption(option, options, optionState)
  )
}

function shouldDisplayOption(option, options, optionState) {
  // If option doesn't have a parent, it's always visible
  if (!option.parentId) return true

  // Find parent option
  const parentOption = options.find(({ id }) => id === option.parentId) || {}

  // Validate that parent is also visible
  if (!shouldDisplayOption(parentOption, options, optionState)) return false

  // Match parent with option state to determine visibility
  const parentType = get(parentOption, 'inputType')
  const value =
    get(optionState, parentOption.id) || get(optionState, parentOption.name)

  switch (parentType) {
    // If this option has a parent toggle option and the current value is true or matches that parent option's name/ID, it should be visible
    case 'toggle':
      if (matchByToggleValue(parentOption, value)) return true
      break
    // If this option has a parent select option and the current value matches the parent value, it should be visible
    case 'select':
      if (matchBySelectValueId(option, value)) return true
      if (matchBySelectValueName(option, parentOption, value)) return true
      break
  }

  return false
}

// Check if option state value is true, or matches the name/ID of the option
function matchByToggleValue(option, stateValue) {
  return (
    stateValue === true ||
    stateValue === option.name ||
    stateValue === option.id
  )
}

// Check if option state value is included in the list of parentValueIds (if using option value ID for state)
function matchBySelectValueId(option, stateValue) {
  return (
    Array.isArray(option.parentValueIds) &&
    option.parentValueIds.includes(stateValue)
  )
}

// Check if option state value matches name of a parent option value whose ID is included in the list of
// parent value IDs (if using option value name for state)
function matchBySelectValueName(option, parentOption, stateValue) {
  return (
    Array.isArray(option.parentValueIds) &&
    option.parentValueIds
      .map((id) => {
        const parentOptionValue = parentOption.values.find(
          (value) => value.id === id
        )
        return get(parentOptionValue, 'name')
      })
      .includes(stateValue)
  )
}
