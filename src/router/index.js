import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  // {
  //   path: '/',
  //   component: Layout,
  //   redirect: '/home',
  //   children: [
  //     {
  //       path: 'home',
  //       component: () => import('@/views/home/index'),
  //       name: 'Home',
  //       meta: { title: '首页', icon: 'dashboard', affix: true }
  //     }
  //   ]
  // },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  }
]

export const asyncRoutes = [
  // {
  //   path: '/system',
  //   component: Layout,
  //   name: 'System',
  //   meta: { title: '用户中心', icon: 'el-icon-s-help' },
  //   children: [
  //     {
  //       path: 'role',
  //       name: 'Role',
  //       component: () => import('@/views/system/role/index'),
  //       meta: { title: '角色管理', icon: 'table' }
  //     }, {
  //       path: 'menu',
  //       name: 'Menu',
  //       component: () => import('@/views/system/menu/index'),
  //       meta: { title: '菜单管理', icon: 'tree' }
  //     },
  //     {
  //       path: 'user',
  //       name: 'User',
  //       component: () => import('@/views/system/user/index'),
  //       meta: { title: '人员管理', icon: 'table' }
  //     },
  //     {
  //       path: 'team',
  //       name: 'Team',
  //       component: () => import('@/views/system/team/index'),
  //       meta: { title: '部门管理', icon: 'el-icon-menu' }
  //     }
  //   ]
  // }
]

export const endRouter = [
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
