import request from '@/utils/request'

export function getImageRegistries(params) {
  return request({
    url: 'service/image_registries',
    method: 'get',
    params
  })
}

export function getImageRegistryFilter(params) {
  return request({
    url: 'service/image_registry/filter',
    method: 'get',
    params
  })
}

export function getImageRegistryTypes(params) {
  return request({
    url: 'service/image_registry/types',
    method: 'get',
    params
  })
}

export function addImageRegistry(data) {
  return request({
    url: 'service/image_registry',
    method: 'post',
    data
  })
}

export function updateImageRegistry(data) {
  return request({
    url: 'service/image_registry',
    method: 'put',
    data
  })
}

export function deleteImageRegistry(data) {
  return request({
    url: 'service/image_registry',
    method: 'delete',
    data
  })
}

export function connectImageRegistry(data) {
  return request({
    url: 'service/image_registry/connect',
    method: 'post',
    data
  })
}

