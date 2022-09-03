<template>
  <div>
    <el-card class="box-card">
      <el-form ref="queryForm" v-permission="'notice:notice:query'" :model="queryParams" :inline="true" label-width="68px">
        <el-form-item label="通知名称"><el-input v-model="queryParams.title" placeholder="请输入通知标题" clearable size="small" @keyup.enter.native="handleQuery" /></el-form-item>
        <el-form-item label="通知状态">
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
        <el-col v-permission="'notice:notice:add'" :span="1.5"><el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button></el-col>
      </el-row>
      <el-table v-loading="loading" :data="list">
        <el-table-column label="cid" align="center" prop="id" :show-overflow-tooltip="true" />
        <el-table-column label="标题" align="center" prop="title" :show-overflow-tooltip="true" />
        <el-table-column label="规则" align="center">
          <template slot-scope="scope">
            <el-tag>{{findRuleName(scope.row.rule)}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="规则值" align="center" prop="value" :show-overflow-tooltip="true" />
        <el-table-column label="通知人员" align="center">
          <template slot-scope="scope">
            <div  v-for="(item,index) in scope.row.users">
              <el-tag :key="index">{{item.name}}({{item.team.name}})</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="通知通道" align="center">
          <template slot-scope="scope">
            <div  v-for="(item,index) in scope.row.channels">
              <el-tag :key="index">{{item.name}}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="通知状态" align="center">
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
        <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
          <template slot-scope="scope">
              <el-button v-permission="'notice:notice:update'" size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
              <el-button v-permission="'notice:notice:delete'" size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
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

    <!-- 修改通知 -->
    <el-dialog :title="insertDialog?'新增通知':'修改通知’'" :visible.sync="dialog" width="400px">
      <el-form ref="form" :model="form" label-width="80px" :rules="rules">
        <el-form-item prop="cid" label="通知cid"><el-input v-model="form.cid" size="medium" autocomplete="off" placeholder="请输入通知cid" /></el-form-item>
        <el-form-item prop="title" label="通知标题"><el-input v-model="form.title" size="medium" autocomplete="off" placeholder="请输入通知标题" /></el-form-item>
        <el-form-item prop="status" label="通知状态" v-if="updateDialog"><el-switch v-model="form.status"  active-text="正常" inactive-text="禁用" /></el-form-item>
        <el-form-item prop="rule" label="通知规则">
          <el-select  v-model="form.rule" placeholder="请选择规则">
            <el-option v-for="item in ruleOption" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="规则值" v-if="form.rule && form.rule!='default'"><el-input-number v-model="form.value" :min="1" ></el-input-number></el-form-item>
        <el-form-item prop="rule" label="通知通道">
          <el-select  v-model="form.channel_ids" multiple placeholder="请选择通道">
            <el-option v-for="item in channels" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="rule" label="通知人员">
          <el-select filterable remote :loading="searchLoading" :remote-method="searchUser" v-model="form.user_ids" multiple placeholder="请选择通道">
            <el-option v-for="item in users" :key="item.id" :label="item.name+'('+item.team.name+')'" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
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
import { getUsers as GetUser} from '@/api/system/user.js';
import { GetChannelFilter} from '@/api/notice/channel.js';
import { GetNotice,AddNotice,UpdateNotice,DeleteNotice} from '@/api/notice/notice.js';
export default {
  data() {
    return {
      list: [],
      form: {},
      dialog: false,
      updateDialog: false,
      insertDialog: false,
      loading: true,
      searchLoading:false,
      channels:[],
      users:[],
      queryParams: {
        page:1,
        count:10,
        title: null,
        status: null
      },
      ruleOption:[{"value":"default","label":"默认通知"},{"value":"lcount","label":"限次通知"},{"value":"ltime","label":"限时通知（秒）"}],
      total: 0, // 数据总数量
      rules: {
        cid: [{required: true,trigger: 'blur',message: '通知cid不能为空'}],
        title: [{required: true,trigger: 'blur',message: '通知标题不能为空'}],
        rule: [{required: true,trigger: 'blur',message: '通知规则不能为空'}],
      }
    };
  },
  computed: {},
  created() {
    this.getChannels()
    this.getList()
  },
  methods: {
    findRuleName(rule){
      for(let i in this.ruleOption){
        if (this.ruleOption[i].value == rule){
          return  this.ruleOption[i].label
        }
      }
    },
    async getChannels() {
      this.channels= await GetChannelFilter(this.queryParams);
    },
    async getList() {
      let data = await GetNotice(this.queryParams);
      this.loading = false;
      this.total = data.total;
      this.list = data.list
    },
    searchUser(query){
      if (query.trim() == '') {
          return
      }
      this.searchLoading = true;
      GetUser({name:query,page:1,count:10}).then(res=>{
        this.users = res.list
        this.searchLoading = false
      })
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
    // 处理新增按钮点击事件
    handleAdd() {
      this.form = {status:false};
      this.insertDialog = true;
      this.updateDialog = false;
      this.dialog = true;
    },
    // 处理修改按钮点击事件
    handleUpdate(row) {
      this.form = this.deepClone(row);
      this.form.user_ids = JSON.parse(row.user_ids)
      this.users = row.users
      this.form.channel_ids = []
      for(let i in this.form.channels){
        this.form.channel_ids.push(this.form.channels[i].id)
      }
      this.insertDialog = false;
      this.updateDialog = true;
      this.dialog = true;
    },
    // 处理删除行事件
    handleDelete(row) {
      this.$confirm('此操作将删除该通知, 是否继续?', '提示', { type: 'warning' }).then(() => {
        DeleteNotice({ id: row.id })
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
          let data = this.deepClone(this.form)
          data.user_ids = JSON.stringify(data.user_ids)
          AddNotice(data).then(res => {
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
          let data = this.deepClone(this.form)
          data.user_ids = JSON.stringify(data.user_ids)
          UpdateNotice(data).then(res => {
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
