import request from '@/utils/request'

export function getReleases(params) {
  return request({
    url: 'service/release/page',
    method: 'get',
    params
  })
}

export function getReleaseTypes(params) {
  return request({
    url: 'service/release/types',
    method: 'get',
    params
  })
}

export function getReleaseImages(params) {
  return request({
    url: 'service/release/images',
    method: 'get',
    params
  })
}

export function getReleaseStatus(params) {
  return request({
    url: 'service/release/status',
    method: 'get',
    params
  })
}

export function addRelease(data) {
  return request({
    url: 'service/release',
    method: 'post',
    data
  })
}

export function updateRelease(data) {
  return request({
    url: 'service/release',
    method: 'put',
    data
  })
}

export function deleteRelease(data) {
  return request({
    url: 'service/release',
    method: 'delete',
    data
  })
}
