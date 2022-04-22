const getters = {
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  errorLogs: state => state.errorLog.logs,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  email: state => state.user.email,
  phone: state => state.user.phone,
  role_id: state => state.user.role_id,
  role_name: state => state.user.role_name,
  team_name: state => state.user.team_name,
  keyword: state => state.user.keyword,
  permission_routes: state => state.permission.routes,
  directive: state => state.permission.directive
  // name: state => state.user.name,
  // introduction: state => state.user.introduction,
  // roles: state => state.user.roles,
}
export default getters
