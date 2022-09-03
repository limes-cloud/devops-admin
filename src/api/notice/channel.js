import request from '@/utils/request'

export function GetChannels(params) {
  return request({
    url: '/notice/channels',
    method: 'get',
    params
  })
}

export function GetChannelFilter(params) {
  return request({
    url: '/notice/channel/filter',
    method: 'get',
    params
  })
}

export function AddChannel(data) {
  return request({
    url: '/notice/channel',
    method: 'post',
    data
  })
}

export function UpdateChannel(data) {
  return request({
    url: '/notice/channel',
    method: 'put',
    data
  })
}

export function DeleteChannel(data) {
  return request({
    url: '/notice/channel',
    method: 'delete',
    data
  })
}
