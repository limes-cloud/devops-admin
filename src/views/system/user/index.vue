<template>
  <div>
    <el-card v-permission="'system:user:page'" class="box-card">
      <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
        <el-form-item label="人员名称" prop="name">
          <el-input v-model="queryParams.name" placeholder="请输入人员名称" clearable size="small" @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="电话号码" prop="phone">
          <el-input v-model="queryParams.phone" placeholder="请输入电话号码" clearable size="small" @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="用户邮箱" prop="email">
          <el-input v-model="queryParams.email" placeholder="请输入用户邮箱" clearable size="small" @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="用户状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择" size="small">
            <el-option label="正常" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
        </el-form-item>

        <el-form-item v-permission="'system:user:add'">
          <el-button type="primary" icon="el-icon-plus" size="small" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="List">
        <el-table-column label="姓名" width="100" align="center" prop="name" />
        <el-table-column label="电话" align="center" prop="phone" :show-overflow-tooltip="true" />
        <el-table-column label="邮箱" align="center" prop="email" :show-overflow-tooltip="true" />
        <el-table-column label="部门" align="center" prop="role.name" :show-overflow-tooltip="true" />
        <el-table-column label="角色" align="center" prop="team.name" :show-overflow-tooltip="true" />
        <el-table-column label="状态" align="center" width="200px">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.status" :disabled="scope.row.id===1" active-text="正常" inactive-text="禁用" @change="handleStatusChange(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="创建者" align="center" prop="operator" :show-overflow-tooltip="true" />
        <el-table-column label="创建时间" align="center" prop="created_at" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ scope.row.created_at | parseTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="修改时间" align="center" prop="created_at" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ scope.row.updated_at | parseTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="220" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <div v-if="scope.row.id !== 1">
              <el-button v-permission="'system:user:update'" size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
              <el-button v-permission="'system:user:delete'" size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="block">
        <el-pagination
          :current-page="queryParams.page"
          :page-sizes="[10, 20, 30, 40, 50]"
          :page-size="queryParams.count"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/修改角色 -->
    <el-dialog :title="insertDialog ? '新增人员' : '修改人员'" :visible.sync="Dialog" width="500px">
      <el-form ref="form" :model="form" label-width="80px" :rules="rules">
        <el-row>
          <el-col :span="12">
            <el-form-item label="人员名称" prop="name"><el-input v-model="form.name" size="medium" autocomplete="off" placeholder="请输入人员名称" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone"><el-input v-model="form.phone" size="medium" autocomplete="off" placeholder="请输入联系电话" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电子邮箱" prop="email"><el-input v-model="form.email" size="medium" autocomplete="off" placeholder="请输入电子邮箱" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户性别" prop="sex">
              <el-radio-group v-model="form.sex">
                <el-radio :label="true">男</el-radio>
                <el-radio :label="false">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属角色" prop="role_id">
              <el-select v-model="form.role_id" :disabled="form.role_id == 1 && form.id == 1" size="medium" placeholder="请选择所属角色">
                <el-option v-for="(item, index) in roleList" :key="index" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="insertDialog" label="登录密码" prop="password">
              <el-input v-model="form.password" size="medium" autocomplete="off" placeholder="请输入登录密码" />
            </el-form-item>
            <el-form-item v-if="updateDialog" label="登录密码"><el-input v-model="form.password" size="medium" autocomplete="off" placeholder="请输入登录密码" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="账号状态">
              <el-radio-group v-model="form.status">
                <el-radio :label="true">正常</el-radio>
                <el-radio :label="false">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属部门" prop="team_id">
              <el-cascader
                v-model="form.team_id"
                :props="{label:'name',value:'id',checkStrictly: true }"
                :options="teamList"
                clearable
                @change="chooseTeam"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="Dialog = false">取 消</el-button>
        <el-button v-if="insertDialog" type="primary" @click="insertData">确 定</el-button>
        <el-button v-if="updateDialog" type="primary" @click="updateData">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getUsers, updateUser, addUser, deleteUser } from '@/api/system/user.js'
