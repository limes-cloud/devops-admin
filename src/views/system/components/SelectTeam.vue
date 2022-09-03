<template>
  <div>
    <div class="sdep">
      <div>
        <el-button :size="size" @click="chooseTeam">
          <div class="button">
            <div v-if="chooseKeys.length != 0" class="button-item">
              <el-tag size="mini">已选部门</el-tag>
              <el-tag size="mini">{{ chooseKeys.length }} 个</el-tag>
            </div>
            <div v-else class="item">点击选择部门</div>
          </div>
        </el-button>
      </div>
    </div>

    <el-dialog title="选择部门" :visible.sync="dialogVisible" width="425px" :append-to-body="true">
      <div class="flex" style="	margin-top: 20px;">
        <div class="label">选择部门：</div>
        <div class="team-box"><el-tree ref="team" node-key="id" :data="team" show-checkbox :check-strictly="false" :props="{ label: 'name' }" /></div>
      </div>
      <span slot="footer" class="dialog-footer"><el-button type="primary" @click="getCheckedKeys">确 定</el-button></span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    team: {
      type: Array,
      default: []
    },
    keys: {
      type: Array,
      default: []
    },
    size: {
      type: String,
      default: 'medium'
    }
  },
  watch: {
    keys: {
      immediate: true,
      deep: true,
      handler(val, old) {
        this.chooseKeys = val;
      }
    }
  },
  data() {
    return {
      // 控制弹窗
      dialogVisible: false,
      // 获取已选中的树
      chooseKeys: []
    };
  },
  mounted() {
    // console.log(this.k)
  },
  methods: {
    setCheckedKeys() {
      if (this.team.length > 0) {
        let ids = this.getTreeIds(this.team[0]);
        for (let i in ids) {
          let id = ids[i];
          this.$refs.team.setChecked(id, this.chooseKeys.indexOf(id) != -1);
        }
      }
    },
    chooseTeam() {
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.setCheckedKeys()
      });
    },
    getCheckedKeys() {
      const checkedKeys= this.$refs.team.getCheckedKeys();
      this.$emit('confirm', checkedKeys);
      this.dialogVisible = false;
    }
  }
};
</script>

<style scoped>
.button {
  min-width: 120px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}
.el-button--medium {
  padding: 8px 15px;
}
.button-item {
  width: 100%;
  display: flex;
  justify-content: space-around;
}
.team-box {
  border-radius: 4px;
  padding: 10px;
  width: 100%;
  max-height: 300px;
  overflow: scroll;
  border: 1px solid #dcdfe6;
}
/* 定义滚动条样式 */
::-webkit-scrollbar {
  display: none;
}
.flex {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.flex > .label {
  width: 100px;
}
</style>
