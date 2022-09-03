<template>
  <div>
    <el-card class="box-card">
      <el-row :gutter="10" class="mb8">
        <el-col v-permission="'configure:environment:add'" :span="1.5"><el-button type="primary" icon="el-icon-plus" size="small" @click="handleAddEnv">新增</el-button></el-col>
      </el-row>
      <el-table v-loading="loading" :data="list" v-permission="'configure:environment:all'">
        <el-table-column label="标志符" align="center" prop="env_keyword" :show-overflow-tooltip="true" >
        </el-table-column>
        <el-table-column label="环境名" align="center" :show-overflow-tooltip="true" >
          <template slot-scope="scope">
           {{ envName( scope.row.env_keyword)}}
          </template>
        </el-table-column>
        <el-table-column label="中间件" align="center" prop="drive" :show-overflow-tooltip="true" />
        <el-table-column label="存储前缀" align="center" prop="prefix" :show-overflow-tooltip="true" />

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
            <el-button slot="reference" v-permission="'configure:environment:connect'" size="small" type="text" icon="el-icon-sort" @click="handleConnectEnv(scope.row)">
              连接测试
            </el-button>
            <el-button v-permission="'configure:environment:update'" size="small" type="text" icon="el-icon-edit" @click="handleUpdateEnv(scope.row)">修改</el-button>
            <el-button v-permission="'configure:environment:delete'" size="small" type="text" icon="el-icon-delete" @click="handleDeleteEnv(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--环境管理面板-->
    <el-dialog width="400px" :title="insertEnvDialog ? '新增环境配置' : '修改环境配置'" :visible.sync="dialog">
      <el-form ref="form" :model="form" label-width="80px" :rules="rules">
        <el-form-item label="所属环境" prop="env_keyword" size="medium">
          <el-select v-if="insertEnvDialog" v-model="form.env_keyword">
            <el-option v-for="(item, index) in createEnvs" :key="index" :label="item.name" :value="item.keyword">{{ item.name }}</el-option>
          </el-select>
          <el-select v-else v-model="form.env_keyword" disabled>
            <el-option v-for="(item, index) in envs" :key="index" :label="item.name" :value="item.keyword">{{ item.name }}</el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="路径前缀" prop="prefix">
          <el-input v-model="form.prefix" size="medium" autocomplete="off" placeholder="请输入路径前缀" />
        </el-form-item>

        <el-form-item label="中间件" prop="drive">
          <el-select v-model="form.drive">
            <el-option v-for="(item, index) in driveList" :key="index" :value="item">{{ item }}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="连接token" prop="token"><el-input v-model="form.token" /></el-form-item>
        <el-form-item label="连接配置" prop="config"><el-input v-model="form.config" type="textarea" :rows="4" /></el-form-item>
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
import { getFilterEnvs as Envs } from '@/api/service/environment.js';
import { getEnvs, addEnv, updateEnv, deleteEnv, ConnectEnv } from '@/api/configure/environment.js';
export default {
  data() {
    return {
      driveList: ['etcd', 'consul', 'zk'],
      list: [], //环境列表
      form: {},
      envs:[],
      createEnvs:[],
      dialog: false,
      updateEnvDialog: false,
      insertEnvDialog: false,
      loading: true,
      rules: {
        env_keyword: [{ required: true, trigger: 'blur', message: '所属环境不能为空' }],
        drive: [{ required: true, trigger: 'blur', message: '环境中间件不能为空' }],
        config: [{ required: true, trigger: 'blur', message: '配置不能为空' }],
        prefix: [{ required: true, trigger: 'blur', message: '路径前缀不能为空' }],
      },
      connectStatus: undefined
    };
  },

  computed: {
    envName(){
      return function(key){
        for(let i in this.envs){
          if(this.envs[i].keyword===key){
            return this.envs[i].name
          }
        }
      }
    }
  },
  created() {
    this.Envs();

  },
  methods: {
    async Envs(){
      this.envs = await Envs();
      this.getEnvs();
    },

    // 获取查询列表 使用异步函数处理
    async getEnvs() {
      this.list = await getEnvs();
      this.createEnvs = []
      // 计算哪些可以创建
      let keywords = []
      for(let i in this.list){
        keywords.push(this.list[i].env_keyword)
      }

      for(let i in this.envs){
        if(keywords.indexOf(this.envs[i].keyword) === -1){
          this.createEnvs.push(this.envs[i])
        }
      }

      this.loading = false;
    },

    handleConnectEnv(row) {
      const loading = this.$loading({
        lock: true,
        text: '连接测试中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      ConnectEnv({keyword: row.env_keyword })
        .then(res => {
          this.$message({ type: 'success', message: '连接成功!' });
          loading.close();
        })
        .catch(() => {
          loading.close();
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
