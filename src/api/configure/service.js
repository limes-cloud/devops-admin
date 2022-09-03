import request from '@/utils/request'

export function getServiceFields(params) {
  return request({
    url: 'configure/service/fields',
    method: 'get',
    params
  })
}
