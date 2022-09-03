import request from '@/utils/request'

export function pageResource(params) {
  return request({
    url: 'configure/resource/page',
    method: 'get',
    params
  })
}

export function addResource(data) {
  return request({
    url: 'configure/resource',
    method: 'post',
    data
  })
}

export function updateResource(data) {
  return request({
    url: 'configure/resource',
    method: 'put',
    data
  })
}

export function deleteResource(data) {
  return request({
    url: 'configure/resource',
    method: 'delete',
    data
  })
}

export function getResourceValue(params) {
  return request({
    url: 'configure/resource/value',
    method: 'get',
    params
  })
}

export function updateResourceValue(data) {
  return request({
    url: 'configure/resource/value',
    method: 'post',
    data
  })
}

export function getResourceService(params) {
  return request({
    url: 'configure/resource/service',
    method: 'get',
    params
  })
}

export function addResourceService(data) {
  return request({
    url: 'configure/resource/service',
    method: 'post',
    data
  })
}
