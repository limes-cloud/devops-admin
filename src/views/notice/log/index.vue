<template>
  <div>
    <el-card class="box-card" v-permission="'system:log:page'">
      <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
        <el-form-item label="通知标题"><el-input v-model="queryParams.title" placeholder="请输入通知标题" clearable size="small" @keyup.enter.native="handleQuery" /></el-form-item>
        <el-form-item label="通知时间">
          <el-date-picker size="small" value-format="timestamp" :clearable="false" @change="chooseTime" v-model="startandend" type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table v-loading="loading" :data="List" >
        <el-table-column label="cid" align="center" prop="cid" />
        <el-table-column label="标题" align="center" prop="title" :show-overflow-tooltip="true" />
        <el-table-column label="内容" align="center" prop="content" :show-overflow-tooltip="true" />
        <el-table-column label="规则" align="center" prop="rule" :show-overflow-tooltip="true" />
        <el-table-column label="人员" align="center" width="200px">
          <template slot-scope="scope">
            <div v-for="(item,index) in JSON.parse(scope.row.users)" :key="index">
              <el-tag  type="success">{{item.name}}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="通道" align="center" width="200px">
          <template slot-scope="scope">
            <div v-for="(item,index) in JSON.parse(scope.row.channels)" :key="index">
              <el-tag  type="success">{{item.name}}</el-tag>
            </div>
          </template>
        </el-table-column>

       <el-table-column label="时间" align="center" prop="created_at" :show-overflow-tooltip="true" >
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
  </div>
</template>

<script>

import { GetLog } from '@/api/notice/log.js';

export default {
  name: 'User',
  data() {
    return {
      startandend: [],
      loading: true,
      queryParams: {
        page: 1,
        count: 10,
        start: undefined,
        end: undefined,
        status: undefined
      },
      List: [], // 数据信息
      total: 0, // 数据总数量
    }
  },
  created() {
    this.getList();
  },
  methods: {
    chooseTime(e){
      this.queryParams.start = e[0]/1000
      this.queryParams.end = e[1]/1000
    },
    // 获取查询列表 使用异步函数处理
    async getList() {
      const data = await GetLog(this.queryParams);
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
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}

.avatar {
  width: 120px;
  height: 120px;
  display: block;
}
</style>
