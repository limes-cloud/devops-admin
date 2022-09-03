<template>
  <div>
    <el-card class="box-card">
      <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
        <el-form-item label="模板名称">
          <el-input v-model="queryParams.name" placeholder="请输入模板名称" clearable size="small" @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="模板类型"  size="medium">
          <el-select v-model="queryParams.type">
            <el-option v-for="tp in types" :key="tp" :label="tp" :value="tp">{{ tp }}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
          <el-button v-permission="'service:release:add'" type="primary" icon="el-icon-plus" size="small" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="list" v-permission="'service:release:page'">
        <el-table-column label="release名称" align="center" prop="name" :show-overflow-tooltip="true" />
        <el-table-column label="release描述" align="center" prop="desc" :show-overflow-tooltip="true" />
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
            <el-button slot="reference"  size="small" type="text" icon="el-icon-tickets" @click="handleTemplate(scope.row)">查看模板</el-button>
            <el-button v-permission="'service:release:update'" size="small" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
            <el-button v-permission="'service:release:delete'" size="small" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
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

    <!--代码release管理面板-->
    <el-dialog width="800px" :title="insertDialog ? '新增代码模板配置' : '修改代码模板配置'" :visible.sync="dialog">
      <el-form ref="form" :model="form" label-width="120px" :rules="rules">

        <el-form-item label="模板名称" prop="name">
          <el-input v-model="form.name" size="medium" autocomplete="off" placeholder="请输入模板名称" />
        </el-form-item>

        <el-form-item label="模板类型"   prop="type">
          <el-select v-model="form.type" size="medium">
            <el-option v-for="tp in types" :key="tp" :label="tp" :value="tp">{{ tp }}</el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="模板内容" prop="template">
          <div class="codeEditBox">
              <editor
                class="editor"
                v-model="form.template"
                @input="changeTemplate"
                @init="editorInit"
                lang="yaml"
                :options="editorOptions"
                theme="chrome"
                width="100%"
              ></editor>
            </div>
        </el-form-item>

        <el-form-item v-if="templateVariable.length" label="模板变量" prop="desc">
          <el-table  :data="templateVariable"  style="width: 100%" border>
            <el-table-column prop="keyword"  label="变量" width="180"></el-table-column>
            <el-table-column prop="label"  label="描述"></el-table-column>
          </el-table>
        </el-form-item>

        <el-form-item label="模板描述" prop="desc">
          <el-input v-model="form.desc" type="textarea" :rows="4" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialog = false">取 消</el-button>
        <el-button type="primary" v-if="insertDialog" @click="insert">确 定</el-button>
        <el-button type="primary" v-if="updateDialog" @click="update">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog width="800px" title="发布模板" :visible.sync="templateDialog">
        <editor
          v-model="template"
          @init="editorInit"
          lang="yaml"
          :options="editorOptions"
          theme="chrome"
          width="100%"
          height="450px"
          aria-disabled
        ></editor>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary"  @click="templateDialog=false">确 定</el-button>
        </div>
    </el-dialog>
  </div>
</template>
<script>
import editor from 'vue2-ace-editor';
import ace from 'brace';
import {getVariable} from "@/api/service/service.js"
import { getReleases,getReleaseTypes,addRelease, updateRelease, deleteRelease, connectRelease } from '@/api/service/release.js';
export default {
  components:{editor},
  data() {
    return {
      list: [], //代码release列表
      form: {},
      types:[],
      templateDialog:false,
      template:"",
      dialog: false,
      updateDialog: false,
      insertDialog: false,
      loading: true,
      rules: {
        name: [{ required: true, trigger: 'blur', message: '模板名称不能为空' }],
        type: [{ required: true, trigger: 'blur', message: '模板类型不能为空' }],
        template: [{ required: true, trigger: 'blur', message: '模板内容不能为空' }],
      },
      editorOptions: {
        // 设置代码编辑器的样式
        language:"yaml",
        enableBasicAutocompletion: true, //启用基本自动完成
        enableSnippets: false, // 启用代码段
        enableLiveAutocompletion: true, //启用实时自动完成
        tabSize: 1, //标签大小
        fontSize: 14, //设置字号
        showPrintMargin: true, //去除编辑器里的竖线
      },
      total:0,
      queryParams:{
        page:1,
        count:10,
        name:undefined,
      },
      templateVariable:[],
      variables:{},
    };
  },

  computed: {

  },
  created() {
    this.getVariable()
    this.getList()
    this.getReleaseTypes()
  },
  methods: {
    async getReleaseTypes(){
      this.types = await getReleaseTypes()
    },
     editorInit() {
          require('brace/theme/chrome');
          require('brace/ext/language_tools'); //language extension prerequsite...
          require('brace/mode/yaml');
          require('brace/snippets/yaml');

    },
    // 获取查询列表 使用异步函数处理
    async getVariable() {
      this.variables = await getVariable(this.queryParams);
    },
    async getList() {
      this.list = await getReleases(this.queryParams);
      this.loading = false;
    },
    // 处理查询事件
    handleQuery() {
      this.loading = true;
      this.queryParams.page = 1;
      this.getList();
    },
    resetQuery() {
      this.queryParams = {
        page: 1,
        count: 10,
        name: undefined
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
    handleTemplate(row) {
      this.template = row.template
      this.templateDialog = true
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
      this.getTemplateVariable(this.form.template)
      this.dialog = true;
    },
    changeTemplate(val){
      this.getTemplateVariable(val)
    },
    getTemplateVariable(text){
      var reg = /\{\w+}/g
      let list = text.match(reg);
      this.templateVariable = []
      let bucket = {}
      for(let i in list){
        let key = list[i].substr(1,list[i].length-2)
        if(this.variables[key] && !bucket[key]){
          bucket[key] = true
          this.templateVariable.push({keyword:key,label:this.variables[key]})
        }
      }
    },
    // 处理删除行事件
    handleDelete(row) {
      this.$confirm('此操作将删除该模板, 是否继续?', '提示', { type: 'warning' }).then(() => {
        deleteRelease({ id: row.id })
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
          addRelease(params).then(res => {
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
          updateRelease(params).then(res => {
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
<style scoped>
  .editor{
    min-height: 200px;
    height: auto;
    overflow-y:scroll;
  }
</style>
