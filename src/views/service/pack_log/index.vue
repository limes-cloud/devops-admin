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
        <el-form-item label="构建状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择" size="small">
            <el-option label="成功" :value="true" />
            <el-option label="失败" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="执行状态" prop="is_finish">
          <el-select v-model="queryParams.is_finish" placeholder="请选择" size="small">
            <el-option label="进行中" :value="true" />
            <el-option label="执行完成" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="构建时间">
          <el-date-picker size="small" value-format="timestamp" :clearable="false" @change="chooseTime" v-model="startandend" type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
          <el-button v-permission="'service:pack:add'" type="primary" icon="el-icon-plus" size="small" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="List"  v-permission="'service:pack_log:page'">
        <el-table-column label="服务名称" align="center" prop="service_name" />
        <el-table-column label="dockerfile名称" align="center" prop="dockerfile_name" :show-overflow-tooltip="true" />
        <el-table-column label="代码仓库" align="center" prop="code_registry_name" :show-overflow-tooltip="true" />
        <el-table-column label="镜像仓库" align="center" prop="image_registry_name" :show-overflow-tooltip="true" />
        <el-table-column label="分支/标签" align="center" prop="clone_type" :show-overflow-tooltip="true" />
        <el-table-column label="分支/标签值" align="center" prop="clone_value" :show-overflow-tooltip="true" />
        <el-table-column label="commit_id" align="center" prop="commit_id" :show-overflow-tooltip="true" />
        <el-table-column label="镜像名" align="center" prop="image_name" :show-overflow-tooltip="true" />
        <el-table-column label="构建时长" align="center" :show-overflow-tooltip="true" >
          <template slot-scope="scope">
            <el-tag type="info">{{scope.row.use_time}}秒</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="流程状态" align="center" width="120px">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.is_finish" type="success">已完成</el-tag>
            <el-tag v-else type="danger">进行中</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="构建人员" align="center" prop="operator" :show-overflow-tooltip="true" />
        <el-table-column label="构建详情" align="center" width="120px">
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
        <el-table-column label="构建状态" align="center" width="120px">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status===true" type="success">成功</el-tag>
            <el-tag v-else-if="scope.row.status===false" type="danger">失败</el-tag>
            <el-tag v-else type="info">构建中</el-tag>
          </template>
        </el-table-column>

       <el-table-column label="构建时间" align="center" prop="created_at" :show-overflow-tooltip="true" >
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

    <el-dialog width="400px" title="服务构建" :visible.sync="dialog">
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

        <el-form-item label="标签/分支" prop="status">
          <el-radio-group v-model="form.clone_type">
            <el-radio label="branch">分支</el-radio>
            <el-radio label="tag">标签</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="form.clone_type=='tag' && valueLoading" label="标签值" prop="clone_value" >
           <el-select v-model="form.tag_template" @change="selectTag" filterable placeholder="请选择">
             <el-option v-for="(item,index) in tags" :key="index" :label="item.name+'（'+item.commit_name+' | '+item.commit_time+'）'" :value="item.name" ></el-option>
           </el-select>
        </el-form-item>

        <el-form-item v-if="form.clone_type=='branch'&& valueLoading" label="分支值" prop="clone_value" >
           <el-select v-model="form.branch_template" @change="selectBranch" filterable placeholder="请选择">
             <el-option v-for="(item,index) in branches" :key="index" :label="item.name+'（'+item.commit_name+'｜'+item.commit_time+'）'" :value="item.name" ></el-option>
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

import { addPack, getPackLog } from '@/api/service/pack.js';
import { getServices } from '@/api/service/service.js';
import { getProjectBranches,getProjectTags } from '@/api/service/code_registry.js';
export default {
  name: 'User',
  data() {
    return {
      startandend: [],
      loading: false,
      queryParams: {
        page: 1,
        count: 10,
        keyword: undefined
      },
      valueLoading:false,
      List: [], // 数据信息
      total: 0, // 数据总数量
      tempValue:"",
      curService:{},
      dialog:false,
      form:{},
      rules: {
        clone_type: [{ required: true, trigger: 'blur', message: '构建类型不能为空' }],
        clone_value: [{ required: true, trigger: 'blur', message: '分支/标签不能为空' }],
        commit_id: [{ required: true, trigger: 'blur', message: 'commit_id不能为空' }],
        service_keyword: [{ required: true, trigger: 'blur', message: '服务标志不能为空' }]
      },
      branches:[],
      tags:[],
    }
  },
  created() {
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
      this.branches = await getProjectBranches({"service_keyword":item.keyword})
      this.tags = await getProjectTags({"service_keyword":item.keyword})
      this.valueLoading = true

    },
    selectTag(e){
      let item = {}
      for(let i in this.tags){
         if(this.tags[i].name == e){
           item =  this.tags[i]
         }
      }
      this.form.commit_id = item.commit_id
      this.form.clone_value = item.name
    },
    selectBranch(e){
      let item = {}
      for(let i in this.branches){
         if(this.branches[i].name == e){
           item =  this.branches[i]
         }
      }
      this.form.commit_id = item.commit_id
      this.form.clone_value = item.name
    },
    async handleAdd(){
      if(this.form.service_keyword != this.queryParams.service_keyword){
        this.form={}
      }
      if(!this.form.service_keyword && this.queryParams.service_keyword){
        this.form.service_keyword = this.queryParams.service_keyword;
        this.branches = await getProjectBranches({"service_keyword":this.form.service_keyword})
        this.tags = await getProjectTags({"service_keyword":this.form.service_keyword})
        this.valueLoading = true
      }

      this.dialog = true;
    },
    insert() {
      this.$refs.form.validate(valid => {
        if (valid) {
          var params = this.deepClone(this.form);
          addPack(params).then(res => {
            this.$message({ message: '请求构建成功', type: 'success' });
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
      const data = await getPackLog(this.queryParams);
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
