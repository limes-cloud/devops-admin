<template>
  <div>
    <el-card class="box-card" v-permission="'system:user:page'">
      <el-form ref="queryForm"  :model="queryParams" :inline="true" label-width="68px">
        <el-form-item label="人员名称" prop="name">
          <el-input v-model="queryParams.name" placeholder="请输入人员名称" clearable size="small" @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="电话号码" prop="phone">
          <el-input v-model="queryParams.phone" placeholder="请输入电话号码" clearable size="small" @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="用户邮箱" prop="email">
          <el-input v-model="queryParams.email" placeholder="请输入用户邮箱" clearable size="small" @keyup.enter.native="handleQuery" />
        </el-form-item>
       <el-form-item label="用户状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择" size="small">
            <el-option label="正常" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
        <el-col v-permission="'system:user:add'" :span="1.5"><el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button></el-col>
      </el-row>
      <el-table v-loading="loading" :data="List" @selection-change="handleSelectionChange">
        <el-table-column label="姓名" width="50" align="center" prop="name" />
        <el-table-column label="电话" align="center" prop="phone" :show-overflow-tooltip="true" />
        <el-table-column label="邮箱" align="center" prop="email" :show-overflow-tooltip="true" />
        <el-table-column label="部门" align="center" prop="team_name" :show-overflow-tooltip="true" />
        <el-table-column label="角色" align="center" prop="role_name" :show-overflow-tooltip="true" />
        <el-table-column label="状态" align="center" width="200px">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.status" active-text="正常" inactive-text="禁用"  @change="handleStatusChange(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="创建者" align="center" prop="operator" :show-overflow-tooltip="true" />
        <el-table-column label="创建时间" align="center" prop="created_at" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ scope.row.created_at | parseTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="角色名称" align="center" prop="role_name" :show-overflow-tooltip="true" />
        <el-table-column label="所属部门" align="center" prop="team_name" :show-overflow-tooltip="true" />
        <el-table-column label="操作" align="center" width="220" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <div v-if="scope.row.id !== 1">
              <el-button v-permission="'system:user:update'" size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
              <el-button v-permission="'system:user:delete'" size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="block">
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

    <!-- 新增/修改角色 -->
    <el-dialog :title="insertDialog ? '新增人员' : '修改人员'" :visible.sync="Dialog" width="500px">
      <el-form ref="form" :model="form" label-width="80px" :rules="rules">
        <el-row>
          <el-col :span="12">
            <el-form-item label="人员名称" prop="name"><el-input v-model="form.name" size="medium" autocomplete="off" placeholder="请输入人员名称" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone"><el-input v-model="form.phone" size="medium" autocomplete="off" placeholder="请输入联系电话" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电子邮箱" prop="email"><el-input v-model="form.email" size="medium" autocomplete="off" placeholder="请输入电子邮箱" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属角色" prop="role_id">
              <el-select :disabled="form.role_id == 1 && form.id == 1" v-model="form.role_id" size="medium" placeholder="请选择所属角色">
                <el-option v-for="(item, index) in roleList" :key="index" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="insertDialog" label="登录密码" prop="password">
              <el-input v-model="form.password" size="medium" autocomplete="off" placeholder="请输入登录密码" />
            </el-form-item>
            <el-form-item v-if="updateDialog" label="登录密码"><el-input v-model="form.password" size="medium" autocomplete="off" placeholder="请输入登录密码" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="账号状态">
              <el-radio-group v-model="form.status">
                <el-radio :label="true">正常</el-radio>
                <el-radio :label="false">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属部门" prop="team_id">
              <el-cascader
                  v-model="form.team_id"
                  :props="{label:'name',value:'id',checkStrictly: true }"
                  :options="teamList"
                  @change="chooseTeam"
                  clearable></el-cascader>
            </el-form-item>
          </el-col>
<!--          <el-col  :span="24">
            <el-form-item label="账号头像">
              <el-upload
                v-loading="uploading"
                :element-loading-text="uploadtext"
                class="avatar-uploader"
                action="/"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="Upload"
              >
                <img v-if="form.avatar" :src="cosUrl + form.avatar" class="avatar" />
                <i v-else class="el-icon-plus avatar-uploader-icon" />
              </el-upload>
            </el-form-item>
          </el-col> -->
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="Dialog = false">取 消</el-button>
        <el-button v-if="insertDialog" type="primary" @click="insertData">确 定</el-button>
        <el-button v-if="updateDialog" type="primary" @click="updateData">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getUsers, updateUser, addUser, deleteUser} from '@/api/system/user.js';
import { getRoles} from '@/api/system/role.js';
import { getTeams} from '@/api/system/team.js';

