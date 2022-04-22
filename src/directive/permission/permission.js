import store from '@/store'

function checkPermission(el, binding) {
  const { value } = binding
  const permission = store.getters && store.getters.directive
  if (store.getters.role_id === 1) {
    return
  }
  if (value) {
    const permissionRoles = value
    const hasPermission = permission.includes(permissionRoles)
    if (!hasPermission) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  } else {
    throw new Error(`need permission! Like v-permission="'admin'"`)
  }
}

export default {
  inserted(el, binding) {
    checkPermission(el, binding)
  },
  update(el, binding) {
    checkPermission(el, binding)
  }
}
