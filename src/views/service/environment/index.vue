<template>
  <div>
    <el-card class="box-card">
      <el-row :gutter="10" class="mb8">
        <el-col v-permission="'service:environment:add'" :span="1.5"><el-button type="primary" icon="el-icon-plus" size="small" @click="handleAddEnv">新增</el-button></el-col>
      </el-row>
      <el-table v-loading="loading" v-permission="'service:environment:all'" :data="list">
        <el-table-column label="标志符" align="center" prop="keyword" :show-overflow-tooltip="true" />
        <el-table-column label="环境名" align="center" prop="name" :show-overflow-tooltip="true" />
        <el-table-column label="运行模式" align="center" prop="type" :show-overflow-tooltip="true" />
        <el-table-column label="连接地址" align="center" prop="host" :show-overflow-tooltip="true" />
        <el-table-column label="链接token" align="center" prop="token" :show-overflow-tooltip="true" />
        <el-table-column label="命名空间" align="center" prop="namespace" :show-overflow-tooltip="true" />

        <el-table-column label="状态" align="center">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.status" active-text="正常" inactive-text="禁用" @change="handleStatusChange(scope.row)" />
          </template>
        </el-table-column>

        <el-table-column label="创建者" align="center" prop="operator" :show-overflow-tooltip="true" />
        <el-table-column label="创建时间" align="center" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ scope.row.created_at | parseTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ scope.row.updated_at | parseTime }}</span>
          </template>
        </el-table-column>

        <el-table-column label="备注" align="center" prop="description" :show-overflow-tooltip="true" />
        <el-table-column label="操作" align="center" width="220" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button slot="reference" v-permission="'service:environment:connect'" size="small" type="text" icon="el-icon-sort" @click="handleConnectEnv(scope.row)">连接测试</el-button>
            <el-button v-permission="'service:environment:update'" size="small" type="text" icon="el-icon-edit" @click="handleUpdateEnv(scope.row)">修改</el-button>
            <el-button v-permission="'service:environment:delete'" size="small" type="text" icon="el-icon-delete" @click="handleDeleteEnv(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--环境管理面板-->
    <el-dialog width="500px" :title="insertEnvDialog ? '新增环境' : '修改环境'" :visible.sync="dialog">
      <el-form ref="form" :model="form" label-width="120px" :rules="rules">
        <el-form-item label="环境标识" prop="keyword"><el-input v-model="form.keyword" size="medium" autocomplete="off" placeholder="请输入环境标识" /></el-form-item>
        <el-form-item label="环境名称" prop="name"><el-input v-model="form.name" size="medium" autocomplete="off" placeholder="请输入环境名称" /></el-form-item>
        <el-form-item label="环境备注" prop="description"><el-input v-model="form.description" type="textarea" /></el-form-item>
        <el-form-item label="运行模式" prop="type">
          <el-select v-model="form.type">
            <el-option v-for="tp in types" :key="tp" :label="tp" :value="tp">{{ tp }}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="连接地址" prop="host"><el-input v-model="form.host" /></el-form-item>
        <el-form-item label="连接token" prop="token"><el-input v-model="form.token" type="textarea" /></el-form-item>
        <el-form-item v-if="form.type == 'k8s'" label="命名空间" prop="namespace"><el-input v-model="form.namespace" /></el-form-item>
        <el-form-item label="环境状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="true">正常</el-radio>
            <el-radio :label="false">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialog = false">取 消</el-button>
        <el-button v-if="insertEnvDialog" type="primary" @click="insertEnv">确 定</el-button>
        <el-button v-if="updateEnvDialog" type="primary" @click="updateEnv">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { getReleaseTypes } from '@/api/service/release.js'
import { getEnvs, addEnv, updateEnv, deleteEnv } from '@/api/service/environment.js'
export default {
  data() {
    return {
      list: [], // 环境列表
      form: {},
      types: {},
      dialog: false,
      updateEnvDialog: false,
      insertEnvDialog: false,
      loading: true,
      rules: {
        name: [{ required: true, trigger: 'blur', message: '环境名称不能为空' }],
        keyword: [{ required: true, trigger: 'blur', message: '环境标识不能为空' }],
        description: [{ required: true, trigger: 'blur', message: '环境描述件不能为空' }],
        status: [{ required: true, trigger: 'blur', message: '环境状态不能为空' }],
        type: [{ required: true, trigger: 'blur', message: '运行模式不能为空' }],
        host: [{ required: true, trigger: 'blur', message: '连接地址不能为空' }],
        token: [{ required: true, trigger: 'blur', message: '连接token不能为空' }]

      },
      connectStatus: undefined
    }
  },
  computed: {},
  created() {
    this.getEnvs()
    this.getReleaseTypes()
  },
  methods: {
    // 获取查询列表 使用异步函数处理
    async getEnvs() {
      this.list = await getEnvs()
      this.loading = false
    },
    async getReleaseTypes() {
      this.types = await getReleaseTypes()
    },
    // 处理switch 状态的改变
    handleStatusChange(row) {
      const text = row.status === false ? '禁用 ' : '启用'
      this.$confirm('确认要"' + text + '""' + row.name + '"环境吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function() {
          return updateEnv({ id: row.id, status: row.status })
        })
        .then(() => {
          this.$message({ message: text + '成功', type: 'success' })
        })
        .catch(function() {
          row.status = row.status === false
        })
    },
    // 处理新增按钮点击事件
    handleAddEnv() {
      this.form = { status: true, weight: 0 }
      this.insertEnvDialog = true
      this.updateEnvDialog = false
      this.dialog = true
    },
    // 处理修改按钮点击事件
    handleUpdateEnv(row) {
      this.insertEnvDialog = false
      this.updateEnvDialog = true
      this.form = JSON.parse(JSON.stringify(row))
      this.dialog = true
    },
    // 处理删除行事件
    handleDeleteEnv(row) {
      this.$confirm('此操作将删除该环境, 是否继续?', '提示', { type: 'warning' }).then(() => {
        deleteEnv({ id: row.id })
          .then(res => {
            this.$message({ type: 'success', message: '删除成功!' })
            this.getEnvs()
          })
          .catch(() => {
            this.$message({ type: 'info', message: '已取消删除' })
          })
      })
    },
    // 处理插入数据的
    insertEnv() {
      this.$refs.form.validate(valid => {
        if (valid) {
          var params = this.deepClone(this.form)
          addEnv(params).then(res => {
            this.$message({ message: '新增成功', type: 'success' })
            this.getEnvs()
            this.dialog = false
          })
        }
      })
    },
    // 处理更新数据
    updateEnv() {
      this.$refs.form.validate(valid => {
        if (valid) {
          var params = this.deepClone(this.form)
          updateEnv(params).then(res => {
            this.$message({ message: '更新成功', type: 'success' })
            this.getEnvs()
            this.dialog = false
          })
        }
      })
    }
  }
}
</script>
<style scoped="">
.tree-box {
  max-height: 300px;
  overflow: scroll;
  border: 1px solid #f2f2fe;
  padding: 5px 0;
  border-radius: 4px;
}
</style>
