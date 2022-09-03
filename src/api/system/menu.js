import request from '@/utils/request'

export function getMenus(params) {
  return request({
    url: '/ums/menu',
    method: 'get',
    params
  })
}

export function addMenu(data) {
  return request({
    url: '/ums/menu',
    method: 'post',
    data
  })
}

export function updateMenu(data) {
  return request({
    url: '/ums/menu',
    method: 'put',
    data
  })
}

export function deleteMenu(data) {
  return request({
    url: '/ums/menu',
    method: 'delete',
    data
  })
}
