<template>
  <div>
    <el-card class="box-card">
      <div class="header-nav">
        <el-form ref="queryForm" v-permission="'system:role:list'" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="服务标志">
            <el-input v-model="queryParams.keyword" placeholder="请输入服务标志" clearable size="small" @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="服务名称">
            <el-input v-model="queryParams.name" placeholder="请输入服务名称" clearable size="small" @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="所属环境">
            <el-select v-model="queryParams.is_private" size="small" placeholder="请选择">
              <el-option label="私有服务" :value="true" />
              <el-option label="公有服务" :value="false" />
            </el-select>
          </el-form-item>

          <el-form-item v-if="queryParams.is_private" label="所属部门" prop="team_id">
            <el-cascader
              v-model="queryParams.team_id"
              size="small"
              :props="{label:'name',value:'id',checkStrictly: true }"
              :options="teamList"
              clearable
              @change="chooseQueryTeam"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-plus" size="small" @click="handleAddService">新增</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table v-loading="loading" :data="list">
        <el-table-column label="标志符" align="center" prop="keyword" :show-overflow-tooltip="true" />
        <el-table-column label="服务名" align="center" prop="name" :show-overflow-tooltip="true" />
        <el-table-column label="dockerfile模板" align="center" prop="dockerfile_name" :show-overflow-tooltip="true" />
        <el-table-column label="代码仓库" align="center" prop="code_registry_name" :show-overflow-tooltip="true" />
        <el-table-column label="镜像仓库" align="center" prop="image_registry_name" :show-overflow-tooltip="true" />
        <el-table-column label="代码空间" align="center" prop="owner" :show-overflow-tooltip="true" />
        <el-table-column label="项目名称" align="center" prop="repo" :show-overflow-tooltip="true" />
        <el-table-column label="运行端口" align="center" prop="run_port" :show-overflow-tooltip="true" />
        <el-table-column label="监听端口" align="center" prop="listen_port" :show-overflow-tooltip="true" />
        <el-table-column label="备注" align="center" prop="description" :show-overflow-tooltip="true" />
        <el-table-column label="创建者" align="center" prop="operator" :show-overflow-tooltip="true" />
        <el-table-column label="创建时间" align="center" :show-overflow-tooltip="true">

          <template slot-scope="scope">
            <span>{{ scope.row.created_at | parseTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="修改时间" align="center" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ scope.row.updated_at | parseTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="120" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button v-permission="'service:service:update'" size="small" type="text" icon="el-icon-edit" @click="handleUpdateService(scope.row)">修改</el-button>
            <el-button v-permission="'service:service:delete'" size="small" type="text" icon="el-icon-delete" @click="handleDeleteService(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="page-block">
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

    <!--服务管理面板-->
    <el-dialog width="750px" :title="insertServiceDialog ? '新增服务' : '修改服务'" :visible.sync="dialog">
      <el-form ref="form" :model="form" label-width="110px" :rules="rules">
        <el-row>
          <el-col :span="12">
            <el-form-item label="服务名称" prop="name">
              <el-input v-model="form.name" size="medium" autocomplete="off" placeholder="请输入服务名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="服务标识" prop="keyword">
              <el-input v-model="form.keyword" size="medium" autocomplete="off" placeholder="请输入服务标识" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="docker模板" prop="dockerfile_id">
              <el-select v-model="form.dockerfile_id" filterable remote reserve-keyword :remote-method="getDockerfiles" placeholder="请选择">
                <el-option v-for="item in dockerfiles" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="代码仓库" prop="code_registry_id">
              <el-select v-model="form.code_registry_id" placeholder="请选择">
                <el-option v-for="item in codes" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="镜像仓库" prop="image_registry_id">
              <el-select v-model="form.image_registry_id" placeholder="请选择">
                <el-option v-for="item in images" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发布模板" prop="release_id">
              <el-select v-model="form.release_id" filterable remote reserve-keyword :remote-method="getReleases" placeholder="请选择">
                <el-option v-for="item in releases" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" />
          <el-col :span="12" />
        </el-row>

        <el-form-item label="代码仓库核检" prop="repo">
          <el-row>
            <el-col :span="10">
              <el-input v-model="form.owner" size="medium" autocomplete="off" placeholder="代码空间" />
            </el-col>
            <el-col :span="10">
              <el-input v-model="form.repo" style="margin-left: 25px;" size="medium" autocomplete="off" placeholder="项目名称" />
            </el-col>
            <el-col :span="4">
              <div style="text-align: right;">
                <el-button v-if="form.owner && form.repo" type="primary" size="small" @click="validateProject">核查</el-button>
              </div>
            </el-col>
          </el-row>
        </el-form-item>

        <el-row>
          <el-col :span="12">
            <el-form-item label="运行端口" prop="run_port">
              <el-input-number v-model="form.run_port" :min="80" :max="65545" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="监听端口" prop="listen_port">
              <el-input-number v-model="form.listen_port" :min="80" :max="65545" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="副本数量" prop="replicas">
              <el-input-number v-model="form.replicas" :min="1" :max="20" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="探测方式" prop="probe_type">
              <el-select v-model="form.probe_type" size="small" placeholder="请选择">
                <el-option label="http" value="httpGet" />
                <el-option label="commond" value="exec" />
                <el-option label="tcp" value="tcp" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item :label="probeLabel[form.probe_type]" prop="probe_value">
              <el-input v-model="form.probe_value" size="medium" autocomplete="off" :placeholder="'请输入'+probeLabel[form.probe_type]" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="探测延迟" prop="probe_init_delay">
              <el-input-number v-model="form.probe_init_delay" :min="5" :max="60" />
            </el-form-item>
          </el-col>

        </el-row>

        <el-form-item label="运行类型" prop="run_type">
          <el-select v-model="form.run_type" placeholder="请选择">
            <el-option v-for="tp in runTypes" :key="tp" :label="tp" :value="tp" />
          </el-select>
        </el-form-item>

        <el-form-item label="所属环境" prop="env_ids">
          <el-select v-model="form.env_ids" multiple placeholder="请选择">
            <el-option v-for="item in envList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="服务类型" prop="is_private">
          <el-radio-group v-model="form.is_private">
            <el-radio :label="true">私有服务</el-radio>
            <el-radio :label="false">公有服务</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="form.is_private" label="所属部门" prop="team_id">
          <el-cascader
            v-model="form.team_id"
            :props="{label:'name',value:'id',checkStrictly: true }"
            :options="teamList"
            clearable
            @change="chooseTeam"
          />
        </el-form-item>
        <el-form-item label="服务备注" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" size="medium" autocomplete="off" placeholder="请输入服务备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialog = false">取 消</el-button>
        <el-button v-if="insertServiceDialog" type="primary" @click="insertService">确 定</el-button>
        <el-button v-if="updateServiceDialog" type="primary" @click="updateService">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>
<script>
import { getReleases } from '@/api/service/release.js'
import { getTeams } from '@/api/system/team.js'
import { getEnvs } from '@/api/service/environment.js'
import { getServiceInfos, addService, updateService, deleteService, getRunTypes } from '@/api/service/service.js'
import { getImageRegistries } from '@/api/service/image_registry.js'
import { getCodeRegistries, getProject } from '@/api/service/code_registry.js'
import { getDockerfiles } from '@/api/service/dockerfile.js'
export default {
  data() {
    return {
      probeLabel: { 'httpGet': '探测路径', 'tcp': '探测端口', 'commod': '探测命令' },
      envList: [],
      teamList: [],
      releases: [],
      list: [],
      form: {},
      total: 0,
      dockerfiles: [],
      images: [],
      runTypes: [],
      codes: [],
      dialog: false,
      updateServiceDialog: false,
      insertServiceDialog: false,
      loading: true,
      searchLoading: false,
      queryParams: {
        page: 1,
        count: 10,
        keyword: undefined,
        name: undefined
      },
      rules: {
        replicas: [{ required: true, trigger: 'blur', message: '副本数量不能为空' }],
        probe_type: [{ required: true, trigger: 'blur', message: '探测方式不能为空' }],
        probe_value: [{ required: true, trigger: 'blur', message: '探测方式值不能为空' }],
        probe_init_delay: [{ required: true, trigger: 'blur', message: '探测延迟时间不能为空' }],
        env: [{ required: true, trigger: 'blur', message: '所属环境不能为空' }],
        repo: [{ required: true, trigger: 'blur', message: '服务仓库不能为空' }],
        name: [{ required: true, trigger: 'blur', message: '服务名称不能为空' }],
        keyword: [{ required: true, trigger: 'blur', message: '服务标识不能为空' }],
        description: [{ required: true, trigger: 'blur', message: '服务描述件不能为空' }],
        run_port: [{ required: true, trigger: 'blur', message: '运行端口不能为空' }],
        listen_port: [{ required: true, trigger: 'blur', message: '监听端口不能为空' }],
        dockerfile_id: [{ required: true, trigger: 'blur', message: 'dockerfile模板不能唯恐' }],
        release_id: [{ required: true, trigger: 'blur', message: '发布模板不能唯恐' }],
        code_registry_id: [{ required: true, trigger: 'blur', message: '服务代码仓库不能为空' }],
        image_registry_id: [{ required: true, trigger: 'blur', message: '服务镜像仓库不能为空' }]
      }

    }
  },
  computed: {},
  created() {
    this.getCodeRegistries()
    this.getImageRegistries()
    this.getTeams()
    this.getEnvs()
    this.getList()
    this.getRunTypes()
  },
  methods: {
    async getReleases(name) {
      if (name !== '') {
        this.releases = []
      }
      const data = await getReleases({ page: 1, count: 10, name: name })
      this.releases = data.list
    },
    async getRunTypes() {
      this.runTypes = await getRunTypes()
    },
    async getDockerfiles(name) {
      if (name !== '') {
        this.dockerfiles = []
      }
      const data = await getDockerfiles({ page: 1, count: 10, name: name })
      this.dockerfiles = data.list
    },
    async getCodeRegistries() {
      this.codes = await getCodeRegistries()
    },
    async getImageRegistries() {
      this.images = await getImageRegistries()
    },
    async getEnvs() {
      this.envList = await getEnvs()
    },
    async getTeams() {
      const teams = await getTeams()
      this.teamList = [teams]
    },
    // 获取查询列表 使用异步函数处理
    async getList() {
      const data = await getServiceInfos(this.queryParams)
      this.list = data.list
      this.total = data.total
      this.loading = false
    },
    chooseTeam(e) {
      if (!e) return
      this.form.team_id = e[e.length - 1]
    },
    chooseQueryTeam(e) {
      if (!e) return
      this.queryParams.team_id = e[e.length - 1]
    },
    // 处理查询事件
    handleQuery() {
      this.loading = true
      this.getList()
    },
    resetQuery() {
      this.queryParams = {
        page: 1,
        count: 10,
        keyword: undefined
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
      const text = row.status === false ? '禁用 ' : '启用'
      this.$confirm('确认要"' + text + '""' + row.name + '"服务吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function() {
          return updateService({ id: row.id, status: row.status })
        })
        .then(() => {
          this.$message({ message: text + '成功', type: 'success' })
        })
        .catch(function() {
          row.status = row.status === false
        })
    },
    // 处理新增按钮点击事件
    handleAddService() {
      this.form = { probe_type: 'httpGet' }
      this.insertServiceDialog = true
      this.updateServiceDialog = false
      this.dialog = true
    },
    // 处理修改按钮点击事件
    handleUpdateService(row) {
      this.insertServiceDialog = false
      this.updateServiceDialog = true
      this.form = this.deepClone(row)
      this.dockerfiles = [{ id: this.form.dockerfile_id, name: this.form.dockerfile_name }]
      this.releases = [{ id: this.form.release_id, name: this.form.release_name }]
      for (const i in this.form.env_ids) {
        const id = this.form.env_ids[i]
        let hasValue = false
        for (const j in this.envList) {
          if (this.envList[j].id == id) {
            hasValue = true
            break
          }
        }
        if (!hasValue) {
          this.form.env_ids.splice(i, 1)
        }
      }
      this.env_ids
      this.dialog = true
    },
    validateProject() {
      getProject({ id: this.form.code_registry_id, owner: this.form.owner, repo: this.form.repo })
        .then(res => {
          this.$message({ type: 'success', message: '验证通过!' })
        })
        .catch(() => {
          this.$message({ type: 'error', message: '验证失败！' })
        })
    },
    // 处理删除行事件
    handleDeleteService(row) {
      this.$confirm('此操作将删除该服务, 是否继续?', '提示', { type: 'warning' }).then(() => {
        deleteService({ id: row.id })
          .then(res => {
            this.$message({ type: 'success', message: '删除成功!' })
            this.getList()
          })
          .catch(() => {
            this.$message({ type: 'info', message: '已取消删除' })
          })
      })
    },
    // 处理插入数据的
    insertService() {
      this.$refs.form.validate(valid => {
        if (valid) {
          var params = this.deepClone(this.form)
          addService(params).then(res => {
            this.$message({ message: '新增成功', type: 'success' })
            this.getList()
            this.dialog = false
          })
        }
      })
    },
    // 处理更新数据
    updateService() {
      this.$refs.form.validate(valid => {
        if (valid) {
          var params = this.deepClone(this.form)
          updateService(params).then(res => {
            this.$message({ message: '更新成功', type: 'success' })
            this.getList()
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
