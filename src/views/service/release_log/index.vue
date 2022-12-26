<template>
  <div>
    <el-card class="box-card">
      <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
        <el-form-item label="服务名称">
          <el-autocomplete
            v-model="tempValue"
            size="small"
            :fetch-suggestions="querySearchAsync"
            clearable
            value-key="show_name"
            placeholder="请选择服务"
            @select="handleSelect"
            @clear="handleSelect"
          ></el-autocomplete>
        </el-form-item>

        <el-form-item label="服务标志">
          <el-input v-model="queryParams.service_keyword" placeholder="请输入" clearable size="small" @keyup.enter.native="handleQuery" />
        </el-form-item>

        <el-form-item label="执行状态" prop="is_finish">
          <el-select v-model="queryParams.is_finish" placeholder="请选择" size="small">
            <el-option label="进行中" :value="true" />
            <el-option label="执行完成" :value="false" />
          </el-select>
        </el-form-item>

        <el-form-item label="发布状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择" size="small">
            <el-option v-for="(item,index) in status" :key="index" :label="item" :value="index" />
          </el-select>
        </el-form-item>

        <el-form-item label="发布时间">
          <el-date-picker size="small" value-format="timestamp" :clearable="false" @change="chooseTime" v-model="startandend" type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
          <el-button v-permission="'service:release_log:add'" type="primary" icon="el-icon-plus" size="small" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="List"  v-permission="'service:release_log:page'">
        <el-table-column label="服务名称" align="center" prop="service_name" />
        <el-table-column label="镜像仓库" align="center" prop="image_registry_name" :show-overflow-tooltip="true" />
        <el-table-column label="镜像名" align="center" prop="image_name" :show-overflow-tooltip="true" />
        <el-table-column label="发布时长" align="center" :show-overflow-tooltip="true" >
          <template slot-scope="scope">
            <el-tag type="info">{{scope.row.use_time}}秒</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="执行状态" align="center" width="120px">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.is_finish" type="success">已完成</el-tag>
            <el-tag v-else type="danger">进行中</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发布详情" align="center" width="120px">
          <template slot-scope="scope">
            <el-popover placement="left" width="400" trigger="click">
              <div class="desc-box">
                <div class="desc-item" v-for=" (val,index) in getDescList(scope.row.desc)" :key="index">
                  {{index+1}} : {{val}}
                </div>
              </div>
              <el-button slot="reference"  size="small" type="text" icon="el-icon-tickets" >查看</el-button>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="发布状态" align="center" width="120px">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status == 'success'" type="success">{{status[scope.row.status]}}</el-tag>
            <el-tag v-if="scope.row.status == 'fail'" type="danger">{{status[scope.row.status]}}</el-tag>
            <el-tag v-if="scope.row.status == 'check'" type="warning">{{status[scope.row.status]}}</el-tag>
          </template>
        </el-table-column>

       <el-table-column label="发布时间" align="center" prop="created_at" :show-overflow-tooltip="true" >
          <template slot-scope="scope">
            <span>{{ scope.row.created_at | parseTime }}</span>
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

    <el-dialog width="400px" title="服务发布" :visible.sync="dialog">
      <el-form ref="form" :model="form" label-width="80px" :rules="rules">
        <el-form-item label="服务名称" prop="keyword">
          <el-autocomplete
            v-model="tempValue"
            size="small"
            :fetch-suggestions="querySearchAsync"
            clearable
            value-key="show_name"
            placeholder="请选择服务"
            @select="handleSelectService"
            @clear="handleSelectService"
          ></el-autocomplete>
        </el-form-item>

        <el-form-item label="选择镜像" prop="pack_id" >
           <el-select v-model="form.pack_id"  filterable placeholder="请选择">
             <el-option v-for="(item,index) in images" :key="index" :label="item.image_name+'（'+parseTime(item.created_at)+'）'" :value="item.id" ></el-option>
           </el-select>
        </el-form-item>

        <el-form-item label="发布环境" prop="env_keyword" >
           <el-select v-model="form.env_keyword"  placeholder="请选择">
             <el-option v-for="(item,index) in envs" :key="index" :label="item.name" :value="item.keyword" ></el-option>
           </el-select>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialog = false">取 消</el-button>
        <el-button type="primary"  @click="insert">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>

import { addReleaseLog, getReleaseLog } from '@/api/service/release_log.js';
import { getReleaseStatus,getReleaseImages} from '@/api/service/release.js';
import { getServices } from '@/api/service/service.js';
import { getFilterEnvs } from '@/api/service/environment.js';
export default {
  name: 'User',
  data() {
    return {
      tempValue:"",
      startandend: [],
      loading: false,
      images:[],
      queryParams: {
        page: 1,
        count: 10,
        keyword: undefined
      },
      List: [], // 数据信息
      total: 0, // 数据总数量
      dialog:false,
      form:{},
      status:{},
      envs:[],
      rules: {
        service_keyword: [{ required: true, trigger: 'blur', message: '服务名称不能为空' }],
        env_keyword: [{ required: true, trigger: 'blur', message: '发布环境' }],
        pack_id: [{ required: true, trigger: 'blur', message: '发布镜像' }],
      },
    }
  },
  created() {
    this.getStatus()
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
    async getStatus(){
      this.status = await getReleaseStatus()
    },
    async getEnvs(){
      this.envs = await getFilterEnvs()
    },

    async handleAdd(){
      if(this.form.service_keyword != this.queryParams.service_keyword){
        this.form={}
      }
      if(!this.form.service_keyword && this.queryParams.service_keyword){
        this.form.service_keyword = this.queryParams.service_keyword;
        this.images = await getReleaseImages({"service_keyword":item.keyword})
      }
      this.dialog = true;
    },
    insert() {
      this.$refs.form.validate(valid => {
        if (valid) {
          var params = this.deepClone(this.form);
          addReleaseLog(params).then(res => {
            this.$message({ message: '请求发布成功', type: 'success' });
            this.dialog = false;
            this.getList();
          });
        }
      });
    },
    getDescList(desc){
      if(!desc) return []
      return desc.split("\n")
    },
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
    handleSelect(item) {
      if (!item || !item.id) {
        this.resetQuery()
        return
      }
      this.queryParams.service_keyword = item.keyword
      this.getList()
    },
    chooseTime(e){
      this.queryParams.start = e[0]/1000
      this.queryParams.end = e[1]/1000
    },
    // 获取查询列表 使用异步函数处理
    async getList() {
      if(this.queryParams.keyword){
        this.List = [];
        this.loading = false;
        this.total = 0;
      }
      const data = await getReleaseLog(this.queryParams);
      this.List = data.list;
      this.loading = false;
      this.total = data.total;
    },
    // 处理查询事件
    handleQuery() {
      this.loading = true;
      this.queryParams.page = 1;
      this.getList();
    },
    // 重置清除筛选条件
    resetQuery() {
      this.queryParams = {
        page: 1,
        count: 10,
        start: undefined,
        end: undefined,
        status: undefined
      };
      this.startandend = []
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
    }
  }
}
</script>
<style scoped>
  .desc-box{
    max-height: 400px;
    overflow: scroll;
  }
  .desc-item{
    border-bottom: 1px solid #f2f2f2;
    margin-bottom: 5px;
  }
</style>
