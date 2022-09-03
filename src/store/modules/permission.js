import { asyncRoutes, constantRoutes, endRouter } from '@/router'
import { getRoleMenu } from '@/api/system/role.js'
import Layout from '@/layout'

/**
  * 后台查询的菜单数据拼装成路由格式的数据
  * @param routes
  */
export function generaMenu(routes, data, permission) {
  data.forEach(item => {
    const menu = {
      path: item.path,
      component: item.component === 'Layout' ? Layout : loadView(item.component),
      hidden: item.hidden,
      children: [],
      redirect: item.redirect,
      name: item.name,
      meta: {
        title: item.title,
        icon: 'el-icon-' + item.icon,
        noCache: true,
        keepAlive: false
      }
    }

    if (item.children) {
      generaMenu(menu.children, item.children, permission)
    }
    if (item.type === 'M') {
      routes.push(menu)
    }
    if (item.permission) {
      permission.push(item.permission)
    }
  })
}

export const loadView = (view) => { // 路由懒加载
  return (resolve) => require(['@/views/' + view], resolve)
}

const state = {
  routes: [],
  directive: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = routes
  },
  SET_DIRECTIVE: (state, p) => {
    state.directive = p
  }
}

const actions = {
  generateRoutes({ commit }) {
    const router = []
    const permission = []
    return new Promise(resolve => {
      getRoleMenu().then(menus => {
        generaMenu(router, menus.children, permission)
        const menu = asyncRoutes.concat(constantRoutes).concat(router).concat(endRouter)
        commit('SET_ROUTES', menu)
        commit('SET_DIRECTIVE', permission)
        resolve(menu)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
