<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />
    <div class="right-menu">
      <template v-if="device !== 'mobile'">
        <div class="right-menu-item"><i @click="drawer=true" class="setting el-icon-setting"></i></div>
        <search id="header-search" class="right-menu-item" />
        <error-log class="errLog-container right-menu-item hover-effect" />
        <screenfull id="screenfull" class="right-menu-item hover-effect" />
        <el-tooltip content="字体大小设置" effect="dark" placement="bottom"><size-select id="size-select" class="right-menu-item hover-effect" /></el-tooltip>
      </template>

      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <img src=" https://wpimg.wallstcn.com/69a1c46c-eb1c-4b46-8bd4-e9e686ef5251.png" class="user-avatar" />
          <!-- <img :src="avatar+'?imageView2/1/w/80/h/80'" class="user-avatar"> -->
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <!-- <router-link to="/profile/index"> -->
          <!-- <el-dropdown-item>修改密码</el-dropdown-item> -->
          <!-- </router-link> -->
          <el-dropdown-item @click.native="handleUserinfo">个人信息</el-dropdown-item>
          <el-dropdown-item @click.native="changDialogVisible=true">修改密码</el-dropdown-item>
          <el-dropdown-item divided @click.native="logout"><span style="display:block;">退出登陆</span></el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <el-dialog title="个人信息" :visible.sync="userDialogVisible" :close-on-click-modal="false"  width="400px" center>
      <el-table  :data="userinfo"  style="width: 100%">
        <el-table-column  prop="label" label="信息标题"  width="180"> </el-table-column>
        <el-table-column  prop="value" label="信息值"  width="180"> </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog title="修改密码" :visible.sync="changDialogVisible" :close-on-click-modal="false"  width="300px" center>
      <el-form :model="form" status-icon :rules="rules" ref="form"  class="demo-ruleForm">
        <el-form-item label="旧密码" prop="oldpass">
          <el-input type="password" v-model="form.oldpass" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="pass">
          <el-input type="password" v-model="form.pass" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="checkPass">
          <el-input type="password" v-model="form.checkPass" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitChangepwd">确认修改</el-button>
      </span>
    </el-dialog>
    <el-drawer title="页面样式设置"  :visible.sync="drawer" append-to-body>
      <settings class="right-menu-item" />
    </el-drawer>
  </div>
</template>

<script>
import RightPanel from '@/components/RightPanel'
import Settings from './Settings/index.vue'
import { mapGetters } from 'vuex';
import Breadcrumb from '@/components/Breadcrumb';
import Hamburger from '@/components/Hamburger';
import ErrorLog from '@/components/ErrorLog';
import Screenfull from '@/components/Screenfull';
import SizeSelect from '@/components/SizeSelect';
import Search from '@/components/HeaderSearch';
import {changeUserPwd} from "@/api/system/user.js"
import getters from '@/store/getters';


export default {
  components: {
    Breadcrumb,
    Hamburger,
    ErrorLog,
    Screenfull,
    SizeSelect,
    Search,
    RightPanel,
    Settings
  },
  data(){
    var validatePass2 = (rule, value, callback) => {
           if (value === '') {
             callback(new Error('请再次输入密码'));
           } else if (value !== this.form.pass) {
             callback(new Error('两次输入密码不一致!'));
           } else {
             callback();
           }
    };

    return{
      drawer:false,
      form:{
        pass:"",
        oldpass:"",
        checkPass:""
      },
      userinfo:[],
      userDialogVisible:false,
      changDialogVisible:false,
      rules: {
        oldpass: [ {required: true,trigger: 'blur',message: '旧密码不能为空'}],
        pass: [ {required: true,trigger: 'blur',message: '新密码不能为空'}],
        checkPass: [{ validator: validatePass2, trigger: 'blur' }]
      },
    }
  },
  computed: {
    ...mapGetters(['sidebar', 'avatar', 'device'])
  },
  methods: {
    handleUserinfo(){
      let userinfo = this.$store.getters.userInfo
      console.log(userinfo)
      this.userinfo.push({"label":"用户姓名","value":userinfo.name})
      this.userinfo.push({"label":"用户昵称","value":userinfo.nickname})
      this.userinfo.push({"label":"用户角色","value":userinfo.role.name})
      this.userinfo.push({"label":"所属部门","value":userinfo.team.name})
      this.userDialogVisible=true;
    },
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar');
    },
    async logout() {
      await this.$store.dispatch('user/logout');
      this.$router.push(`/login?redirect=${this.$route.fullPath}`);
    },
    submitChangepwd() {
        this.$refs.form.validate((valid) => {
          if (valid) {
            changeUserPwd(this.form).then(res=>{
              this.changDialogVisible = false
              this.$message.success("密码修改成功")
              setTimeout(()=>{
                this.logout()
              },2000)
            })
          }
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .setting{
      font-size: 20px;
      font-weight: 800;
  }
  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
