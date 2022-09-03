<template>
  <div>
    <el-card class="box-card">
      <div class="custom-card">
        <div class="service">
          <div class="hr">
            <span class="icon"></span>
            <span>服务信息</span>
          </div>
          <div class="item">
            <span class="label">所属服务</span>
            <div class="select-input">
              <el-autocomplete
                v-model="tempValue"
                size="small"
                :fetch-suggestions="querySearchAsync"
                clearable
                value-key="show_name"
                placeholder="请选择服务"
                @select="handleSelect"
                @clear="handleSelect"
              ></el-autocomplete>
            </div>
          </div>
          <div v-if="curService.id">
            <div class="item">
              <span class="label">服务名称</span>
              <span class="value">{{ curService.name }}</span>
            </div>
            <div class="item">
              <span class="label">服务标志</span>
              <span class="value">{{ curService.keyword }}</span>
            </div>
          </div>
          <div class="hr" style="margin-top: 20px;margin-bottom: 10px;" v-if="curService.id">
            <span class="icon"></span>
            <span>配置信息</span>
          </div>
          <div v-if="curTemplate.id">
            <div class="item">
              <span class="label">当前版本</span>
              <span class="value">{{ curTemplate.version }}</span>
            </div>
            <div class="item">
              <span class="label">创建时间</span>
              <span class="value">{{ curTemplate.created_at | parseTime }}</span>
            </div>
            <div class="item">
              <span class="label">创建人员</span>
              <span class="value">{{ curTemplate.operator }}</span>
            </div>
            <div class="item">
              <span class="label">版本描述</span>
              <span class="value">{{ curTemplate.description ? curTemplate.description : '暂无描述' }}</span>
            </div>
          </div>
          <div>
            <el-empty v-if="!tempValue" description="请先选择服务"></el-empty>
            <el-empty v-else-if="!curTemplate.id" description="暂无配置数据"></el-empty>
          </div>
        </div>

        <div class="configure">
          <div class="header">
            <div v-permission="'configure:template:parse'" class="header-item"><el-button :disabled="!curService.id" type="success" icon="el-icon-brush" size="small" @click="handleChooseEnv('render')">渲染测试</el-button></div>
            <div v-permission="'configure:template:add'" class="header-item"><el-button :disabled="!curService.id" type="primary" icon="el-icon-upload2" size="small" @click="handleAddTemplate">模板更新</el-button></div>
            <div v-permission="'configure:config:sync'"  class="header-item"><el-button :disabled="!curService.id" type="primary" icon="el-icon-refresh" size="small" @click="handleChooseEnv('sync')">同步配置</el-button></div>
            <div v-permission="'configure:template:update'" class="header-item"><el-button :disabled="!curService.id" type="warning" icon="el-icon-s-operation" size="small" @click="handlerChangeVersion">版本切换</el-button></div>
            <div v-permission="'configure:config:rollback'" class="header-item"><el-button :disabled="!curService.id" type="warning" icon="el-icon-money" size="small" @click="handleChooseEnv('rollback')">配置回归</el-button></div>
            <div v-permission="'configure:config:driver'" class="header-item"><el-button :disabled="!curService.id" type="warning" icon="el-icon-money" size="small" @click="handleChooseEnv('config')">配置查看</el-button></div>
          </div>
          <vueJsonEditor
            v-if="!!curService.id"
            class="edit"
            v-model="jsonValue"
            :mode="'code'"
            lang="zh"
            @json-change="iserror = false"
            @has-error="iserror = true"
          ></vueJsonEditor>
          <el-empty class="edit" v-else description="请先选择服务"></el-empty>
        </div>
        <div class="fields">
          <div class="hr">
            <span class="icon"></span>
            <span>可用字段</span>
          </div>
          <div class="header">
            <el-input placeholder="请输入关键字" size="small" v-model="searchFieldValue" clearable></el-input>
            <el-button style="margin-left: 15px;" size="small" type="primary">搜索</el-button>
          </div>
          <el-tabs stretch v-model="filedType" v-if="curService.id">
              <el-tab-pane label="服务字段" name="service"></el-tab-pane>
              <el-tab-pane label="资源配置" name="resource"></el-tab-pane>
          </el-tabs>
          <div class="field-list">
            <div v-if="filedType=='service'">
              <div class="item" v-for="(item,index) in fields.service" :key="index"  v-if="item.field.indexOf(searchFieldValue)!=-1">
                <div class="item-row">
                  <span class="label">字段</span>
                  <el-tag size="small" type="primary">
                    <span>{{item.field}}</span>
                    <i class="copy el-icon-document-copy" @click="handleCopy(item.field)"></i>
                  </el-tag>
                </div>
                <div class="item-row">
                  <span class="label">说明</span>
                  <span class="value">{{item.description}}</span>
                </div>
              </div>
            </div>
            <div v-else>
              <div class="item" v-for="(item,index) in fields.resource" :key="index" v-if="item.field.indexOf(searchFieldValue)!=-1">
                <div class="item-row">
                  <span class="label">字段</span>
                  <span style="color:#409EFF">{{item.field}}</span>
                </div>
                <div class="item-row">
                  <span class="label">说明</span>
                  <span class="value">{{item.description}}</span>
                </div>
                <el-divider class="divider">资源子字段</el-divider>
                <div class="item-left" v-for="field in JSON.parse(item.child_field)" :key="field">
                  <el-tag size="small" type="primary">
                    <span>{{item.field}}.{{field}}</span>
                    <i class="copy el-icon-document-copy" @click="handleCopy(item.field+'.'+field)"></i>
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <el-dialog title="模板变更详情" :visible.sync="addTemplateDialog">
      <el-table :data="addTemplateInfo" style="width: 100%">
        <el-table-column prop="key" label="变更key"  header-align="center" align="center"></el-table-column>
        <el-table-column prop="name" label="变更类型"  header-align="center" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.type=='add'" type="success" size="medium">新增</el-tag>
            <el-tag v-if="scope.row.type=='update'" type="primary" size="medium">更新</el-tag>
            <el-tag v-if="scope.row.type=='delete'" type="danger" size="medium">删除</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" header-align="center" align="center">
          <template slot-scope="scope">
             <el-popover placement="bottom" width="400" trigger="click">
                <div class="change-item">
                    <span>变更前</span>
                    <el-divider direction="vertical"></el-divider>
                    <span>变更后</span>
                 </div>
                 <div class="change-item">
                     <textarea>{{JSON.stringify(scope.row.old,null,2)}}</textarea>
                     <textarea>{{JSON.stringify(scope.row.val,null,2)}}</textarea>
                  </div>
                <el-tag slot="reference" class="pointer" size="medium">详情</el-tag>
              </el-popover>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" v-permission="'configure:template:add'">
        <el-button size="small"  type="primary" @click="addTemplate()">确定变更</el-button>
      </div>
    </el-dialog>

    <el-dialog fullscreen title="版本切换" :visible.sync="versionDialog">
      <el-tabs class="custom-tabs" tab-position="left" v-model="cueTemplateVersion"  @tab-click="handlerChooseVersion">
          <el-tab-pane v-for="(item,index) in templateList" :name="item.version">
            <div class="tab-label" slot="label">
              <div>版本号：{{item.version}}</div>
              <div>修改人：{{item.operator}}</div>
              <div>更新描述：{{item.description}}</div>
              <div>修改时间：{{item.created_at | parseTime}}</div>
            </div>
            <vueJsonEditor class="versionEdit" v-model="templateJsonValue" :mode="'code'" lang="zh"></vueJsonEditor>
          </el-tab-pane>
      </el-tabs>
      <div slot="footer" v-permission="'configure:template:update'">
        <el-button type="primary" @click="changeVersion">使用此模板</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="envTitleConfig[envTitle]" :visible.sync="envDialog">
      <el-table :data="envList" style="width: 100%">
        <el-table-column prop="keyword" label="环境标志"  header-align="center" align="center"></el-table-column>
        <el-table-column prop="name" label="环境名称"  header-align="center" align="center"></el-table-column>
        <el-table-column label="操作" header-align="center" align="center">
          <template  slot-scope="scope">
            <el-tag v-if="envTitle=='sync'" @click="handleCompareConfig(scope.row)" class="pointer" size="medium">同步</el-tag>
            <el-tag v-if="envTitle=='rollback'" @click="handleRollbackConfig(scope.row)" class="pointer" size="medium">回滚</el-tag>
            <el-tag v-if="envTitle=='render'" @click="handleRenderConfig(scope.row)" class="pointer" size="medium">渲染</el-tag>
            <el-tag v-if="envTitle=='config'" @click="handleGetConfig(scope.row)" class="pointer" size="medium">查看</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog title="配置变更详情" :visible.sync="syncConfigDialog">
      <el-table :data="syncConfigInfo" style="width: 100%">
        <el-table-column prop="key" label="变更key"  header-align="center" align="center"></el-table-column>
        <el-table-column prop="name" label="变更类型"  header-align="center" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.type=='add'" type="success" size="medium">新增</el-tag>
            <el-tag v-if="scope.row.type=='update'" type="primary" size="medium">更新</el-tag>
            <el-tag v-if="scope.row.type=='delete'" type="danger" size="medium">删除</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" header-align="center" align="center">
          <template slot-scope="scope">
             <el-popover placement="bottom" width="400" trigger="click">
                <div class="change-item">
                    <span>变更前</span>
                    <el-divider direction="vertical"></el-divider>
                    <span>变更后</span>
                 </div>
                 <div class="change-item">
                     <textarea>{{JSON.stringify(scope.row.old,null,2)}}</textarea>
                     <textarea>{{JSON.stringify(scope.row.val,null,2)}}</textarea>
                  </div>
                <el-tag slot="reference" class="pointer" size="medium">详情</el-tag>
              </el-popover>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" v-permission="'configure:template:add'">
        <el-button size="small"  type="primary" :disabled="!syncConfigInfo" @click="syncConfig()">确定变更</el-button>
      </div>
    </el-dialog>

    <el-dialog fullscreen title="配置回归" :visible.sync="rollbackDialog">
      <el-tabs class="custom-tabs" tab-position="left" v-model="curConfigId"  @tab-click="handlerChooseConfig">
          <el-tab-pane v-for="(item,index) in configList" :name="item.name">
            <div class="tab-label" slot="label">
              <div>同步时间：{{item.created_at | parseTime}} </div>
              <div>同步人员：{{item.operator}}</div>
              <div>修改详情：
                <el-popover
                  placement="right"
                  width="400"
                  trigger="hover">
                  <el-table :data="JSON.parse(item.description)" style="width: 100%">
                    <el-table-column prop="key" label="变更key"  header-align="center" align="center"></el-table-column>
                    <el-table-column prop="name" label="变更类型"  header-align="center" align="center">
                      <template slot-scope="scope">
                        <el-tag v-if="scope.row.type=='add'" type="success" size="medium">新增</el-tag>
                        <el-tag v-if="scope.row.type=='update'" type="primary" size="medium">更新</el-tag>
                        <el-tag v-if="scope.row.type=='delete'" type="danger" size="medium">删除</el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" header-align="center" align="center">
                      <template slot-scope="scope">
                         <el-popover placement="bottom" width="400" trigger="hover">
                            <div class="change-item">
                                <span>变更前</span>
                                <el-divider direction="vertical"></el-divider>
                                <span>变更后</span>
                             </div>
                             <div class="change-item">
                                 <textarea>{{JSON.stringify(scope.row.old,null,2)}}</textarea>
                                 <textarea>{{JSON.stringify(scope.row.val,null,2)}}</textarea>
                              </div>
                            <el-tag slot="reference" class="pointer" size="medium">详情</el-tag>
                          </el-popover>
                      </template>
                    </el-table-column>
                  </el-table>
                  <span slot="reference" style="color:#E6A23C">查看</span>
                </el-popover>
              </div>
            </div>
            <vueJsonEditor class="versionEdit" v-model="configJson" :mode="'code'" lang="zh"></vueJsonEditor>
          </el-tab-pane>
      </el-tabs>
      <div slot="footer" v-permission="'configure:template:update'">
        <el-button type="primary" @click="changeConfig">使用此配置</el-button>
      </div>
    </el-dialog>

    <el-dialog fullscreen title="配置内容" :visible.sync="configDialog">
        <vueJsonEditor class="configEdit" v-model="configJson" :mode="'code'" lang="zh"></vueJsonEditor>
    </el-dialog>
  </div>
