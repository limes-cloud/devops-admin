<template>
  <div>
    <el-card class="box-card">
      <el-row :gutter="10" class="mb8">
        <el-col v-permission="'service:code_registry:add'" :span="1.5"><el-button type="primary" icon="el-icon-plus" size="small" @click="handleAdd">新增</el-button></el-col>
      </el-row>
      <el-table v-loading="loading" :data="list" v-permission="'service:code_registry:all'">
        <el-table-column label="仓库名" align="center" prop="name" :show-overflow-tooltip="true" />
        <el-table-column label="仓库类型" align="center" prop="type" :show-overflow-tooltip="true" />
        <el-table-column label="仓库地址" align="center" prop="host" :show-overflow-tooltip="true" />
        <el-table-column label="下载方式" align="center" prop="clone_type" :show-overflow-tooltip="true" />
        <el-table-column label="仓库token" align="center" prop="token" :show-overflow-tooltip="true" />
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
            <el-button slot="reference" v-permission="'service:code_registry:connect'" size="small" type="text" icon="el-icon-sort" @click="handleConnect(scope.row)">
              连接测试
            </el-button>
            <el-button v-permission="'service:code_registry:update'" size="small" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
            <el-button v-permission="'service:code_registry:delete'" size="small" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--代码仓库管理面板-->
    <el-dialog width="400px" :title="insertDialog ? '新增代码仓库配置' : '修改代码仓库配置'" :visible.sync="dialog">
      <el-form ref="form" :model="form" label-width="80px" :rules="rules">

        <el-form-item label="仓库名称" prop="name">
          <el-input v-model="form.name" size="medium" autocomplete="off" placeholder="请输入仓库名称" />
        </el-form-item>

        <el-form-item label="仓库类型" prop="type" size="medium">
          <el-select v-model="form.type">
            <el-option v-for="tp in types" :key="tp" :label="tp" :value="tp">{{ tp }}</el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="仓库地址" prop="host">
          <el-input v-model="form.host" size="medium" autocomplete="off" placeholder="请输入仓库地址" />
        </el-form-item>

        <el-form-item label="token" prop="token">
          <el-input v-model="form.token" size="medium" autocomplete="off" placeholder="请输入仓库token" />
        </el-form-item>

        <el-form-item label="下载方式" prop="clone_type" size="medium">
          <el-select v-model="form.clone_type">
            <el-option v-for="tp in cloneTypes" :key="tp" :label="tp" :value="tp">{{ tp }}</el-option>
          </el-select>
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
import { getCodeRegistries, getCodeRegistryCloneTypes,getCodeRegistryTypes,addCodeRegistry, updateCodeRegistry, deleteCodeRegistry, connectCodeRegistry } from '@/api/service/code_registry.js';
export default {
  data() {
    return {
      list: [], //代码仓库列表
      form: {},
      types:[],
      cloneTypes:[],
      dialog: false,
      updateDialog: false,
      insertDialog: false,
      loading: true,

      rules: {
        name: [{ required: true, trigger: 'blur', message: '仓库名称不能为空' }],
        type: [{ required: true, trigger: 'blur', message: '仓库类型不能为空' }],
        host: [{ required: true, trigger: 'blur', message: '仓库地址不能为空' }],
        clone_type: [{ required: true, trigger: 'blur', message: '仓库下载类型不能为空' }],
      }
    };
  },

  computed: {

  },
  created() {
    this.getList()
    this.getTypes()
    this.getCloneTypes()
  },
  methods: {
    // 获取查询列表 使用异步函数处理
    async getTypes() {
      this.types = await getCodeRegistryTypes();
    },
    async getCloneTypes() {
      this.cloneTypes = await getCodeRegistryCloneTypes();
    },
    async getList() {
      this.list = await getCodeRegistries();
      this.loading = false;
    },
    handleConnect(row) {
      const loading = this.$loading({
        lock: true,
        text: '连接测试中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      connectCodeRegistry({id: row.id })
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
      this.form.token = ""
      this.dialog = true;
    },
    // 处理删除行事件
    handleDelete(row) {
      this.$confirm('此操作将删除该代码仓库, 是否继续?', '提示', { type: 'warning' }).then(() => {
        deleteCodeRegistry({ id: row.id })
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
          addCodeRegistry(params).then(res => {
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
          updateCodeRegistry(params).then(res => {
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
