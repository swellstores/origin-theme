export default async function({ store, redirect }) {
    if (!store.state.customerLoggedIn) {
      return redirect('/')
    }
}
