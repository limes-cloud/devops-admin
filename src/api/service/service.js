import request from '@/utils/request'

export function getVariable(params) {
  return request({
    url: 'service/variable',
    method: 'get',
    params
  })
}

export function getRunTypes(params) {
  return request({
    url: 'service/run_types',
    method: 'get',
    params
  })
}


export function getServices(params) {
  return request({
    url: 'service/service/filter',
    method: 'get',
    params
  })
}

export function getServiceInfos(params) {
  return request({
    url: 'service/service/page',
    method: 'get',
    params
  })
}

export function getServiceEnv(params) {
  return request({
    url: 'service/service/envs',
    method: 'get',
    params
  })
}

export function addService(data) {
  return request({
    url: 'service/service',
    method: 'post',
    data
  })
}

export function updateService(data) {
  return request({
    url: 'service/service',
    method: 'put',
    data
  })
}

export function deleteService(data) {
  return request({
    url: 'service/service',
    method: 'delete',
    data
  })
}
