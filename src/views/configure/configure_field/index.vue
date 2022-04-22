<template>
  <div>
    <el-card class="box-card">
      <el-form ref="queryForm"  :model="queryParams" :inline="true" label-width="68px">
        <el-form-item label="类型" >
          <el-input v-model="queryParams.type" placeholder="请输入类型" clearable size="small" @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          <el-button v-permission="'configure:configure_field:add'" type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="list">
        <el-table-column label="类型" align="center" prop="type" :show-overflow-tooltip="true" />
        <el-table-column label="字段" align="center" prop="field" :show-overflow-tooltip="true" />
        <el-table-column label="描述" align="center" prop="description" :show-overflow-tooltip="true" />
        <el-table-column label="操作者" align="center" prop="operator" :show-overflow-tooltip="true" />
        <el-table-column label="操作时间" align="center" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ scope.row.updated_at | parseTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="220" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button v-permission="'configure:configure_field:update'" size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
            <el-button v-permission="'configure:configure_field:delete'" size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
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
    <el-dialog width="400px" :title="insertDialog ? '新增服务' : '修改服务'" :visible.sync="dialog">
      <el-form ref="form" :model="form" label-width="80px" :rules="rules">
        <el-form-item label="类型标志" prop="type"><el-input v-model="form.type" size="medium" autocomplete="off" placeholder="请输入服务名称" /></el-form-item>
        <el-form-item label="字段标志" prop="field"><el-input v-model="form.field" size="medium" autocomplete="off" placeholder="请输入服务标识" /></el-form-item>
        <el-form-item label="字段配置" prop="config" v-if="!insertDialog">
          <el-tabs v-model="activeName" >
              <el-tab-pane v-for="(item,index) in envs" :key="index" :label="item.name" :name="item.kwyword">
                 <el-input v-model="config[item.keyword]" :rows="4" type="textarea" placeholder="请输入字段配置"  />
              </el-tab-pane>
          </el-tabs>
        </el-form-item>
        <el-form-item label="字段标志" prop="description"><el-input v-model="form.description" size="medium" autocomplete="off" placeholder="请输入字段说明" /></el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialog = false">取 消</el-button>
        <el-button type="primary" v-if="insertDialog" @click="insert">确 定</el-button>
        <el-button type="primary" v-if="updateDialog" @click="update">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>
<script>
import { getEnvs } from '@/api/configure/environment.js';
import { pageConfigureField ,addConfigureField,updateConfigureField,deleteConfigureField} from '@/api/configure/configure_field.js';
export default {
  data() {
    return {
      envs:[],
      list: [], //环境列表
      form: {},
      loading: true,

      dialog: false,
      updateDialog: false,
      insertDialog: false,

      queryParams: {
        page: 1,
        count: 10,
        service_name:undefined,
      },
      total:0,
      activeName:"",
      config:{},
      rules: {
        type: [{ required: true, trigger: 'blur', message: '字段类型不能为空' }],
        field: [{ required: true, trigger: 'blur', message: '字段标志不能为空' }],
        // config: [{ required: true, trigger: 'blur', message: '字段配置不能为空' }],
        description: [{ required: true, trigger: 'blur', message: '字段描述不能为空' }],
      }
    };
  },
  computed: {},
  created() {
    this.getList();
    this.getEnvs()
  },
  methods: {
    async getEnvs(){
      const data =  await getEnvs()
      this.envs = data.list
    },
    // 获取查询列表 使用异步函数处理
    async getList() {
      const data = await pageConfigureField(this.queryParams);
      this.list = data.list;
      this.loading = false;
      this.total = data.total
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
        keyword:undefined
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
      this.form = { status: true, weight: 0 };
      this.insertDialog = true;
      this.updateDialog = false;
      this.dialog = true;
    },
    // 处理修改按钮点击事件
    handleUpdate(row) {
      this.insertDialog = false;
      this.updateDialog = true;
      this.form = JSON.parse(JSON.stringify(row));
      this.handleConfig()
      this.dialog = true;
    },
    handleConfig(){
      let config
      try{
        config = JSON.parse(this.form.config)
      }catch(e){
        config = {}
      }
      for(let i in this.envs){
        const env = this.envs[i]
        this.config[env.keyword] = config[env.keyword]?config[env.keyword]:"{}"
      }
      this.config = this.deepClone(this.config)
      this.$forceUpdate()
    },
    // 处理删除行事件
    handleDelete(row) {
      this.$confirm('此操作将删除该服务, 是否继续?', '提示', { type: 'warning' }).then(() => {
        deleteConfigureField({ id: row.id })
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
      this.$refs.form.validate(valid => {
        if (valid) {
          addConfigureField(params).then(res => {
            this.$message({ message: '新增成功', type: 'success' });
            this.getList();
            this.dialog = false;
          });
        }
      });
    },
    // 处理更新数据
    update() {
      console.log(this.form)
      this.$refs.form.validate(valid => {
        if (valid) {
          this.form.config = JSON.stringify(this.config)
          var params = this.deepClone(this.form);
          updateConfigureField(params).then(res => {
            this.$message({ message: '更新成功', type: 'success' });
            this.getList();
            this.dialog = false;
          });
        }
      })
    }

  }
};
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