import { getRoles } from '@/api/system/role.js'
import { getTeams } from '@/api/system/team.js'

import { upload, generateName } from '@/utils/cos/upload.js'
export default {
  name: 'User',
  data() {
    return {
      loading: true,
      uploading: false,
      uploadtext: '',

      queryParams: {
        page: 1,
        count: 10,
        name: undefined,
        phone: undefined,
        status: undefined
      },
      List: [], // 数据信息
      total: 0, // 数据总数量
      updateDialog: false,
      insertDialog: false,
      Dialog: false,
      form: {},
      roleList: [],
      teamList: [],
      rules: {
        sex: [{ required: true, message: '人员性别不能为空', trigger: 'blur' }],
        name: [{ required: true, message: '人员名称不能为空', trigger: 'blur' }],
        phone: [{ required: true, message: '联系电话不能为空', trigger: 'blur' }],
        email: [{ required: true, message: '邮箱不能为空', trigger: 'blur' }, { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }],
        role_id: [{ required: true, message: '所属角色不能为空', trigger: 'blur' }],
        team_id: [{ required: true, message: '所属部门不能为空', trigger: 'blur' }],
        password: [{ required: true, message: '登录密码不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
    // 初始化添加人员时 选怎角色
    this.getRolesAndTeams()
  },
  methods: {
    async getRolesAndTeams() {
      this.roleList = await getRoles()
      const teams = await getTeams()
      this.teamList = [teams]
    },
    chooseTeam(e) {
      if (!e) return
      this.form.team_id = e[e.length - 1]
    },
    // 获取查询列表 使用异步函数处理
    async getList() {
      const data = await getUsers(this.queryParams)
      this.List = data.list
      this.loading = false
      this.total = data.total
    },
    // 处理查询事件
    handleQuery() {
      this.loading = true
      this.queryParams.page = 1
      this.getList()
    },
    // 重置清除筛选条件
    resetQuery() {
      this.queryParams = {
        page: 1,
        count: 10,
        name: undefined,
        phone: undefined,
        status: undefined
      }
    },
    // 处理pagination 展示数量改变 val 为展示的数量
    handleSizeChange(val) {
      this.loading = true
      this.queryParams.page = 1
      this.queryParams.count = val
      this.getList()
    },
    // 处理pagination 当前所在页改变 val为当前页
    handleCurrentChange(val) {
      this.loading = true
      this.queryParams.page = val
      this.getList()
    },
    // 处理switch 状态的改变
    handleStatusChange(row) {
      const text = row.status === false ? '禁用' : '启用'
      this.$confirm('确认要' + text + '"' + row.name + '"用户吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return updateUser(row)
      }).then(() => {
        this.$message({ message: text + '成功', type: 'success' })
      }).catch(function() {
        row.status = row.status === false
      })
    },
    // 处理删除行事件
    handleDelete(row) {
      this.$confirm('此操作将删除该用户, 是否继续?', '提示', { type: 'warning' }).then(() => {
        deleteUser({ id: row.id })
          .then(res => {
            this.$message({ type: 'success', message: '删除成功!' })
            this.getList()
          })
      })
    },
    // 处理新增按钮点击事件
    handleAdd() {
      this.form = { status: true, avatar: '/static/logo.png' }
      this.updateDialog = false
      this.Dialog = this.insertDialog = true
    },
    // 处理新增按钮点击事件
    handleUpdate(row) {
      this.Dialog = this.updateDialog = true
      this.insertDialog = false
      this.form = this.deepClone(row)
    },
    insertData() {
      this.$refs.form.validate(valid => {
        if (valid) {
          addUser(this.form).then(res => {
            this.$message({ message: '添加成功', type: 'success' })
            this.getList()
            this.insertDialog = this.Dialog = false
          })
        }
      })
    },
    // 处理更新数据
    updateData() {
      this.$refs.form.validate(valid => {
        if (valid) {
          updateUser(this.form).then(res => {
            this.$message({ message: '更新成功', type: 'success' })
            this.getList()
            this.updateDialog = this.Dialog = false
          })
        }
      })
    }
  }
}
</script>
