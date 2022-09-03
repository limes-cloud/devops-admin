import request from '@/utils/request'

export function GetLog(params) {
  return request({
    url: '/notice/log/page',
    method: 'get',
    params
  })
}
