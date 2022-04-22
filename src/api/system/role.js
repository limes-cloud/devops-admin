import request from '@/utils/request'

export function dataScope() {
  return {
    'TEAMALL': '全部数据权限',
    'TEAMDOWN': '本部门以下权限',
    'CURTEAM': '本部门数据权限',
    'CUSTOM': '自定义数据权限'
  }
}

export function getRoles(params) {
  return request({
    url: '/ums/role/list',
    method: 'get',
    params
  })
}

export function addRole(data) {
  return request({
    url: '/ums/role/info',
    method: 'post',
    data
  })
}

export function updateRole(data) {
  return request({
    url: '/ums/role/info',
    method: 'put',
    data
  })
}

export function deleteRole(data) {
  return request({
    url: '/ums/role/info',
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
    url: '/ums/role/menus',
    method: 'get',
    params
  })
}
