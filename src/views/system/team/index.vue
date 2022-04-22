<template>
  <div>
    <el-card class="box-card" v-permission="'system:team:list'">
      <el-table v-loading="loading" :data="List" default-expand-all row-key="id" :expand-row-keys="[1]" :tree-props="{ children: 'children' }">
        <el-table-column label="部门类型" align="center" prop="name" :show-overflow-tooltip="true" />
        <el-table-column label="创建者" align="center" prop="operator" :show-overflow-tooltip="true" />
        <el-table-column label="创建时间" align="center" prop="created_at" :show-overflow-tooltip="true" width="200px">
          <template slot-scope="scope">
            {{ scope.row.created_at | parseTime }}
          </template>
        </el-table-column>
        <!--<el-table-column label="人员管理" align="center" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <el-button v-permission="'system:team:add'" size="mini" type="text" icon="el-icon-s-check"
              @click="handleTeamPerson(scope.row.team_id)">
              管理
            </el-button>
          </template>
        </el-table-column> -->
        <el-table-column label="操作" align="center" width="220" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button v-permission="'system:team:add'" size="mini" type="text" icon="el-icon-plus" @click="handleAdd(scope.row)">新增</el-button>
            <el-button v-if="scope.row.id != 1" v-permission="'system:team:update'" size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
            <el-button v-if="scope.row.id != 1" v-permission="'system:team:delete'" size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/修改角色 -->
    <el-dialog :title="insertDialog ? '新增部门' : '修改部门'" :visible.sync="Dialog" width="600px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="上级菜单">
          <el-autocomplete :value="parentTitle" placeholder="请输入内容" :fetch-suggestions="getTeamList">
            <template slot-scope="{ item }">
              <el-tree :data="item" :props="{ children: 'children', label: 'name' }" @node-click="handleNodeClick" />
            </template>
          </el-autocomplete>
        </el-form-item>
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="部门描述" prop="description">
          <el-input v-model="form.description" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="Dialog = false">取 消</el-button>
        <el-button v-if="insertDialog" type="primary" @click="insertData">确 定</el-button>
        <el-button v-if="updateDialog" type="primary" @click="updateData">确 定</el-button>
      </div>
    </el-dialog>
    <!-- <el-dialog title="部门-用户列表" :visible.sync="teamDialog" fullscreen>
      <TeamList v-if="teamDialog" :team_id="team_id" />
    </el-dialog> -->
  </div>
</template>

<style scoped>
.el-autocomplete {
  width: 100%;
}
.el-autocomplete input {
  height: 36px;
  line-height: 36px;
}
</style>

<script>
import { addTeam, updateTeam, deleteTeam, getTeams } from '@/api/system/team.js';

export default {
  name: 'Team',
  data() {
    return {
      loading: true,
      uploading: false,
      uploadtext: '',
      List: [], // 数据信息
      // 修改或删除的 弹框
      Dialog: false,
      updateDialog: false,
      insertDialog: false,
      parentTitle: '',
      form: {},
      rules: {
        name: [
          {
            required: true,
            message: '部门名称不能为空'
          }
        ],
        parent_id: [
          {
            required: true,
            message: '部门类型不能为空'
          }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    // 处理选择上级菜单
    handleNodeClick(data) {
      this.parentTitle = data.name;
      this.form.parent_id = data.id;
    },
    getTeamList(queryString, cb) {
      cb([this.List]);
    },
    // 获取查询列表 使用异步函数处理
    async getList() {
      const data = await getTeams();
      this.List = [data];
      this.loading = false;
    },
    // 处理新增按钮点击事件
    handleAdd(row) {
      this.form = {};
      this.insertDialog = this.Dialog = true;
      this.updateDialog = false;
      this.parentTitle = row.name;
      this.form.parent_id = row.id;
    },
    // 处理修改按钮点击事件
    handleUpdate(row) {
      var node = this.getTreeNode(this.List[0], row.parent_id);
      if (node) {
        this.parentTitle = node.name;
      }
      this.updateDialog = this.Dialog = true;
      this.insertDialog = false;
      this.form = this.deepClone(row);
    },
    // 处理删除行事件
    handleDelete(row) {
      this.$confirm('此操作将删除该部门, 是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        deleteTeam({ id: row.id }).then(res => {
          this.$message({ type: 'success', message:"删除部门成功"});
          this.getList();
        });
      });
    },
    // 处理插入数据的
    insertData() {
      this.$refs.form.validate(valid => {
        if (valid) {
          addTeam(this.form).then(res => {
            this.$message({ message: "新增部门成功", type: 'success' });
            this.getList();
            this.Dialog = false;
          });
        }
      });
    },
    // 处理更新数据
    updateData() {
      this.$refs.form.validate(valid => {
        if (valid) {
          updateTeam(this.form).then(res => {
            this.$message({ message: '更新成功', type: 'success' });
            this.Dialog = false;
          });
        }
      });
    }
  }
};
</script>

<style scoped>
.upload-box {
  text-align: center;
}

.el-autocomplete input {
  height: 36px;
  line-height: 36px;
}

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
