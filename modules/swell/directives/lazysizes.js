export default {
  bind(el, binding, vnode) {
    if (vnode.tag !== 'img') {
      throw new Error(`${vnode.tag} is wrong element, use img element instead`)
    }

    el.classList.add('lazyload')
  },
  update(el, binding, vnode, oldVnode) {
    const {
      data: {
        attrs: { 'data-src': src }
      }
    } = vnode
    const {
      data: {
        attrs: { 'data-src': oldSrc }
      }
    } = oldVnode

    if (src === oldSrc) {
      return
    }

    el.classList.remove('lazyloaded')
    el.classList.add('lazyload')
  }
}