import { upload, generateName } from '@/utils/cos/upload.js';
export default {
  name: 'User',
  data() {
    return {
      loading: true,
      uploading: false,
      uploadtext: '',
      btnDelete: true,
      btnExport: true,
      downloadLoading: false,
      downloadAllLoading: false,
      queryParams: {
        page: 1,
        count: 10,
        name: undefined,
        phone: undefined,
        status: undefined
      },
      List: [], // 数据信息
      Rows: [], // 选中的行数
      total: 0, // 数据总数量
      // 修改或删除的 弹框
      updateDialog: false,
      insertDialog: false,
      Dialog: false,
      form: {
        status: 1,
        weight: 0
      },
      roleList: [],
      teamList:[],
      rules: {
        name: [
          {
            required: true,
            message: '人员名称不能为空',
            trigger: 'blur'
          }
        ],
        phone: [
          {
            required: true,
            message: '联系电话不能为空',
            trigger: 'blur'
          }
        ],
        email: [
          {
            required: true,
            message: '邮箱不能为空',
            trigger: 'blur'
          },
          {
            type: 'email',
            message: '请输入正确的邮箱',
            trigger: 'blur'
          }
        ],
        role_id: [
          {
            required: true,
            message: '所属角色不能为空',
            trigger: 'blur'
          }
        ],
        team_id: [
          {
            required: true,
            message: '所属部门不能为空',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '登录密码不能为空',
            trigger: 'blur'
          }
        ]
      }
    };
  },
  created() {
    this.getList();
    // 初始化添加人员时 选怎角色
    this.init()
  },
  methods: {
    init(){
      getRoles().then(res=>{
        this.roleList = res.list;
      })
      getTeams().then(res=>{
        this.teamList = [res];
      })
    },
    chooseTeam(e){
      this.form.team_id = e[0]
    },
    handleSelect(item) {
      this.form.team_id = item.team_id;
    },
    // 获取查询列表 使用异步函数处理
    async getList() {
      const data = await getUsers(this.queryParams);
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
        role_name: undefined,
        role_key: undefined,
        status: undefined
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
    // 处理表格选中事件 rows为选中的行数据
    handleSelectionChange(rows) {
      this.Rows = rows;
      this.btnDelete = false;
      this.btnExport = false;
      for (const i in rows) {
        if (rows[i].user_id === 1) {
          this.btnDelete = true;
          break;
        }
      }
    },
    // 处理switch 状态的改变
    handleStatusChange(row) {
      const text = row.status === false ? '禁用 ' : '启用';
      this.$confirm('确认要"' + text + '""' + row.name + '"用户吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
          return updateUser(row);
      }).then(() => {
          this.$message({message: text + '成功',type: 'success'});
      }).catch(function() {
          row.status = row.status === false;
       });
    },
    // 处理删除行事件
    handleDelete(row) {
      this.$confirm('此操作将删除该用户, 是否继续?', '提示', { type: 'warning' }).then(() => {
        deleteUser({ id: row.id })
          .then(res => {
            this.$message({ type: 'success', message: '删除成功!' });
            this.getList();
          })
      });
    },
    // 处理新增按钮点击事件
    handleAdd() {
      this.form = { status: true, avatar:"logo.png" };
      this.updateDialog = false;
      this.Dialog = this.insertDialog = true;
    },
    // 处理新增按钮点击事件
    handleUpdate(row) {
      this.Dialog = this.updateDialog = true;
      this.insertDialog = false;
      this.form = JSON.parse(JSON.stringify(row));
    },
    insertData() {
      this.$refs.form.validate(valid => {
        if (valid) {
          addUser(this.form).then(res => {
            this.$message({ message: '添加成功', type: 'success' });
            this.getList();
            this.insertDialog = this.Dialog = false;
          });
        }
      });
    },
    // 处理更新数据
    updateData() {
      this.$refs.form.validate(valid => {
        if (valid) {
          updateUser(this.form).then(res => {
            this.$message({ message: '更新成功', type: 'success' });
            this.getList();
            this.updateDialog = this.Dialog = false;
          });
        }
      })
    },
    // 对接对象存储上传头像
    Upload(file, fileList) {
      var this_ = this;
      this.uploadtext = '准备上传中';
      this.uploading = true;
      var filename = generateName(file.name);
      upload(
        file.raw,
        'avatar',
        filename,
        function(res) {
          this_.uploadtext = '上传进度：' + res.percent * 100 + '%（' + res.speed + 'k/s）';
        },
        function(data) {
          this_.uploading = false;
          this_.uploadtext = '';
          this_.form.avatar = data.Location;
          console.log(this_.form.avatar);
        }
      )
    }

  }
};
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
