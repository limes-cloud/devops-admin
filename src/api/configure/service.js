import request from '@/utils/request'

export function getServices(params) {
  return request({
    url: 'cms/service/page',
    method: 'get',
    params
  })
}

export function allServices(params) {
  return request({
    url: 'cms/service/all',
    method: 'get',
    params
  })
}

export function addService(data) {
  return request({
    url: 'cms/service/info',
    method: 'post',
    data
  })
}

export function updateService(data) {
  return request({
    url: 'cms/service/info',
    method: 'put',
    data
  })
}

export function deleteService(data) {
  return request({
    url: 'cms/service/info',
    method: 'delete',
    data
  })
}