</template>
<script>

import { getServices,getServiceEnv } from '@/api/service/service.js';
import { getServiceFields } from '@/api/configure/service.js';
import { driverConfig,renderConfig,getTemplate, getTemplates, addTemplate ,updateTemplate,compareConfig,syncConfig,getConfigs,getConfig,rollbackConfig} from '@/api/configure/template.js';
import vueJsonEditor from 'vue-json-editor';
export default {
  components: { vueJsonEditor },
  data() {
    return {
      dialog: false,
      curService: {},
      form: {},
      dialog: false,
      updateEnvDialog: false,
      insertEnvDialog: false,
      loading: true,
      tempValue: undefined,
      templateList: [],
      curTemplate: {},
      queryParams: {
        service_id: undefined
      },
      curConfigId:undefined,
      configList:[],
      configJson:{},
      templateId: undefined,
      iserror: false,
      jsonValue: {},
      searchFieldValue: '',
      filedType:"service",
      fields:{service:[],resource:[]},
      addTemplateDialog:false,
      addTemplateValue:"",
      addTemplateInfo:[],
      versionDialog:false,
      cueTemplateVersion:"",
      template:{},
      templateJsonValue:{},
      envDialog:false,
      envTitleConfig:{"sync":"配置同步","rollback":"配置回滚","render":"配置渲染","config":"配置查看"},
      envTitle:"",
      envList:[],
      syncConfigDialog:false,
      syncConfigInfo:[],
      syncEnv:{},
      rollbackDialog:false,
      configDialog:false,
    };
  },
  computed: {

  },
  created() {
  },
  methods: {
    async handleRenderConfig(row){
      let config = await renderConfig({"srv_keyword":this.curService.keyword,"env_keyword":row.keyword})
      this.configJson = JSON.parse(config)
      this.configDialog = true
    },
    async handleGetConfig(row){
      let config = await driverConfig({"srv_keyword":this.curService.keyword,"env_keyword":row.keyword})
      config = config == ""?"{}":config
      this.configJson = JSON.parse(config)
      this.configDialog = true
    },
    async handleRollbackConfig(row){
       this.configList = await getConfigs({"service_keyword":this.curService.keyword,"env_keyword":row.keyword})
       if(!this.configList.length){
         this.$message({ message: '暂无配置同步记录', type: 'error' });
         return
       }
       for(let i in this.configList){
         this.configList[i].name = String(this.configList[i].id)
       }
       this.rollbackDialog = true
       this.curConfigId = this.configList[0].name
       this.handlerChooseConfig()
    },
    async handlerChooseConfig(){
      let config = await getConfig({"id":Number(this.curConfigId)})
      this.configJson = JSON.parse(config.config)
    },
    changeConfig(){
      rollbackConfig({"id":Number(this.curConfigId)}).then(res=>{
        this.$message({ message: '配置回滚成功', type: 'success' });
        this.rollbackDialog = false
      })
    },
    async handlerChangeVersion(){
      this.templateList = await getTemplates({"service_keyword":this.curService.keyword})
      this.cueTemplateVersion = this.curTemplate.version
      this.handlerChooseVersion()
      this.versionDialog = true
    },
    changeVersion(){
      updateTemplate({ id: this.template.id}).then(res => {
        this.versionDialog = false
        this.getTemplate();
        this.$message({ message: '使用此模板成功', type: 'success' });
      });
    },
    async handlerChooseVersion(){
      for(let i in this.templateList){
        if (this.cueTemplateVersion === this.templateList[i].version)
          this.template = this.templateList[i]
      }
      this.template = await getTemplate({"id":this.template.id})
      this.templateJsonValue = JSON.parse(this.template.content)
    },
    async handleCompareConfig(row){
      const loading = this.$loading({lock: true, text: '获取中间件配置中',spinner: 'el-icon-loading', background: 'rgba(0, 0, 0, 0.7)' });
      this.syncConfigDialog = true
      this.syncEnv = row
      compareConfig({"srv_keyword":this.curService.keyword,"env_keyword":row.keyword}).then(res=>{
        this.syncConfigInfo = res
        loading.close()
      }).catch(res=>{
        loading.close()
      })

    },
    syncConfig(row){
      syncConfig({"srv_keyword":this.curService.keyword,"env_keyword":this.syncEnv.keyword}).then(res=>{
        this.$message({ message: '配置同步成功', type: 'success' });
        this.syncConfigDialog = false
      })
    },

    async handleChooseEnv(type){
       this.envList = await getServiceEnv({"srv_id":this.curService.id})
       this.envTitle = type
       this.envDialog = true
    },
    handleAddTemplate() {
      if (this.iserror) {
        this.$message({ message: '模板格式存在错误，禁止提交', type: 'error' });
        return;
      }
      if(!this.curTemplate.content) this.curTemplate.content = "{}"
      this.addTemplateInfo = this.handleCompare(JSON.parse(this.curTemplate.content),this.jsonValue)
      if (!this.addTemplateInfo.length){
        this.$message({ message: '模板不存在变更', type: 'error' });
        return
      }
      this.addTemplateDialog = true
    },
    addTemplate(){
      this.addTemplateDialog = false
      this.$prompt('请输入更新备注', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValidator: val => {
          if (!val || val.trim() == '') return '版本描述不能为空';
          if (val.length > 20) return '不能超过20个字符';
          return true;
        }
      }).then(({ value }) => {
        addTemplate({
          service_keyword: this.curService.keyword,
          content: JSON.stringify(this.jsonValue),
          description: value
        }).then(res => {
          this.getTemplate();
          this.$message({ message: '模板更新成功', type: 'success' });
        });
      });
    },
    async getTemplate() {
      this.curTemplate = await getTemplate({ keyword: this.curService.keyword });
      this.curTemplate.content = this.curTemplate.content?this.curTemplate.content:"{}"
      this.jsonValue = JSON.parse(this.curTemplate.content);
    },


    // 服务选择相关处理函数
    handleSelect(item) {
      if (!item || !item.id) {
        this.resetQuery()
        return
      }
      this.curService = item
      this.getTemplate()
      this.getFileds()
    },
    resetQuery() {
      this.curService = {};
      this.tempValue = undefined;
      this.curTemplate = {};
      this.queryParams = { page: 1, count: 10, keyword: undefined };
    },
    async getServices(name) {
      let srvList = await getServices({page:1,count:10,name:name});
      return srvList
    },
    querySearchAsync(queryString, cb) {
      if(!queryString || !queryString.length)
         return []
      this.getServices(queryString).then(res=>{
        for(let i in res.list){
          res.list[i].show_name = res.list[i].name +"("+res.list[i].keyword+")"
        }
        cb(res.list);
      })
    },
     // 字段相关
     async getFileds(){
       this.fields = await getServiceFields({"keyword":this.curService.keyword})
       console.log(this.fields)
     },
    handleCopy(text){
      text = "{{"+text+"}}"
      const save = function(e) {
        e.clipboardData.setData('text/plain', text)
        e.preventDefault() // 阻止默认行为
      }
      const once = {once: true}
      document.addEventListener('copy', save, once) // 添加一个copy事件,当触发时执行一次,执行完删除
      document.execCommand('copy') // 执行copy方法
      this.$message({ message: '复制成功', type: 'success' })
    },
    handleCompare(obj,other){
      var info = []
      let objKeys = Object.keys(obj)
      let otherKeys = Object.keys(other)

      let addKeys = objKeys.filter(item => !otherKeys.includes(item))

      for(let i in addKeys){
        info.push({type:"delete",key:addKeys[i],old:other[addKeys[i]],val:{}})
      }

      let deleteKeys = otherKeys.filter(item => !objKeys.includes(item))
      for(let i in deleteKeys){
        info.push({type:"add",key:deleteKeys[i],old:{},val:other[deleteKeys[i]]})
      }

      for(let i in obj){
        if(JSON.stringify(obj[i]) != JSON.stringify(other[i])){
           info.push({type:"update",key:i,old:obj[i],val:other[i]})
        }
      }
      return info
    }
  }
};
</script>
<style  lang="scss">
  .custom-tabs{
    height: calc(100vh - 200px);
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
    .tab-label{
      display: flex;
      flex-direction: column;
      font-size: 13px;
      max-width: 200px;
      div{
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    .el-tabs__item{
      line-height: inherit !important;
      height: auto !important;
      padding: 7px 20px;
      text-align: left !important;
    }
    .versionEdit{
      height: calc(100vh - 201px);
    }
  }
</style>
<style lang="scss" scoped="">
.change-field{
    .item{
      display: flex;
      flex-direction: row;
      margin-bottom: 15px;
      .fields{
        margin-left: 20px;
      }
    }
}

.configEdit{
  height: calc(100vh - 150px);
}

.change-item{
  span{
    width:49%;
    display: block;
    text-align: center;
  }
  textarea{
    min-height: 200px;
    height: auto;
    border: 1px solid #f2f2f2;
    border-radius: 4px;
    outline: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
    display: flex;
    justify-content: space-between;
}

.custom-card {
  display: flex !important;
  flex-direction: row !important;
  justify-content: space-between;
  height: calc(100vh - 120px);


  .divider{
    .el-divider__text{
      font-size: 12px !important;
      color: #aaa;
    }
    margin: 15px 0px;
  }



  .hr {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 700;
    color: #666;
    .icon {
      width: 5px;
      height: 16px;
      display: block;
      background-color: #409eff;
      border-radius: 4px;
      margin-right: 10px;
    }
  }

  .configure {
    flex: 1;
    margin-left: 15px;
    margin-right: 15px;
    .edit {
      height: calc(100vh - 168px);
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
    }
  }

  .fields {
    border: 1px solid #f2f2fe;
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    padding: 10px 15px;
    width: 250px;
    max-width: 250px;
    min-width: 250px;
    position: relative;
    .header {
      align-items: center;
      justify-content: space-between;
      display: flex;
      padding: 10px 0px;
      font-size: 14px;
    }
    .field-list{
      position: absolute;
      width: calc(100% - 30px);
      overflow-y:scroll;
      overflow-x: hidden;
      height: calc(100% - 160px);
      &::-webkit-scrollbar {
        display: none;
      }
      .item{
        .copy{
          margin-left: 10px;
          cursor: pointer;
        }
        .item-left{
          text-align: left;
          font-size: 13px;
          margin-bottom: 5px;
        }
        .item-row{
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;

          .label{
            display: block;
            width: 30px;
            min-width: 30px;
            white-space: nowrap;
            font-size: 12px;
          }
          .value{
            color:#777;
            font-size: 12px;
          }
        }
        border:1px solid #f2f2f2;
        border-radius: 4px;
        padding: 10px 8px;
        font-size: 13px;
        margin-bottom: 15px;
      }
    }
  }

  .service {
    border: 1px solid #f2f2fe;
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    padding: 10px 15px;
    width: 250px;
    max-width: 250px;
    min-width: 250px;

    .item {
      align-items: center;
      justify-content: space-between;
      display: flex;
      padding: 10px 0px;
      font-size: 14px;
      .label {
        color: #666;
        width: 55px;
        min-width: 55px;
        font-weight: 700;
        margin-right: 10px;
        white-space: nowrap;
      }
      .value {
        color: #777;
      }
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
    display: flex;
    align-items: center;
    margin-right: 18px;
    white-space: nowrap;
    .label {
      font-size: 13px;
      color: #666;
      margin-right: 8px;
      font-weight: 700;
      white-space: nowrap;
    }
  }
}
</style>
