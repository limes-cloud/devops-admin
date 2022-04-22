import request from '@/utils/request'

export function getEnvs(params) {
  return request({
    url: 'cms/environment/list',
    method: 'get',
    params
  })
}

export function addEnv(data) {
  return request({
    url: 'cms/environment/info',
    method: 'post',
    data
  })
}

export function updateEnv(data) {
  return request({
    url: 'cms/environment/info',
    method: 'put',
    data
  })
}

export function deleteEnv(data) {
  return request({
    url: 'cms/environment/info',
    method: 'delete',
    data
  })
}
