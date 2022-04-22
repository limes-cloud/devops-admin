import request from '@/utils/request'

export function pageServiceField(params) {
  return request({
    url: 'cms/service_field/page',
    method: 'get',
    params
  })
}

export function addServiceField(data) {
  return request({
    url: 'cms/service_field/info',
    method: 'post',
    data
  })
}

export function updateServiceField(data) {
  return request({
    url: 'cms/service_field/info',
    method: 'put',
    data
  })
}

export function deleteServiceField(data) {
  return request({
    url: 'cms/service_field/info',
    method: 'delete',
    data
  })
}
