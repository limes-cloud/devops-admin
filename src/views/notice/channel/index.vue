<template>
  <div>
    <el-card class="box-card">
      <el-form ref="queryForm" v-permission="'notice:channel:query'" :model="queryParams" :inline="true" label-width="68px">
        <el-form-item label="通道名称"><el-input v-model="queryParams.name" placeholder="请输入通道名称" clearable size="small" @keyup.enter.native="handleQuery" /></el-form-item>
        <el-form-item label="通道状态">
          <el-select v-model="queryParams.status" placeholder="请选择" size="small">
            <el-option label="正常" value="true" />
            <el-option label="禁用" value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
        <el-col v-permission="'notice:channel:add'" :span="1.5"><el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button></el-col>
      </el-row>
      <el-table v-loading="loading" :data="list">
        <el-table-column label="通道ID" align="center" prop="id" :show-overflow-tooltip="true" />
        <el-table-column label="通道名称" align="center" prop="name" :show-overflow-tooltip="true" />
        <el-table-column label="通道配置" align="center" prop="config" :show-overflow-tooltip="true" />
        <el-table-column label="通道状态" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status">开启</el-tag>
            <el-tag v-else type="info">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建者" align="center" prop="operator" :show-overflow-tooltip="true" />
        <el-table-column label="创建时间" align="center" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ scope.row.created_at | parseTime}}</span>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" align="center" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ scope.row.updated_at | parseTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="220" class-name="small-padding fixed-width">
          <template slot-scope="scope">
              <el-button v-permission="'notice:channel:update'" size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
              <el-button v-permission="'notice:channel:delete'" size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 修改通道 -->
    <el-dialog :title="insertDialog?'新增通道':'修改通道’'" :visible.sync="dialog" width="400px">
      <el-form ref="form" :model="form" label-width="80px" :rules="rules">
        <el-form-item label="通道名称"><el-input v-model="form.name" size="medium" autocomplete="off" placeholder="请输入通道名称" /></el-form-item>
        <el-form-item label="通道配置"><el-input v-model="form.config" size="medium" autocomplete="off" placeholder="请输入权限标识" /></el-form-item>
        <el-form-item label="通道状态" v-if="updateDialog"><el-switch v-model="form.status"  active-text="正常" inactive-text="禁用" /></el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialog = false">取 消</el-button>
        <el-button v-if="insertDialog" type="primary" @click="insertData()">确 定</el-button>
        <el-button v-if="updateDialog" type="primary" @click="updateData()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { GetChannels,AddChannel,UpdateChannel,DeleteChannel} from '@/api/notice/channel.js';
export default {
  data() {
    return {
      list: [],
      form: {},
      dialog: false,
      updateDialog: false,
      insertDialog: false,
      loading: true,
      queryParams: {
        page:1,
        count:10,
        name: null,
        status: null
      },

      total: 0, // 数据总数量
      rules: {
        name: [
          {
            required: true,
            trigger: 'blur',
            message: '通道名称不能为空'
          }
        ],
        config: [
          {
            required: true,
            trigger: 'blur',
            message: '通道配置不能为空'
          }
        ]
      }
    };
  },
  computed: {},
  created() {
      this.getList()
  },
  methods: {
    async getList() {
      this.list = await GetChannels(this.queryParams);
      this.loading = false;
      this.total = this.list.length;
    },
    // 处理查询事件
    handleQuery() {
      this.loading = true;
      this.getList();
    },
    // 重置清除筛选条件
    resetQuery() {
      this.queryParams = {page:1,count:10}
    },
    // 处理新增按钮点击事件
    handleAdd() {
      this.form = {status:false};
      this.insertDialog = true;
      this.updateDialog = false;
      this.dialog = true;
    },
    // 处理修改按钮点击事件
    handleUpdate(row) {
      this.insertDialog = false;
      this.updateDialog = true;
      this.dialog = true;
      this.form = this.deepClone(row);
    },
    // 处理删除行事件
    handleDelete(row) {
      this.$confirm('此操作将删除该通道, 是否继续?', '提示', { type: 'warning' }).then(() => {
        DeleteChannel({ id: row.id })
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
    insertData() {
      this.$refs.form.validate(valid => {
        if (valid) {
          AddChannel(this.form).then(res => {
            this.$message({ message: '新增成功', type: 'success' });
            this.getList();
            this.dialog = false;
          });
        }
      });
    },
    // 处理更新数据
    updateData() {
      this.$refs.form.validate(valid => {
        if (valid) {
          UpdateChannel(this.form).then(res => {
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
