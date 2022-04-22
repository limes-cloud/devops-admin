<template>
  <div>
    <el-card class="box-card">
      <div class="custom-card">
        <div class="service">
          <div class="select-input">
            <el-autocomplete
              v-model="value"
              size="small"
              :fetch-suggestions="querySearchAsync"
              value-key="show_name"
              placeholder="请输入服务"
              @select="handleSelect"
            ></el-autocomplete>
          </div>
          <div v-if="value">
            <div class="item">
              <span class="label">服务名：</span>
              <span>{{ curService.name }}</span>
            </div>
            <div class="item">
              <span class="label">服务标志：</span>
              <span>{{ curService.keyword }}</span>
            </div>
            <div class="item">
              <span class="label">当前版本：</span>
              <el-tag v-if="curConfigure.version" size="mini" type="success" effect="plain">{{ curConfigure.version }}</el-tag>
              <el-tag v-else type="success" size="mini" effect="plain">暂未配置</el-tag>
            </div>
            <div class="item">
              <span class="label">使用版本：</span>
              <el-tag v-if="useConfigure.version" size="mini" effect="plain">{{ useConfigure.version }}</el-tag>
              <el-tag v-else size="mini" effect="plain">暂未配置</el-tag>
            </div>
            <div class="item">
              <span class="label">修改人：</span>
              <span>{{ curConfigure.operator }}</span>
            </div>
          </div>
        </div>
        <div class="jsonEditor">
          <div class="header">
            <div class="header-item">
              <span class="label">版本选择</span>
              <el-select size="mini" v-model="configure_id" placeholder="请选择" @change="getConfigure">
                <el-option v-for="(item,index) in configureList" :key="index" :value="item.id" :label="version(item)">
                </el-option>
              </el-select>
            </div>
            <div class="header-item" v-permission="'configure:configure:add'">
              <el-button @click="submit" type="primary" size="mini">保存修改</el-button>
            </div>
            <div class="header-item" v-permission="'configure:configure:update'">
              <el-button @click="updateConfigure" type="primary" size="mini">使用模板</el-button>
            </div>
            <div class="header-item" v-permission="'configure:configure:parse'">
              <el-button @click="lookConfig" type="success" size="mini">查看配置</el-button>
            </div>
          </div>
          <vueJsonEditor class="edit" v-model="json" :mode="'code'" lang="zh" @json-change="iserror = false"  @has-error="iserror = true"></vueJsonEditor>
        </div>
      </div>
    </el-card>
    <el-dialog fullscreen title="配置详情" :visible.sync="dialog">
      <div class="config-box">
        <el-tabs v-model="env" @tab-click="handleChooseEnv">
            <el-tab-pane v-for="(item,index) in envs" :key="index" :label="item.name" :name="item.keyword">
              <vueJsonEditor class="edit" v-model="sceneJson" :mode="'code'" lang="zh" @json-change="iserror = false"  @has-error="iserror = true"></vueJsonEditor>
            </el-tab-pane>
         </el-tabs>
        <div slot="footer" style="margin-top: 10px;float: right;">
          <el-button  v-permission="'configure:configure:sync'" type="primary"  @click="syncConfigure">同步配置</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { allServices } from '@/api/configure/service.js';
