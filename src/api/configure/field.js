import request from '@/utils/request'

export function pageField(params) {
  return request({
    url: 'configure/field/page',
    method: 'get',
    params
  })
}

export function addField(data) {
  return request({
    url: 'configure/field',
    method: 'post',
    data
  })
}

export function updateField(data) {
  return request({
    url: 'configure/field',
    method: 'put',
    data
  })
}

export function deleteField(data) {
  return request({
    url: 'configure/field',
    method: 'delete',
    data
  })
}

export function getFieldValue(params) {
  return request({
    url: 'configure/field_value',
    method: 'get',
    params
  })
}

export function updateFieldValue(data) {
  return request({
    url: 'configure/field_value',
    method: 'post',
    data
  })
}
