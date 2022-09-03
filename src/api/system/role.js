import request from '@/utils/request'

export function dataScope(params) {
  return request({
    url: '/ums/role/data_scope',
    method: 'get',
    params
  })
}

export function getRoles(params) {
  return request({
    url: '/ums/role',
    method: 'get',
    params
  })
}

export function addRole(data) {
  return request({
    url: '/ums/role',
    method: 'post',
    data
  })
}

export function updateRole(data) {
  return request({
    url: '/ums/role',
    method: 'put',
    data
  })
}

export function deleteRole(data) {
  return request({
    url: '/ums/role',
    method: 'delete',
    data
  })
}

export function addRoleMenu(data) {
  return request({
    url: '/ums/role/menu',
    method: 'post',
    data
  })
}

export function getRoleMenuIds(params) {
  return request({
    url: '/ums/role/menu_ids',
    method: 'get',
    params
  })
}

export function getRoleMenu(params) {
  return request({
    url: '/ums/role/menu',
    method: 'get',
    params
  })
}
