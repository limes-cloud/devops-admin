import request from '@/utils/request'

export function getDockerfiles(params) {
  return request({
    url: 'service/dockerfile/page',
    method: 'get',
    params
  })
}

export function getDockerfileFilter(params) {
  return request({
    url: 'service/dockerfile/filter',
    method: 'get',
    params
  })
}

export function addDockerfile(data) {
  return request({
    url: 'service/dockerfile',
    method: 'post',
    data
  })
}

export function updateDockerfile(data) {
  return request({
    url: 'service/dockerfile',
    method: 'put',
    data
  })
}

export function deleteDockerfile(data) {
  return request({
    url: 'service/dockerfile',
    method: 'delete',
    data
  })
}
