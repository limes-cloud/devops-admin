<template>
  <div>
    <el-card class="box-card">
      <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
        <el-form-item label="服务名称">
          <el-autocomplete
            v-model="queryTempValue"
            size="small"
            :fetch-suggestions="querySearchAsync"
            clearable
            value-key="show_name"
            placeholder="请选择服务"
            @select="querySelect"
            @clear="querySelect"
          ></el-autocomplete>
        </el-form-item>

        <el-form-item label="选择环境" prop="env_id" >
           <el-select v-model="queryParams.env_id"  placeholder="请选择">
             <el-option v-for="(item,index) in envs" :key="index" :label="item.name" :value="item.id" ></el-option>
           </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
          <el-button v-permission="'service:network:add'" type="primary" icon="el-icon-plus" size="small" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="list" v-permission="'service:network:page'">
        <el-table-column label="网络host" align="center" prop="host" :show-overflow-tooltip="true" />
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

        <el-table-column label="操作" align="center" width="220" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button v-permission="'service:network:update'" size="small" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
            <el-button v-permission="'service:network:delete'" size="small" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
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

    <!--代码network管理面板-->
    <el-dialog width="500px" :title="insertDialog ? '新增代码网络配置' : '修改代码网络配置'" :visible.sync="dialog">
      <el-form ref="form" :model="form" label-width="110px" :rules="rules">

        <el-form-item label="网络host" prop="host">
          <el-input v-model="form.host" size="medium" autocomplete="off" placeholder="请输入network名称" />
        </el-form-item>
        
        <el-form-item label="所属服务">
          <el-autocomplete
            v-model="tempValue"
            :fetch-suggestions="querySearchAsync"
            clearable
            value-key="show_name"
            placeholder="请选择服务"
            @select="formSelect"
            @clear="formSelect"
          ></el-autocomplete>
        </el-form-item>

        <el-form-item label="所属环境" prop="env_id" >
           <el-select v-model="form.env_id"  placeholder="请选择">
             <el-option v-for="(item,index) in envs" :key="index" :label="item.name" :value="item.id" ></el-option>
           </el-select>
        </el-form-item>

        <el-form-item label="是否开启https" prop="open_https">
          <el-select v-model="form.open_https" placeholder="请选择">
              <el-option  label="开启" :value="true"></el-option>
              <el-option  label="关闭" :value="false"></el-option>
            </el-select>
        </el-form-item>

        <el-form-item v-if="form.open_https" label="证书公钥" prop="cert">
          <el-input v-model="form.cert" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item v-if="form.open_https" label="证书密钥" prop="key">
          <el-input v-model="form.key" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item v-if="form.open_https" label="是否强制https" prop="redirect">
          <el-select v-model="form.redirect" placeholder="请选择">
              <el-option  label="开启" :value="true"></el-option>
              <el-option  label="关闭" :value="false"></el-option>
            </el-select>
        </el-form-item>

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
import { getServices } from '@/api/service/service.js';
import { getFilterEnvs } from '@/api/service/environment.js';
import { getNetworks,addNetwork, updateNetwork, deleteNetwork } from '@/api/service/network.js';
export default {
  data() {
    return {
      queryTempValue:"",
      tempValue:"",
      envs:[],
      list: [], //代码network列表
      form: {},
      templateDialog:false,
      dialog: false,
      updateDialog: false,
      insertDialog: false,
      loading: true,
      rules: {
        host: [{ required: true, trigger: 'blur', message: '网络host不能为空' }],
        srv_id: [{ required: true, trigger: 'blur', message: '所属服务不能为空' }],
        env_id: [{ required: true, trigger: 'blur', message: '所属环境不能为空' }],
      },
      total:0,
      queryParams:{
        page:1,
        count:10,
      },
    };
  },

  computed: {

  },
  created() {
    this.getList()
    this.getEnvs()
  },
  methods: {
    async handleSelectService(item){
      if (!item || !item.id) {
        this.resetQuery()
        return
      }
      if(this.form.service_keyword == item.keyword){
        return
      }
      this.valueLoading = false
      this.queryParams.service_keyword = item.keyword
      this.form.service_keyword = item.keyword
      this.images = await getReleaseImages({"service_keyword":item.keyword})
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
    querySelect(item) {
      if (!item || !item.id) {
        return
      }
      this.queryParams.srv_id = item.id
    },
    formSelect(item) {
      if (!item || !item.id) {
        return
      }
      this.form.srv_id = item.id
    },
    async getEnvs(){
      this.envs = await getFilterEnvs()
    },
    async getList() {
      let data = await getNetworks(this.queryParams);
      this.list = data.list 
      this.total = data.total
      this.loading = false;
    },
    async getServices(name) {
      let srvList = await getServices({page:1,count:10,name:name});
      return srvList
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
    handleTemplate(row) {
      this.template = row.template
      this.templateDialog = true
    },
    // 处理新增按钮点击事件
    handleAdd() {
      this.form = { };
      this.insertDialog = true;
      this.updateDialog = false;
      this.dialog = true;
    },
    // 处理修改按钮点击事件
    async handleUpdate(row) {
      this.insertDialog = false;
      this.updateDialog = true;
      if (row.cert != "") row.open_https = true 
      else row.open_https = false 

      this.form = this.deepClone(row);
      let service = await getServices({id:this.form.id,page:1,count:1})
      this.tempValue =  service.list[0].name+"("+service.list[0].keyword+")"
 
      this.dialog = true;
    },

    // 处理删除行事件
    handleDelete(row) {
      this.$confirm('此操作将删除该网络配置, 是否继续?', '提示', { type: 'warning' }).then(() => {
        deleteNetwork({ id: row.id })
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
          addNetwork(params).then(res => {
            this.$message({ message: '新增成功', type: 'success' });
            this.getList();
            this.dialog = false;
          });
        }
      });
    },
    // 处理更新数据
    update() {
      this.$refs.form.validate(valid => {
        if (valid) {
          var params = this.deepClone(this.form);
          updateNetwork(params).then(res => {
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
<style scoped>
  .editor{
    min-height: 200px;
    height: auto;
    overflow-y:scroll;
  }
</style>
