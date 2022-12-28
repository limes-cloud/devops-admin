import request from '@/utils/request'

export function getNetworks(params) {
  return request({
    url: 'service/network/page',
    method: 'get',
    params
  })
}

export function addNetwork(data) {
  return request({
    url: 'service/network',
    method: 'post',
    data
  })
}

export function updateNetwork(data) {
  return request({
    url: 'service/network',
    method: 'put',
    data
  })
}

export function deleteNetwork(data) {
  return request({
    url: 'service/network',
    method: 'delete',
    data
  })
}
