<template>
  <div>
    <el-card class="box-card">
      <div class="header-nav">
        <el-row :gutter="10" class="mb8">
          <el-col v-permission="'configure:service:add'" :span="1.5"><el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAddService">新增</el-button></el-col>
        </el-row>
      </div>
      <el-table v-loading="loading" :data="list">
        <el-table-column label="标志符" align="center" prop="keyword" :show-overflow-tooltip="true" />
        <el-table-column label="服务名" align="center" prop="name" :show-overflow-tooltip="true" />
        <el-table-column label="备注" align="center" prop="description" :show-overflow-tooltip="true" />
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
        <el-table-column label="操作" align="center" width="220" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button v-permission="'configure:service:update'" size="mini" type="text" icon="el-icon-edit" @click="handleUpdateService(scope.row)">修改</el-button>
            <el-button v-permission="'configure:service:delete'" size="mini" type="text" icon="el-icon-delete" @click="handleDeleteService(scope.row)">删除</el-button>
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
    <el-dialog width="400px" :title="insertServiceDialog ? '新增服务' : '修改服务'" :visible.sync="dialog">
      <el-form ref="form" :model="form" label-width="80px" :rules="rules">
        <el-form-item label="服务名称" prop="name"><el-input v-model="form.name" size="medium" autocomplete="off" placeholder="请输入服务名称" /></el-form-item>
        <el-form-item label="服务标识" prop="keyword"><el-input v-model="form.keyword" size="medium" autocomplete="off" placeholder="请输入服务标识" /></el-form-item>
        <el-form-item label="服务备注" prop="description"><el-input v-model="form.description" type="textarea" /></el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialog = false">取 消</el-button>
        <el-button type="primary" v-if="insertServiceDialog" @click="insertService">确 定</el-button>
        <el-button type="primary" v-if="updateServiceDialog" @click="updateService">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { getServices, addService, updateService, deleteService } from '@/api/configure/service.js';
export default {
  data() {
    return {
      list: [],
      form: {},
      total:0,
      dialog: false,
      updateServiceDialog: false,
      insertServiceDialog: false,
      loading: true,
      queryParams: {
        page: 1,
        count: 10,
        keyword:undefined,
      },
      rules: {
        name: [{ required: true, trigger: 'blur', message: '服务名称不能为空' }],
        keyword: [{ required: true, trigger: 'blur', message: '服务标识不能为空' }],
        description: [{ required: true, trigger: 'blur', message: '服务描述件不能为空' }],
      }
    };
  },
  computed: {},
  created() {
    this.getList();
  },
  methods: {
    // 获取查询列表 使用异步函数处理
    async getList() {
      const data = await getServices(this.queryParams);
      this.list = data.list;
      this.loading = false;
      this.total = data.total
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
    // 处理switch 状态的改变
    handleStatusChange(row) {
      const text = row.status === false ? '禁用 ' : '启用';
      this.$confirm('确认要"' + text + '""' + row.name + '"服务吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function() {
          return updateService({ id: row.id, status: row.status });
        })
        .then(() => {
          this.$message({ message: text + '成功', type: 'success' });
        })
        .catch(function() {
          row.status = row.status === false;
        });
    },
    // 处理新增按钮点击事件
    handleAddService() {
      this.form = { status: true, weight: 0 };
      this.insertServiceDialog = true;
      this.updateServiceDialog = false;
      this.dialog = true;
    },
    // 处理修改按钮点击事件
    handleUpdateService(row) {
      this.insertServiceDialog = false;
      this.updateServiceDialog = true;
      this.dialog = true;
      this.form = JSON.parse(JSON.stringify(row));
    },
    // 处理删除行事件
    handleDeleteService(row) {
      this.$confirm('此操作将删除该服务, 是否继续?', '提示', { type: 'warning' }).then(() => {
        deleteService({ id: row.id })
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
    insertService() {
      this.$refs.form.validate(valid => {
        if (valid) {
          var params = this.deepClone(this.form);
          addService(params).then(res => {
            this.$message({ message: '新增成功', type: 'success' });
            this.getList();
            this.dialog = false;
          });
        }
      });
    },
    // 处理更新数据
    updateService() {
      this.$refs.form.validate(valid => {
        if (valid) {
          var params = this.deepClone(this.form);
          updateService(params).then(res => {
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
<style scoped="">
.tree-box {
  max-height: 300px;
  overflow: scroll;
  border: 1px solid #f2f2fe;
  padding: 5px 0;
  border-radius: 4px;
}
</style>
