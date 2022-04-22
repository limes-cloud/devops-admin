import request from '@/utils/request'

export function getConfigure(params) {
  return request({
    url: 'cms/configure/info',
    method: 'get',
    params
  })
}

export function getParseConfigure(params) {
  return request({
    url: 'cms/configure/parse',
    method: 'get',
    params
  })
}

export function getConfigures(params) {
  return request({
    url: 'cms/configure/list',
    method: 'get',
    params
  })
}

export function addConfigure(data) {
  return request({
    url: 'cms/configure/info',
    method: 'post',
    data
  })
}

export function updateConfigure(data) {
  return request({
    url: 'cms/configure/info',
    method: 'put',
    data
  })
}

export function syncConfigure(data) {
  return request({
    url: 'cms/configure/sync',
    method: 'post',
    data
  })
}

