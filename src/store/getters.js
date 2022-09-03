const getters = {
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  errorLogs: state => state.errorLog.logs,
  tokenInfo: state => state.user.tokenInfo,
  userInfo: state => state.user.userInfo,
  permission_routes: state => state.permission.routes,
  directive: state => state.permission.directive
}
export default getters
