// Helper to compose array of active filters/options
// Takes array of filters and filter state object
export function listActiveFilters(filters, filterState) {
  // TODO validate params
  // TODO support passing filterState as object ({ id: value }) or array ([{ id, value }])
  return filters.reduce((activeFilters, filter) => {
    const stateValue = filterState[filter.id]

    // Bail if the filter isn't active
    if (!stateValue) return activeFilters

    let options = filter.options

    switch (filter.type) {
      case 'select':
        options = options.reduce((activeOptions, option) => {
          if (stateValue.includes(option.value)) {
            activeOptions.push(option)
          }
          return activeOptions
        }, [])
        break
      case 'range':
        options = [
          { value: stateValue[0], label: stateValue[0] },
          { value: stateValue[1], label: stateValue[1] },
        ]
        break
      default:
    }

    activeFilters.push({
      ...filter,
      options,
    })

    return activeFilters
  }, [])
}
