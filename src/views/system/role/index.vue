<template>
  <div>
    <el-card class="box-card">
      <el-form ref="queryForm" v-permission="'system:role:list'" :model="queryParams" :inline="true" label-width="68px">
        <el-form-item label="角色名称"><el-input v-model="queryParams.name" placeholder="请输入角色名称" clearable size="small" @keyup.enter.native="handleQuery" /></el-form-item>
        <el-form-item label="角色标志">
          <el-input v-model="queryParams.keyword" placeholder="请输入角色标志" clearable size="small" @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="角色状态">
          <el-select v-model="queryParams.status" placeholder="请选择" size="small">
            <el-option label="正常" value="true" />
            <el-option label="禁用" value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
        </el-form-item>

        <el-form-item v-permission="'system:role:add'">
          <el-button type="primary" icon="el-icon-plus" size="small" @click="handleAddRole">新增</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="list">
        <el-table-column label="角色名称" align="center" prop="name" :show-overflow-tooltip="true" />
        <el-table-column label="角色标志" align="center" prop="keyword" :show-overflow-tooltip="true" />
        <el-table-column label="角色权重" align="center" prop="weight" :show-overflow-tooltip="true" />
        <el-table-column label="状态" align="center">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.status" :disabled="scope.row.id === 1" active-text="正常" inactive-text="禁用" @change="handleStatusChange(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="创建者" align="center" prop="operator" :show-overflow-tooltip="true" />
        <el-table-column label="创建时间" align="center" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span>{{ scope.row.created_at | parseTime}}</span>
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
            <div v-if="scope.row.id !== 1">
              <el-button v-permission="'system:role:menu'" size="mini" type="text" icon="el-icon-postcard" @click="handleMenu(scope.row)">菜单</el-button>
              <el-button v-permission="'system:role:update'" size="mini" type="text" icon="el-icon-edit" @click="handleUpdateRole(scope.row)">修改</el-button>
              <el-button v-permission="'system:role:delete'" size="mini" type="text" icon="el-icon-delete" @click="handleDeleteRole(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--角色管理面板-->
    <el-dialog width="500px" :title="insertRoleDialog ? '新增角色' : '修改角色'" :visible.sync="roleDialog">
      <el-form ref="form" :model="roleForm" label-width="80px" :rules="rules">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" :disabled="!insertRoleDialog" size="medium" autocomplete="off" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="权限标识" prop="keyword">
          <el-input v-model="roleForm.keyword" :disabled="!insertRoleDialog" size="medium" autocomplete="off" placeholder="请输入权限标识" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="角色权重">
              <el-input-number v-model="roleForm.weight" size="medium" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色状态">
              <el-radio-group v-model="roleForm.status">
                <el-radio :label="true">正常</el-radio>
                <el-radio :label="false">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="数据权限" prop="data_scope">
          <el-select v-model="roleForm.data_scope" size="medium" placeholder="请选择数据权限">
            <el-option v-for="(item, index) in dataScope" :key="index" :label="item" :value="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="roleForm.data_scope=='CUSTOM'" label="选择部门" prop="data_scope">
          <SelectTeam :team="[teamTree]" :keys="curchooseKeys" @confirm="chooseTeam"></SelectTeam>
        </el-form-item>
        <el-form-item label="角色备注"><el-input v-model="roleForm.description" type="textarea" /></el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="roleDialog = false">取 消</el-button>
        <el-button type="primary" v-if="insertRoleDialog" @click="insertRole">确 定</el-button>
        <el-button type="primary" v-if="updateRoleDialog" @click="updateRole">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 修改角色 -->
    <el-dialog title="角色菜单" :visible.sync="menuDialog" width="500px">
      <el-form ref="form" :model="roleForm" label-width="80px" :rules="rules">
        <el-form-item label="角色名称"><el-input v-model="roleForm.name" :disabled="true" size="medium" autocomplete="off" placeholder="请输入角色名称" /></el-form-item>
        <el-form-item label="权限标识"><el-input v-model="roleForm.keyword" :disabled="true" size="medium" autocomplete="off" placeholder="请输入权限标识" /></el-form-item>
        <el-form-item label="角色菜单">
          <div class="tree-box">
            <el-tree ref="menu" node-key="id" :data="[menuTree]" show-checkbox :check-strictly="false" :props="{ label: 'title' }"></el-tree>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="menuDialog = false">取 消</el-button>
        <el-button type="primary" @click="updateRoleMenu(roleForm.id)">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import SelectTeam from '../components/SelectTeam.vue';
import { getRoles, addRole, updateRole, deleteRole, dataScope, addRoleMenu, getRoleMenuIds } from '@/api/system/role.js';
import { getTeams } from '@/api/system/team.js';
import { getMenus } from '@/api/system/menu.js';
let tra = [];
let is_tra = false;
export default {
  components: { SelectTeam },
  data() {
    return {
      list: [], //角色列表
      roleForm: {},
      roleDialog: false,
      updateRoleDialog: false,
      insertRoleDialog: false,
      dataScope: {},
      teamTree: {},
      curchooseKeys: [],
      roleMenuIds: [],
      loading: true,
      queryParams: {  // 查询所需要的条件
        name: null,
        keyword: null,
        status: null
      },
      total: 0, // 数据总数量
      menuTree: {},  // 修改或删除的 弹框
      menuDialog: false,
      rules: {
        name: [{required: true,trigger: 'blur',message: '角色名称不能为空'}],
        keyword: [{required: true,trigger: 'blur',message: '角色标识不能为空'}],
        data_scope: [{required: true,trigger: 'blur',message: '数据权限不能为空'}]
      }
    };
  },
  created() {
    this.getList()
    this.init();
  },
  methods: {
    async init() {
      this.dataScope = await dataScope()
      this.teamTree = await getTeams()
      this.menuTree = await getMenus({is_filter:true})
    },
    chooseTeam(keys) {
      this.curchooseKeys = keys;
    },
    updateRoleMenu: function(role_id) {
      const checkedKeys = this.$refs.menu.getHalfCheckedKeys();
      const halfCheckedKeys = this.$refs.menu.getCheckedKeys();
      checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys); //合并选中的 以及半选中的菜单的id
      addRoleMenu({
        role_id: role_id,
        menu_ids: checkedKeys
      }).then(res => {
        this.menuDialog = false;
        this.$message({ message: '修改成功', type: 'success' });
      });
    },

    async getList() {
      this.list = await getRoles(this.queryParams);
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
      this.queryParams = {
        role_name: null,
        role_key: null,
        status: null
      };
    },
    // 处理switch 状态的改变
    handleStatusChange(row) {
      const text = row.status === false ? '禁用 ' : '启用';
      this.$confirm('确认要' + text + '"' + row.name + '"角色吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function() {
          return updateRole({ id: row.id, status: row.status });
        })
        .then(() => {
          this.$message({ message: text + '成功', type: 'success' });
        })
        .catch(function() {
          row.status = row.status === false;
        });
    },
    // 处理新增按钮点击事件
    handleAddRole() {
      this.roleForm = { status: true, weight: 0 };
      this.insertRoleDialog = true;
      this.updateRoleDialog = false;
      this.roleDialog = true;
      this.curchooseKeys = [];
    },
    // 处理修改按钮点击事件
    handleUpdateRole(row) {
      this.insertRoleDialog = false;
      this.updateRoleDialog = true;
      this.roleDialog = true;

      this.roleForm = this.deepClone(row);
      if (this.roleForm.data_scope == 'CUSTOM') {
        if (this.roleForm.team_ids==""){
          this.curchooseKeys = []
        }else{
          this.curchooseKeys = JSON.parse(this.roleForm.team_ids);
        }
      }
    },

    // 处理菜单
    async handleMenu(row) {
      this.menuDialog = true;
      this.roleForm = this.deepClone(row);
      let keys = await getRoleMenuIds({ role_id: row.id });
      keys = keys ? keys:[]

      let setCheckedKeys = ()=> {
        let ids = this.getTreeIds(this.menuTree);
        for (let i in ids) {
          let id = ids[i];
          this.$refs.menu.setChecked(id, keys.indexOf(id) != -1);
        }
      }
      setCheckedKeys()
    },
    // 处理删除行事件
    handleDeleteRole(row) {
      this.$confirm('此操作将删除该角色, 是否继续?', '提示', { type: 'warning' }).then(() => {
        deleteRole({ id: row.id })
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
    insertRole() {
      this.$refs.form.validate(valid => {
        if (valid) {
          var params = this.deepClone(this.roleForm);
          if (this.roleForm.data_scope == 'CUSTOM') {
            params.team_ids = JSON.stringify(this.curchooseKeys);
          }
          addRole(params).then(res => {
            this.$message({ message: '新增成功', type: 'success' });
            this.getList();
            this.roleDialog = false;
          });
        }
      });
    },
    // 处理更新数据
    updateRole() {
      this.$refs.form.validate(valid => {
        if (valid) {
          var params = this.deepClone(this.roleForm);
          if (this.roleForm.data_scope == 'CUSTOM') {
            params.team_ids = JSON.stringify(this.curchooseKeys);
          }
          updateRole(params).then(res => {
            this.$message({ message: '更新成功', type: 'success' });
            this.getList();
            this.roleDialog = false;
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
