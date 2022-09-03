import request from '@/utils/request'

export function getCodeRegistries(params) {
  return request({
    url: 'service/code_registries',
    method: 'get',
    params
  })
}

export function getProject(params) {
  return request({
    url: 'service/code_registry/project',
    method: 'get',
    params
  })
}

export function getProjectBranches(params) {
  return request({
    url: 'service/code_registry/branches',
    method: 'get',
    params
  })
}

export function getProjectTags(params) {
  return request({
    url: 'service/code_registry/tags',
    method: 'get',
    params
  })
}

export function getCodeRegistryFilter(params) {
  return request({
    url: 'service/code_registry/filter',
    method: 'get',
    params
  })
}

export function getCodeRegistryTypes(params) {
  return request({
    url: 'service/code_registry/types',
    method: 'get',
    params
  })
}

export function getCodeRegistryCloneTypes(params) {
  return request({
    url: 'service/code_registry/clone_types',
    method: 'get',
    params
  })
}

export function addCodeRegistry(data) {
  return request({
    url: 'service/code_registry',
    method: 'post',
    data
  })
}

export function updateCodeRegistry(data) {
  return request({
    url: 'service/code_registry',
    method: 'put',
    data
  })
}

export function deleteCodeRegistry(data) {
  return request({
    url: 'service/code_registry',
    method: 'delete',
    data
  })
}

export function connectCodeRegistry(data) {
  return request({
    url: 'service/code_registry/connect',
    method: 'post',
    data
  })
}
