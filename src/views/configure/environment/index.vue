<template>
  <div>
    <el-card class="box-card">
      <el-row :gutter="10" class="mb8">
        <el-col v-permission="'configure:environment:add'" :span="1.5"><el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAddEnv">新增</el-button></el-col>
      </el-row>
      <el-table v-loading="loading" :data="list" v-permission="'configure:environment:list'" >
        <el-table-column label="标志符" align="center" prop="keyword" :show-overflow-tooltip="true" />
        <el-table-column label="环境名" align="center" prop="name" :show-overflow-tooltip="true" />
        <el-table-column label="中间件" align="center" prop="drive" :show-overflow-tooltip="true" />
        <el-table-column label="存储前缀" align="center" prop="prefix" :show-overflow-tooltip="true" />
        <el-table-column label="状态" align="center">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.status" active-text="正常" inactive-text="禁用" @change="handleStatusChange(scope.row)" />
          </template>
        </el-table-column>

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

        <el-table-column label="备注" align="center" prop="description" :show-overflow-tooltip="true" />
        <el-table-column label="操作" align="center" width="220" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button v-permission="'configure:environment:update'" size="mini" type="text" icon="el-icon-edit" @click="handleUpdateEnv(scope.row)">修改</el-button>
            <el-button v-permission="'configure:environment:delete'" size="mini" type="text" icon="el-icon-delete" @click="handleDeleteEnv(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--环境管理面板-->
    <el-dialog width="600px" :title="insertEnvDialog ? '新增环境' : '修改环境'" :visible.sync="dialog">
      <el-form ref="form" :model="form" label-width="80px" :rules="rules">
        <el-row>
          <el-col :span="12">
            <el-form-item label="环境名称" prop="name"><el-input v-model="form.name" size="medium" autocomplete="off" placeholder="请输入环境名称" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="环境标识" prop="keyword"><el-input v-model="form.keyword" size="medium" autocomplete="off" placeholder="请输入环境标识" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="路径前缀" prop="prefix"><el-input v-model="form.prefix" size="medium" autocomplete="off" placeholder="请输入路径前缀" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="中间件" prop="drive">
              <el-select v-model="form.drive">
                <el-option v-for="(item, index) in driveList" :key="index" :value="item">{{ item }}</el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="环境备注" prop="description"><el-input v-model="form.description" type="textarea" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="环境状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio :label="true">正常</el-radio>
                <el-radio :label="false">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="中间件配置" prop="config"><el-input v-model="form.config" type="textarea" :rows="4" /></el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialog = false">取 消</el-button>
        <el-button type="primary" v-if="insertEnvDialog" @click="insertEnv">确 定</el-button>
        <el-button type="primary" v-if="updateEnvDialog" @click="updateEnv">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { getEnvs, addEnv, updateEnv, deleteEnv } from '@/api/configure/environment.js';
export default {
  data() {
    return {
      driveList: ['etcd', 'consul', 'zk'],
      list: [], //环境列表
      form: {},
      dialog: false,
      updateEnvDialog: false,
      insertEnvDialog: false,
      loading: true,
      rules: {
        name: [{ required: true, trigger: 'blur', message: '环境名称不能为空' }],
        keyword: [{ required: true, trigger: 'blur', message: '环境标识不能为空' }],
        drive: [{ required: true, trigger: 'blur', message: '环境中间件不能为空' }],
        config: [{ required: true, trigger: 'blur', message: '配置不能为空' }],
        prefix: [{ required: true, trigger: 'blur', message: '路径前缀不能为空' }],
        description: [{ required: true, trigger: 'blur', message: '环境描述件不能为空' }],
        status: [{ required: true, trigger: 'blur', message: '环境状态不能为空' }]
      }
    };
  },
  computed: {},
  created() {
    this.getEnvs();
  },
  methods: {
    // 获取查询列表 使用异步函数处理
    async getEnvs() {
      const data = await getEnvs();
      this.list = data.list;
      this.loading = false;
    },
    // 处理switch 状态的改变
    handleStatusChange(row) {
      const text = row.status === false ? '禁用 ' : '启用';
      this.$confirm('确认要"' + text + '""' + row.name + '"环境吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function() {
          return updateEnv({ id: row.id, status: row.status });
        })
        .then(() => {
          this.$message({ message: text + '成功', type: 'success' });
        })
        .catch(function() {
          row.status = row.status === false;
        });
    },
    // 处理新增按钮点击事件
    handleAddEnv() {
      this.form = { status: true, weight: 0 };
      this.insertEnvDialog = true;
      this.updateEnvDialog = false;
      this.dialog = true;
    },
    // 处理修改按钮点击事件
    handleUpdateEnv(row) {
      this.insertEnvDialog = false;
      this.updateEnvDialog = true;
      this.dialog = true;
      this.form = JSON.parse(JSON.stringify(row));
    },
    // 处理删除行事件
    handleDeleteEnv(row) {
      this.$confirm('此操作将删除该环境, 是否继续?', '提示', { type: 'warning' }).then(() => {
        deleteEnv({ id: row.id })
          .then(res => {
            this.$message({ type: 'success', message: '删除成功!' });
            this.getEnvs();
          })
          .catch(() => {
            this.$message({ type: 'info', message: '已取消删除' });
          });
      });
    },
    // 处理插入数据的
    insertEnv() {
      this.$refs.form.validate(valid => {
        if (valid) {
          var params = this.deepClone(this.form);
          addEnv(params).then(res => {
            this.$message({ message: '新增成功', type: 'success' });
            this.getEnvs();
            this.dialog = false;
          });
        }
      });
    },
    // 处理更新数据
    updateEnv() {
      this.$refs.form.validate(valid => {
        if (valid) {
          var params = this.deepClone(this.form);
          updateEnv(params).then(res => {
            this.$message({ message: '更新成功', type: 'success' });
            this.getEnvs();
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
