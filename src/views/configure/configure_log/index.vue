<template>
  <div>
    <el-card class="box-card">
      <el-form ref="queryForm"  :model="queryParams" :inline="true" label-width="68px">
        <el-form-item label="服务名" prop="service_name">
          <el-input v-model="queryParams.service_name" placeholder="请输入服务名" clearable size="small" @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="list" v-permission="'configure:service_log:list'">
        <el-table-column label="操作服务" align="center" prop="service_name" :show-overflow-tooltip="true" />
        <el-table-column label="操作类别" align="center" prop="title" :show-overflow-tooltip="true" />
        <el-table-column label="操作详情" align="center" prop="content" :show-overflow-tooltip="true" />
        <el-table-column label="操作者" align="center" prop="operator" :show-overflow-tooltip="true" />
        <el-table-column label="操作时间" align="center" :show-overflow-tooltip="true">
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
import { getConfigureLogs } from '@/api/configure/configure_log.js';
export default {
  data() {
    return {
      list: [], //环境列表
      form: {},
      loading: true,
      queryParams: {
        page: 1,
        count: 10,
        service_name:undefined,
      },
      total:0,
    };
  },
  computed: {},
  created() {
    this.getList();
  },
  methods: {
    // 获取查询列表 使用异步函数处理
    async getList() {
      const data = await getConfigureLogs(this.queryParams);
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
