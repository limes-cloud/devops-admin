<template>
  <div>
    <el-card class="box-card">
      <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
        <el-form-item label="选择服务">
          <el-autocomplete
            clearable
            v-model="value"
            size="small"
            :fetch-suggestions="querySearchAsync"
            value-key="show_name"
            placeholder="请输入服务"
            @select="handleSelect"
            @clear="handleSelect"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
          <el-button :disabled="!curService.id" v-permission="'configure:field:add'" type="primary" icon="el-icon-plus" size="small" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="list" v-permission="'configure:field:page'">
        <el-table-column label="字段" align="center" prop="field" :show-overflow-tooltip="true" />
        <el-table-column label="描述" align="center" prop="description" :show-overflow-tooltip="true" />
        <el-table-column label="操作者" align="center" prop="operator" :show-overflow-tooltip="true" />
        <el-table-column label="创建时间" align="center" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ scope.row.created_at | parseTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" align="center" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ scope.row.updated_at | parseTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="250" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button v-permission="'configure:field_value:query'" size="mini" type="text" icon="el-icon-set-up" @click="handleUpdateValue(scope.row)">值配置</el-button>
            <el-button v-permission="'configure:field:update'" size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
            <el-button v-permission="'configure:field:delete'" size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
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
        <el-form-item label="所属服务" required="">
          <el-input :disabled="true" v-model="value" size="medium" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="字段标志" prop="field">
          <el-input v-model="form.field" size="medium" autocomplete="off" placeholder="请输入服务标识">
            <template slot="prepend">
              {{ curService.keyword }}.
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="字段说明" prop="description"><el-input v-model="form.description" size="medium" autocomplete="off" placeholder="请输入字段说明" /></el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialog = false">取 消</el-button>
        <el-button type="primary" v-if="insertDialog" @click="insert">确 定</el-button>
        <el-button type="primary" v-if="updateDialog" @click="update">确 定</el-button>
      </div>
    </el-dialog>

    <!--值配置面板-->
    <el-dialog width="700px" title="值配置" :visible.sync="valueDialog">
      <el-form class="dialog-form" ref="form" :model="form" label-width="80px" label-position="top">
        <el-form-item v-for="(item,index) in envs" :key="index" :label="item.name+':'+item.keyword" prop="type">
          <div v-for="(ite,ind) in envValues" :key="ind">
            <el-input v-if="ite.env_keyword == item.keyword" v-model="envValues[index].value" size="medium" type="textarea" :rows="4" autocomplete="off" placeholder="请输入值" />
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="valueDialog = false">取 消</el-button>
        <el-button type="primary" v-permission="'configure:field_value:update'"  @click="updateFieldValue">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>
<script>
import { getServices,getServiceEnv} from '@/api/service/service.js';
import { getFieldValue,updateFieldValue,pageField, addField, updateField, deleteField } from '@/api/configure/field.js';
export default {
  data() {
    return {
      envs: [],
      list: [], //环境列表
      form: {},
      loading: false,
      value: '',
      dialog: false,
      updateDialog: false,
      insertDialog: false,
      serviceList: [],
      curService:{},
      valueDialog:false,
      envValues:[],
      queryParams: {
        page: 1,
        count: 10,
        service_id: undefined
      },
      total: 0,
      config: {},
      rules: {
        type: [{ required: true, trigger: 'blur', message: '字段类型不能为空' }],
        field: [{ required: true, trigger: 'blur', message: '字段标志不能为空' }],
        description: [{ required: true, trigger: 'blur', message: '字段描述不能为空' }]
      }
    };
  },
  computed: {},
  created() {

  },
  methods: {
    async getServices(name) {
      let srvList = await getServices({page:1,count:10,name:name});
      return srvList
    },
    querySearchAsync(queryString, cb) {
      if(!queryString || !queryString.length)
        return []
     this.getServices(queryString).then(res=>{
       for(let i in res.list){
         res.list[i].show_name = res.list[i].name +"("+res.list[i].keyword+")"
       }
       cb(res.list);
     })
    },
    async handleSelect(item) {
      if (!item || !item.id){
        this.resetQuery()
        return
      };
      this.curService = item
      this.getList()
    },
    async handleUpdateValue(row){
      this.envs = await getServiceEnv({srv_id:this.curService.id})
      this.form = this.deepClone(row);

      let values = await getFieldValue({field_id:row.id})
      this.envValues = []
      for(let i in this.envs){
        let hasVal = false
        for(let j in values){
          if(this.envs[i].keyword == values[j].env_keyword){
            this.envValues.push(values[j])
            hasVal = true
          }
        }
        if(!hasVal)
          this.envValues.push({env_keyword:this.envs[i].keyword,value:""})
      }
      this.valueDialog = true
    },
    updateFieldValue(){
      updateFieldValue({"data":this.envValues,"field_id":this.form.id}).then(res => {
        this.$message({ message: '更新成功', type: 'success' });
        this.valueDialog = false;
      });
    },
    async getList() {
      if(!this.curService.id){
        this.loading = false
        return
      }
      const data = await pageField(this.queryParams);
      this.list = data.list;
      this.loading = false;
      this.total = data.total;
    },
    handleQuery() {
      this.loading = true;
      this.queryParams.page = 1;
      this.getList();
    },
    resetQuery() {
      this.curService = {}
      this.list = []
      this.value = undefined
      this.queryParams = { page: 1,count: 10,keyword: undefined};
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
      this.form = { service_keyword: this.curService.keyword };
      this.insertDialog = true;
      this.updateDialog = false;
      this.dialog = true;
    },
    // 处理修改按钮点击事件
    handleUpdate(row) {
      this.insertDialog = false;
      this.updateDialog = true;
      this.form = JSON.parse(JSON.stringify(row));
      this.form.field = this.form.field.split('.')[1];
      this.dialog = true;
    },
    // 处理删除行事件
    handleDelete(row) {
      this.$confirm('此操作将删除该服务, 是否继续?', '提示', { type: 'warning' }).then(() => {
        deleteField({ id: row.id })
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
      this.$refs.form.validate(valid => {
        if (valid) {
          var params = this.deepClone(this.form);
          params.field = this.curService.keyword + '.' + params.field;
          addField(params).then(res => {
            this.$message({ message: '新增成功', type: 'success' });
            this.getList();
            this.dialog = false;
          });
        }
      });
    },
    // 处理更新数据
    update() {
      this.form.config = JSON.stringify(this.config);
      this.$refs.form.validate(valid => {
        if (valid) {
          var params = this.deepClone(this.form);
          params.field = this.curService.keyword + '.' + params.field;
          updateField(params).then(res => {
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
