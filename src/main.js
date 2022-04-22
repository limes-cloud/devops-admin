import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import Element from 'element-ui'
import './styles/element-variables.scss'
// import enLang from 'element-ui/lib/locale/lang/en'// 如果使用中文语言包请默认支持，无需额外引入，请删除该依赖

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import './icons' // icon
import './permission' // permission control
import './utils/error-log' // error log

import * as filters from './filters' // global filters

import permission from '@/directive/permission/index.js' // 权限判断指令
Vue.use(permission)
Vue.prototype.cosUrl = '' // 这里是你的cos的地址

Vue.use(Element, {
  size: Cookies.get('size') || 'medium' // set element-ui default size
  // locale: enLang // 如果使用中文，无需设置，请删除
})

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.prototype.deepClone = function(val) {
  return JSON.parse(JSON.stringify(val))
}

Vue.prototype.parseTime = filters.parseTime

Vue.prototype.getTreeNode = (element, id) => { // 根据id查找节点
  if (element.id == id) {
    return element
  }
  if (element.children != null) {
    var i
    var result = null
    for (i = 0; result == null && i < element.children.length; i++) {
      result = Vue.prototype.getTreeNode(element.children[i], id)
    }
    return result
  }
  return null
}

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
