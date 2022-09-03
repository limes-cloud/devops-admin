
import request from '@/utils/request'

export function getPackLog(params) {
  return request({
    url: 'service/pack_log/page',
    method: 'get',
    params
  })
}

export function addPack(data) {
  return request({
    url: 'service/pack',
    method: 'post',
    data
  })
}