import { getConfigure,syncConfigure,getParseConfigure, getConfigures, addConfigure,updateConfigure } from '@/api/configure/configure.js';
import vueJsonEditor from 'vue-json-editor';
import { getEnvs } from '@/api/configure/environment.js';
export default {
  components: { vueJsonEditor },
  data() {
    return {
      envs:[],
      env:{},
      dialog:false,
      iserror:false,
      serviceList: [], //服务列表
      curService: {},
      form: {},
      configure_id:null,
      dialog: false,
      updateEnvDialog: false,
      insertEnvDialog: false,
      loading: true,
      value: '',
      json: {},
      sceneJson:{},
      configureList: [],
      curConfigure: {},
      useConfigure: {},
      queryParams: {
        service_id: undefined
      }
    };
  },
  computed: {

  },
  created() {
    this.allServices();
    this.getEnvs()
  },
  methods: {
    //同步配置信息
    async syncConfigure(){
      await syncConfigure({env:this.env,id:this.curConfigure.id})
      this.$message.success("同步成功")
    },
    submit() {
      if(this.iserror){
        this.$message({ message: '模板格式错误，禁止提交', type: 'error' });
        return
      }
      this.$prompt('请输入更新备注', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
          this.insertData(value)
      })
    },
    async lookConfig(env){
      this.dialog = true
      if(typeof env !="string" ){
        this.env = this.envs[0].keyword
      }
      let data = await getParseConfigure({env:this.env,id:this.curConfigure.id})
      console.log(data.template)
      this.sceneJson = JSON.parse(data.template)
    },
    updateConfigure(){
       this.$confirm('确认要使用该模板配置吗?', '警告', {
         confirmButtonText: '确定',
         cancelButtonText: '取消',
         type: 'warning'
      }).then(()=> {
        let params = {
          id:this.curConfigure.id,
          is_use:true,
          service_name:this.curService.name,
          service_id:this.curService.id
        }
        return updateConfigure(params);
      }).then(() => {
        getConfigures({ service_id: this.curService.id })
        this.$message({ message: '使用成功', type: 'success' });
      })
    },
    version(item){
      return item.version+"-"+item.operator+"-"+this.parseTime(item.created_at)
    },
    insertData(desc){
      let params = {
        service_id: this.curService.id,
        service_name: this.curService.name,
        template: JSON.stringify(this.json),
        description:desc
      };

      addConfigure(params).then(async res => {
        this.$message({ message: '新增成功', type: 'success' });
        let conf = await getConfigures({ service_id: this.curService.id });
      });

    },
    async getConfigure(id) {
        this.curConfigure = await getConfigure({ id:id});
        this.curConfigure.version = this.curConfigure.version.split("-")[0]
        this.configure_id = id
        this.json = JSON.parse(this.curConfigure.template)
    },
    // 获取查询列表 使用异步函数处理
    async allServices() {
      const data = await allServices();
      this.serviceList = data.list;
      this.loading = false;
      if (!this.serviceList.length) {
        this.$message({ message: '当前暂无服务，请先添加', type: 'error' });
        return;
      }
      // 默认情况下，读取第一个服务的配置
      const item = this.serviceList[0];
      this.value = item.name + '(' + item.keyword + ')';
      this.curService = item
      //获取指定服务的全部服务列表
      this.getConfigures(item.id)
    },
    async getConfigures(service_id){
      let conf = await getConfigures({ service_id:service_id});
      this.configureList = conf.list;
      if (!this.configureList.length) {
        this.$message({ message: '当前服务暂未添加配置', type: 'error' });
        return;
      }
      // 查询目前正在使用的版本
      for (let i in this.configureList) {
        var item = this.configureList[i]
        item.version = item.version.split("-")[0]
        if (item.is_use)
          this.useConfigure = item;
      }
      //查询出正在使用的或者自后一个版本的详细配置。
      if(this.useConfigure.id){
         this.getConfigure(this.useConfigure.id)
      }else{
        this.getConfigure(item.id)
      }
    },
    querySearchAsync(queryString, cb) {
      let newList = []
      for (let i in this.serviceList) {
        let item = this.serviceList[i]
        if(item.name.indexOf(queryString)!=-1 || item.keyword.indexOf(queryString)!=-1){
          item['show_name'] =item.name + '(' + item.keyword + ')';
          newList.push(item)
        }
      }
      cb(newList);
    },
    async handleSelect(item) {
      this.curService = item
      this.getConfigures(item.id)
    },
    handleChooseEnv(e){
      console.log(e)
    },
    async getEnvs(){
      const data = await getEnvs()
      this.envs = data.list
      if(!this.envs.length){
        this.$message.error("请先设置环境")
      }
    }
  }
};
</script>
<style lang="scss" scoped="">
  .config-box{
    position: relative;
    top:-30px;
    .edit{
      height: calc(100vh - 200px);
    }
  }

.custom-card {
  display: flex !important;
  flex-direction: row !important;
  justify-content: space-between;
  height: calc(100vh - 120px);
  .jsonEditor {
    margin-left: 15px;
    flex: 1;
    .edit {
      height: calc(100vh - 120px);
    }
  }



  .service {
    border: 1px solid #f2f2fe;
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    padding: 15px;
    width: 200px;
    .select-input {
      margin-bottom: 15px;
    }
    .item {
      padding: 4px 0px;
      color: #666;
      font-size: 13px;
    }
    .btn {
      text-align: center;
      margin-top: 15px;
      .el-button--primary {
        width: 100% !important;
      }
    }
  }
}

.header {
  margin-bottom: 15px;
  display: flex;
  .header-item {
    margin-right: 18px;
    .label {
      font-size: 13px;
      color: #666;
      margin-right: 8px;
    }
  }
}
</style>
