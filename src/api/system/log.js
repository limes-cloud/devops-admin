import request from '@/utils/request'

export function getLogs(params) {
  return request({
    url: '/ums/login/log',
    method: 'get',
    params
  })
}
