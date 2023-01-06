<template>
  <div>
    <el-card class="box-card" v-permission="'system:menu:tree'">
      <!-- default-expand-all -->
      <el-table v-loading="loading" :data="List" row-key="id"  :tree-props="{ children: 'children' }">
        <el-table-column label="菜单名称" align="left" width="250" prop="icon" >
          <template slot-scope="scope">
            <i v-if="scope.row.icon" :class="'el-icon-' + scope.row.icon" />
            {{scope.row.title}}
          </template>
        </el-table-column>
        <el-table-column label="路径/接口" align="left" prop="path" :show-overflow-tooltip="true" />
        <el-table-column label="类型" align="left" prop="hidden" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <el-tag effect="dark" v-if="scope.row.type === 'R'" type="primary">根菜单</el-tag>
            <el-tag effect="dark" v-if="scope.row.type === 'M'" type="primary">菜单</el-tag>
            <el-tag  effect="dark" v-if="scope.row.type === 'A'" type="warning">接口 | {{scope.row.method}}</el-tag>
            <el-tag  effect="dark" v-if="scope.row.type === 'G'" type="success">接口组</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否隐藏" align="left" prop="hidden" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <el-tag effect="dark" v-if="scope.row.hidden === false" type="success">
              {{scope.row.type==='A'?'-- --':'可见'}}
            </el-tag>
            <el-tag effect="dark" v-else type="danger">隐藏</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="修改时间" align="left" prop="hidden" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            {{scope.row.updated_at | parseTime}}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="left" width="240" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <div >
              <el-button v-permission="'system:menu:add'" size="mini" type="text" icon="el-icon-plus" @click="handleAdd(scope.row)">新增</el-button>
              <el-button v-if="scope.row.type != 'R'" v-permission="'system:menu:update'" size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
              <el-button v-if="scope.row.type != 'R'" v-permission="'system:menu:delete'" size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
              </div>
            </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/修改角色 -->
    <el-dialog :title="insertDialog ? '新增菜单' : '修改菜单'" :visible.sync="Dialog" width="600px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="上级菜单">
          <el-autocomplete :value="parentTitle" placeholder="请输入内容" :fetch-suggestions="getMenuList">
            <i slot="suffix" class="el-icon-close el-input__icon" />
            <template slot-scope="{ item }">
              <el-tree :data="item" :props="{ children: 'children', label: 'title' }" @node-click="handleNodeClick" />
            </template>
          </el-autocomplete>
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="菜单标题" prop="title"><el-input v-model="form.title" size="medium" placeholder="请输入菜单标题" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="weight"><el-input-number v-model="form.weight" size="medium" controls-position="right" :min="0" /></el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="菜单类型" prop="type">
              <el-radio-group v-model="form.type">
                <el-radio label="M" value="M">菜单</el-radio>
                <el-radio label="A" value="A">接口</el-radio>
                <el-radio label="G" value="G">接口组</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24" v-if="form.type == 'A'">
            <el-form-item label="请求方式">
              <el-radio-group v-model="form.method">
                <el-radio label="GET">GET</el-radio>
                <el-radio label="POST">POST</el-radio>
                <el-radio label="PUT">PUT</el-radio>
                <el-radio label="DELETE">DELETE</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="form.type == 'A' || form.type == 'G'">
          <el-col :span="12">
            <el-form-item label="权限标识"><el-input v-model="form.permission" size="medium" placeholder="请权限标识" maxlength="50" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="路由地址" prop="path"><el-input v-model="form.path" size="medium" placeholder="请输入路由地址" /></el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24" v-if="form.type === 'M'">
            <el-form-item label="菜单图标">
              <el-popover placement="bottom-start" width="460" trigger="click" @show="$refs['iconSelect'].reset()">
                <IconSelect ref="iconSelect" @selected="handleIconSelect" />
                <el-input slot="reference" v-model="form.icon" size="medium" placeholder="点击选择图标" readonly>
                  <i v-if="form.icon" style="height: 32px;width: 16px;" :class="'el-icon-' + form.icon" />
                </el-input>
              </el-popover>
            </el-form-item>
          </el-col>

        </el-row>
        <el-row v-if="form.type === 'M'">
          <el-col :span="12">
            <el-form-item label="路由名称" prop="name"><el-input v-model="form.name" size="medium" placeholder="请输入路由名称" /></el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="组件路径" prop="component"><el-input v-model="form.component" size="medium" placeholder="请输入组件路径" /></el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="是否外链">
              <el-radio-group v-model="form.is_frame">
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="路由地址" prop="path"><el-input v-model="form.path" size="medium" placeholder="请输入路由地址" /></el-form-item>
          </el-col>
        </el-row>

        <el-row  v-if="form.type === 'M'">
          <el-col :span="12">
            <el-form-item label="菜单状态">
              <el-radio-group v-model="form.hidden">
                <el-radio :label="false">显示</el-radio>
                <el-radio :label="true">隐藏</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="跳转地址" prop="redirect"><el-input v-model="form.redirect" size="medium" placeholder="请输入跳转地址" /></el-form-item>
          </el-col>
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
import { getMenus, addMenu, updateMenu, deleteMenu } from '@/api/system/menu.js';
import IconSelect from '@/components/IconSelect';

export default {
  name: 'Menu',
  components: { IconSelect },
  data() {
    return {
      loading: true,
      List: [], // 数据信息

      // 修改或删除的 弹框
      Dialog: false,
      updateDialog: false,
      insertDialog: true,
      parentTitle: '',
      form: {},
      rules: {
        title: [{ required: true, message: '菜单名称不能为空', trigger: 'blur' }],
        weight: [{ required: true, message: '菜单排序不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '菜单类型不能为空', trigger: 'blur' }]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    handleIconSelect(name) {
      this.form.icon = name;
      this.$forceUpdate();
    },
    // 处理选择上级菜单
    handleNodeClick(data) {
      this.parentTitle = data.title;
      this.form.parent_id = data.id;
    },
    // 获取上级菜单列表
    getMenuList(queryString, cb) {
      cb([this.List]);
    },
    // 获取查询列表 使用异步函数处理
    async getList() {
      const data = await getMenus();
      this.List = [data];
      this.loading = false;
    },
    // 处理新增按钮点击事件
    handleAdd(row) {
      this.form = { type: 'M', weight: 0, hidden: false, is_frame: false };
      this.insertDialog = this.Dialog = true;
      this.updateDialog = false;
      this.parentTitle = row.title;
      this.form.parent_id = row.id;
    },
    // 处理新增按钮点击事件
    handleUpdate(row) {
      var node = this.getTreeNode(this.List[0], row.parent_id);
      if (node) {
        this.parentTitle = node.title;
      }
      this.updateDialog = this.Dialog = true;
      this.insertDialog = false;
      this.form = this.deepClone(row)
    },
    // 处理删除行事件
    handleDelete(row) {
      this.$confirm('此操作将删除该菜单, 是否继续?', '提示', { type: 'warning' }).then(() => {
        deleteMenu({ id: row.id }).then(res => {
            this.$message({ type: 'success', message: "删除成功"});
            this.getList();
          })
      });
    },
    // 处理插入数据的
    insertData() {
      this.$refs.form.validate(valid => {
        if (valid) {
          // 处理提交相关的请求
          this.form.menu_id = undefined;
          this.form.status = Boolean(this.form.status);
          addMenu(this.form).then(res => {
            this.$message({ message: '添加成功', type: 'success' });
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
          updateMenu(this.form).then(res => {
            this.getList();
            this.$message({ message: '修改成功', type: 'success' });
            this.Dialog = false;
          });
        }
      });
    }
  }
};
</script>
