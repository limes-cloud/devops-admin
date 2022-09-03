<template>
  <div>
    <el-card class="box-card">
      <el-row :gutter="10" class="mb8">
        <el-col v-permission="'service:image_registry:add'" :span="1.5"><el-button type="primary" icon="el-icon-plus" size="small" @click="handleAdd">新增</el-button></el-col>
      </el-row>
      <el-table v-loading="loading" :data="list" v-permission="'service:image_registry:all'">
        <el-table-column label="仓库名" align="center" prop="name" :show-overflow-tooltip="true" />
        <el-table-column label="仓库地址" align="center" prop="host" :show-overflow-tooltip="true" />
        <el-table-column label="仓库协议" align="center" prop="protocol" :show-overflow-tooltip="true" />
        <el-table-column label="仓库账号" align="center" prop="username" :show-overflow-tooltip="true" />
        <el-table-column label="仓库密码" align="center" prop="password" :show-overflow-tooltip="true" />
        <el-table-column label="记录数量" align="center" prop="history_count" :show-overflow-tooltip="true" />
        <el-table-column label="仓库描述" align="center" prop="desc" :show-overflow-tooltip="true" />
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
            <el-button slot="reference" v-permission="'service:image_registry:connect'" size="small" type="text" icon="el-icon-sort" @click="handleConnect(scope.row)">
              连接测试
            </el-button>
            <el-button v-permission="'service:image_registry:update'" size="small" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
            <el-button v-permission="'service:image_registry:delete'" size="small" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--镜像仓库管理面板-->
    <el-dialog width="400px" :title="insertDialog ? '新增镜像仓库配置' : '修改镜像仓库配置'" :visible.sync="dialog">
      <el-form ref="form" :model="form" label-width="80px" :rules="rules">

        <el-form-item label="仓库名称" prop="name">
          <el-input v-model="form.name" size="medium" autocomplete="off" placeholder="请输入仓库名称" />
        </el-form-item>

        <el-form-item label="仓库地址" prop="host">
          <el-input v-model="form.host" size="medium" autocomplete="off" placeholder="请输入仓库地址" />
        </el-form-item>

        <el-form-item label="仓库协议" prop="protocol">
          <el-radio-group v-model="form.protocol">
            <el-radio label="https">https</el-radio>
            <el-radio label="http">http</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="仓库账号" prop="token">
          <el-input v-model="form.username" size="medium" autocomplete="off" placeholder="请输入仓库账户" />
        </el-form-item>

        <el-form-item label="仓库密码" prop="token">
          <el-input v-model="form.password" size="medium" autocomplete="off" placeholder="请输入仓库密码" />
        </el-form-item>

        <el-form-item label="记录数量" prop="history_count">
          <el-input-number v-model="form.history_count" :min="3" :max="100"> </el-input-number>
        </el-form-item>

        <el-form-item label="仓库描述" prop="desc">
          <el-input v-model="form.desc" type="textarea" :rows="4" />
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
import { getImageRegistries, addImageRegistry, updateImageRegistry, deleteImageRegistry, connectImageRegistry } from '@/api/service/image_registry.js';
export default {
  data() {
    return {
      list: [], //镜像仓库列表
      form: {},
      types:[],
      dialog: false,
      updateDialog: false,
      insertDialog: false,
      loading: true,
      rules: {
        protocol: [{ required: true, trigger: 'blur', message: '仓库协议不能为空' }],
        name: [{ required: true, trigger: 'blur', message: '仓库名称不能为空' }],
        host: [{ required: true, trigger: 'blur', message: '仓库地址不能为空' }],
        username: [{ required: true, trigger: 'blur', message: '仓库token不能为空' }],
        history_count: [{ required: true, trigger: 'blur', message: '副本数量不能为空' }],
      }
    };
  },

  computed: {

  },
  created() {
    this.getList()
  },
  methods: {

    async getList() {
      this.list = await getImageRegistries();
      this.loading = false;
    },
    handleConnect(row) {
      const loading = this.$loading({
        lock: true,
        text: '连接测试中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      connectImageRegistry({id: row.id })
        .then(res => {
          this.$message({ type: 'success', message: '连接成功!' });
          loading.close();
        })
        .catch(() => {
          loading.close();
        });
    },
    // 处理新增按钮点击事件
    handleAdd() {
      this.form = { };
      this.insertDialog = true;
      this.updateDialog = false;
      this.dialog = true;
    },
    // 处理修改按钮点击事件
    handleUpdate(row) {
      this.insertDialog = false;
      this.updateDialog = true;
      this.form = this.deepClone(row);
      this.form.password = ""
      this.dialog = true;

    },
    // 处理删除行事件
    handleDelete(row) {
      this.$confirm('此操作将删除该镜像仓库, 是否继续?', '提示', { type: 'warning' }).then(() => {
        deleteImageRegistry({ id: row.id })
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
          addImageRegistry(params).then(res => {
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
          updateImageRegistry(params).then(res => {
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
