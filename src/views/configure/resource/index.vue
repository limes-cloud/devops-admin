<template>
  <div>
    <el-card class="box-card">
      <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
        <el-form-item label="字段名称">
          <el-input v-model="queryParams.field" placeholder="请输入字段名称" clearable size="small" @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="类型名称"><el-input v-model="queryParams.type" placeholder="请输入类型名称" clearable size="small" @keyup.enter.native="handleQuery" /></el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
          <el-button v-permission="'configure:resource:add'" type="primary" icon="el-icon-plus" size="small" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" v-permission="'configure:resource:page'" :data="list">
        <el-table-column label="类型" align="center" prop="type" :show-overflow-tooltip="true" />
        <el-table-column label="字段" align="center" prop="field" :show-overflow-tooltip="true" />
        <el-table-column label="描述" align="center" prop="description" :show-overflow-tooltip="true" />
        <el-table-column label="操作者" align="center" prop="operator" :show-overflow-tooltip="true" />
        <el-table-column label="操作时间" align="center" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ scope.row.updated_at | parseTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="300" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button v-permission="'configure:resource_value:query'" size="mini" type="text" icon="el-icon-set-up" @click="handleUpdateValue(scope.row)">配置</el-button>
            <el-button v-permission="'configure:resource:service:query'" size="mini" type="text" icon="el-icon-set-up" @click="handleQueryService(scope.row)">服务</el-button>
            <el-button v-permission="'configure:resource:update'" size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
            <el-button v-permission="'configure:resource:delete'" size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
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
    <el-dialog width="400px" :title="insertDialog ? '新增字段' : '修改字段'" :visible.sync="dialog">
      <el-form ref="form" :model="form" label-width="80px" :rules="rules">
        <el-form-item label="类型名称" prop="type">
          <el-input v-model="form.type" size="medium" autocomplete="off" placeholder="请输入类型标志" />
        </el-form-item>
        <el-form-item label="字段名称" prop="field">
          <el-input v-model="form.field" size="medium" autocomplete="off" placeholder="请输入字段标志" />
        </el-form-item>
        <el-form-item label="子字段" prop="child_field">
          <el-select v-model="form.child_field" multiple filterable allow-create default-first-option placeholder="请输入子字段标志">
            <el-option v-for="item in childFields" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="字段说明" prop="description">
          <el-input v-model="form.description" type="textarea" size="medium" autocomplete="off" placeholder="请输入字段说明" />
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialog = false">取 消</el-button>
        <el-button v-if="insertDialog" type="primary" @click="insert">确 定</el-button>
        <el-button v-if="updateDialog" type="primary" @click="update">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog width="700px" title="资源值配置" :visible.sync="valueDialog">
      <el-form class="dialog-form" ref="form" :model="form" label-width="80px" label-position="top">
        <el-form-item v-for="(item, index) in envs" :key="index" :label="item.name + ':' + item.keyword" prop="type">
          <div v-for="(ite, ind) in envValues" :key="ind">
            <el-input v-if="ite.env_keyword === item.keyword" v-model="envValues[index].value" size="medium" type="textarea" :rows="4" autocomplete="off" placeholder="请输入值" />
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="valueDialog = false">取 消</el-button>
        <el-button v-permission="'configure:resource_value:update'" type="primary" @click="updateFieldValue">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog width="400px" title="资源服务配置" :visible.sync="serviceDialog">
      <el-form class="dialog-form" ref="form" :model="form" label-width="80px" label-position="top">
        <el-form-item prop="service_ids">
          <el-select v-model="service_keywords" multiple filterable remote reserve-keyword placeholder="请输入服务名称"
              :remote-method="getServices"
              :loading="loading">
              <el-option
                v-for="item in serviceList"
                :key="item.keyword"
                :label="item.keyword"
                :value="item.keyword">
              </el-option>
            </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="serviceDialog = false">取 消</el-button>
        <el-button v-permission="'configure:resource:service:update'" type="primary" @click="updateResourceService">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>
<script>

