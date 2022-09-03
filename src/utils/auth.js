import Cookies from 'js-cookie'
import { timeUnix } from '@/utils/index'

const TokenKey = 'Admin-Token'

export function getToken() {
  try {
    return JSON.parse(Cookies.get(TokenKey))
  } catch (e) {
    return {}
  }
}

export function setToken(token) {
  return Cookies.set(TokenKey, JSON.stringify(token))
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
