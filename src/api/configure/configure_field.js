import request from '@/utils/request'

export function pageConfigureField(params) {
  return request({
    url: 'cms/configure_field/page',
    method: 'get',
    params
  })
}

export function addConfigureField(data) {
  return request({
    url: 'cms/configure_field/info',
    method: 'post',
    data
  })
}

export function updateConfigureField(data) {
  return request({
    url: 'cms/configure_field/info',
    method: 'put',
    data
  })
}

export function deleteConfigureField(data) {
  return request({
    url: 'cms/configure_field/info',
    method: 'delete',
    data
  })
}