import { getFilterEnvs as getEnvs } from '@/api/service/environment.js';
import { getServices } from '@/api/service/service.js';
import { getResourceService,addResourceService,getResourceValue, updateResourceValue, pageResource, addResource, updateResource, deleteResource } from '@/api/configure/resource.js';
export default {
  data() {
    return {
      envs: [],
      list: [], //环境列表
      form: {},
      loading: true,
      envValues: [],
      dialog: false,
      serviceList:[],
      service_keywords:[],
      serviceDialog:false,
      updateDialog: false,
      insertDialog: false,
      valueDialog: false,
      queryParams: {
        page: 1,
        count: 10,
        service_name: undefined
      },
      total: 0,
      config: {},
      childFields:[],
      rules: {
        type: [{ required: true, trigger: 'blur', message: '字段类型不能为空' }],
        field: [
          { required: true, trigger: 'blur', message: '字段标志不能为空' },
          { type:"string",pattern: /^[_a-zA-Z][_a-zA-Z0-9]+$/, trigger: 'blur', message: '字段名不合法' }
        ],
        child_field:[{ required: true, trigger: 'blur', message: '字段类型不能为空' }],
        description: [{ required: true, trigger: 'blur', message: '字段描述不能为空' }]
      }
    };
  },
  computed: {},
  created() {
    this.getList();
    this.getEnvs();
  },
  methods: {
    async getEnvs() {
      this.envs = await getEnvs({ status: true });
      for (const i in this.envs) this.envValues.push({});
    },
    getServices(query){
      if(!query || !query.length){
        this.serviceList =  []
        return
      }
      getServices({page:1,count:10,name:query}).then(res=>{
         this.serviceList = res.list
      })
    },
    // 获取查询列表 使用异步函数处理
    async getList() {
      const data = await pageResource(this.queryParams);
      this.list = data.list;
      this.loading = false;
      this.total = data.total;
    },
    // 处理查询事件
    handleQuery() {
      this.loading = true;
      this.queryParams.page = 1;
      this.getList();
    },
    resetQuery() {
      this.queryParams = {
        page: 1,
        count: 10,
        keyword: undefined
      };
    },
    // 处理pagination 展示数量改变 val 为展示的数量
    handleSizeChange(val) {
      this.loading = true;
      this.queryParams.page = 1;
      this.queryParams.count = val;
      this.getList();
    },
    // 处理pagination 当前所在页改变 val为当前页
    handleCurrentChange(val) {
      this.loading = true;
      this.queryParams.page = val;
      this.getList();
    },
    handleAdd() {
      this.form = {};
      this.insertDialog = true;
      this.updateDialog = false;
      this.dialog = true;
    },
    async handleQueryService(row) {
      this.form = this.deepClone(row);
      this.service_keywords = []
      let data = await getResourceService({ resource_id: row.id });
      for(let i in data){
        this.service_keywords.push(data[i].service_keyword)
      }
      this.$forceUpdate()
      this.serviceDialog = true;
    },
    updateResourceService(row){
      addResourceService({resource_id:this.form.id,service_keywords:this.service_keywords}).then(res=>{
        this.$message({ type: 'success', message: '服务挂载成功!' });
        this.getList();
        this.serviceDialog = false;
      })
    },
    async handleUpdateValue(row) {
      this.form = this.deepClone(row);
      let values = await getResourceValue({ resource_id: row.id });
      // 获取值列表
      this.envValues = [];
      for (let i in this.envs) {
        let hasVal = false;
        for (let j in values) {
          if (this.envs[i].keyword == values[j].env_keyword) {
            this.envValues.push(values[j]);
            hasVal = true;
          }
        }
        if (!hasVal) this.envValues.push({ env_keyword: this.envs[i].keyword, value: '' });
      }
      this.valueDialog = true;
    },
    updateFieldValue() {
      let findEnvName = (env_id)=>{
        for (let n in this.envs) {
          if (this.envs[n].id == env_id) {
            return this.envs[n].name + '[' + this.envs[n].keyword + ']';
          }
        }
        return ""
      }

      let i = 0;
      try {
        let fields = JSON.parse(this.form.child_field)
        for (i in this.envValues) {
          let data = JSON.parse(this.envValues[i].value);
          for(let j in fields){
            if (!data[fields[j]]){
              this.$message({ type: 'error', message: findEnvName(this.envValues[i].env_id)+'不存在字段:'+fields[j] });
              return
            }
          }
        }
      } catch (e) {
        this.$message({ type: 'error', message: findEnvName(this.envValues[i].env_id)+'存在非json数据值' });
        return;
      }
      updateResourceValue({ data: this.envValues, resource_id: this.form.id }).then(res => {
        this.$message({ message: '更新成功', type: 'success' });
        this.valueDialog = false;
      });
    },
    // 处理修改按钮点击事件
    handleUpdate(row) {
      this.insertDialog = false;
      this.updateDialog = true;
      this.form = this.deepClone(row);
      if (!this.form.child_field) this.form.child_field = this.childFields = []
      else this.form.child_field = this.childFields= JSON.parse(this.form.child_field)
      this.dialog = true;
    },
    // 处理删除行事件
    handleDelete(row) {
      this.$confirm('此操作将删除该服务, 是否继续?', '提示', { type: 'warning' }).then(() => {
        deleteResource({ id: row.id })
          .then(res => {
            this.$message({ type: 'success', message: '删除成功!' });
            this.getList();
          })
          .catch(() => {
            this.$message({ type: 'info', message: '已取消删除' });
          });
      });
    },
    // 处理插入数据的
    insert() {
      var params = this.deepClone(this.form);
      params.child_field = JSON.stringify(params.child_field)
      this.$refs.form.validate(valid => {
        if (valid) {
          addResource(params).then(res => {
            this.$message({ message: '新增成功', type: 'success' });
            this.getList();
            this.dialog = false;
          });
        }
      });
    },
    // 处理更新数据
    update() {
      var params = this.deepClone(this.form);
      params.child_field = JSON.stringify(params.child_field)
      this.$refs.form.validate(valid => {
        if (valid) {
          updateResource(params).then(res => {
            this.$message({ message: '更新成功', type: 'success' });
            this.getList();
            this.dialog = false;
          });
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped="">
.tree-box {
  max-height: 300px;
  overflow: scroll;
  border: 1px solid #f2f2fe;
  padding: 5px 0;
  border-radius: 4px;
}

.dialog-form{
  max-height: 400px;
  overflow-y: scroll;
  &::-webkit-scrollbar{
    display: none;
  }
}
</style>
