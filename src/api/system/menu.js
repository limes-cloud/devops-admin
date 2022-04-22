import request from '@/utils/request'

export function getMenus(params) {
  return request({
    url: '/ums/menu/list',
    method: 'get',
    params
  })
}

export function addMenu(data) {
  return request({
    url: '/ums/menu/info',
    method: 'post',
    data
  })
}

export function updateMenu(data) {
  return request({
    url: '/ums/menu/info',
    method: 'put',
    data
  })
}

export function deleteMenu(data) {
  return request({
    url: '/ums/menu/info',
    method: 'delete',
    data
  })
}

