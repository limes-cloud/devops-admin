import { login, logout, getInfo } from '@/api/system/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'
import { timeUnix } from '@/utils/index'
var state = {
  tokenInfo: getToken(),
  userInfo: {}
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.tokenInfo = token
  },

  SET_USER: (state, userInfo) => {
    state.userInfo = userInfo
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { phone, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ phone: phone.trim(), password: password }).then(data => {
        const time = timeUnix()
        data.duration = time + data.duration
        commit('SET_TOKEN', data)
        setToken(data)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo().then(data => {
        if (!data) {
          reject('Verification failed, please Login again.')
        }
        commit('SET_USER', data)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      commit('SET_TOKEN', {})
      commit('SET_USER', {})
      removeToken()
      resetRouter()
      dispatch('tagsView/delAllViews', null, { root: true })
      resolve()
    })
  },
  refreshToken({ commit }, data) {
    return new Promise((resolve) => {
      commit('SET_TOKEN', data)
      setToken(data)
      resolve()
    })
  },
  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', {})
      removeToken()
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
