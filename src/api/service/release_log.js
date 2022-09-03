import request from '@/utils/request'

export function getReleaseLog(params) {
  return request({
    url: 'service/release_log/page',
    method: 'get',
    params
  })
}

export function addReleaseLog(data) {
  return request({
    url: 'service/release_log',
    method: 'post',
    data
  })
}

