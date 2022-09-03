import axios from 'axios'
import {
  MessageBox,
  Message
} from 'element-ui'
import store from '@/store'
import { refreshToken } from '@/api/system/user.js'

const baseUrl = 'http://y.cn/'
// create an axios instance
const service = axios.create({
  baseURL: baseUrl,
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 30000
})

// request interceptor
service.interceptors.request.use(
  config => {
    const info = store.getters.tokenInfo
    if (info.token && info.token !== '') {
      config.headers['Authorization'] = info.token
    }
    return config
  },
  error => {
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// 是否正在刷新的标记
var isRefreshing = false
// 重试队列，每一项将是一个待执行的函数形式
var requests = []

// response interceptor
service.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code === 200) {
      return res.data
    }

    // token过期
    if (res.code === 403) {
      const config = response.config
      const info = store.getters.tokenInfo

      if (!isRefreshing) {
        isRefreshing = true
        return refreshToken({ token: info.refresh_token }).then(res => {
          console.log(res)
          store.dispatch('user/refreshToken', res)
          const { token } = res
          config.headers['Authorization'] = token
          config.baseURL = baseUrl
          requests.forEach(cb => cb(token))
          requests = []
          return service(config)
        }).catch(msg => {
          console.log('token refresh error')
        }).finally(() => {
          isRefreshing = false
        })
      } else {
        return new Promise((resolve) => {
          requests.push((token) => {
            config.baseURL = baseUrl
            config.headers['Authorization'] = token
            resolve(service(config))
          })
        })
      }
    }

    // 处理token错误
    if (res.code === 401) {
      store.dispatch('user/resetToken')
      MessageBox.confirm(res.msg, '温馨提示', {
        type: 'warning'
      }).then(() => {
        location.reload()
      })
      return Promise.reject(new Error(res.msg || 'Error'))
    }

    // 通用错误处理
    Message({
      message: res.msg || 'Error',
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(new Error(res.msg || 'Error'))
  },
  error => {
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
