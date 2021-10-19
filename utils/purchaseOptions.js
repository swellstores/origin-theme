export const getInitialSelection = (purchaseOptions) => {
  if (!purchaseOptions) return undefined
  const { subscription, standard } = purchaseOptions
  let selected
  if (standard) {
    selected = {
      type: 'standard',
    }
  }
  if (subscription && subscription.plans.length) {
    selected = {
      type: 'subscription',
      plan: subscription.plans[0].id,
    }
  }
  return selected
}
