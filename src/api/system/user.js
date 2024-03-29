import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/ums/user/login',
    method: 'post',
    data
  })
}

export function refreshToken(data) {
  return request({
    url: '/ums/token/refresh',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/ums/user',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/ums/user/logout',
    method: 'post'
  })
}

export function getUsers(params) {
  return request({
    url: '/ums/user/page',
    method: 'get',
    params
  })
}

export function addUser(data) {
  return request({
    url: '/ums/user',
    method: 'post',
    data
  })
}

export function updateUser(data) {
  return request({
    url: '/ums/user',
    method: 'put',
    data
  })
}

export function changeUserPwd(data) {
  return request({
    url: '/ums/user/changepwd',
    method: 'post',
    data
  })
}

export function deleteUser(data) {
  return request({
    url: '/ums/user',
    method: 'delete',
    data
  })
}
