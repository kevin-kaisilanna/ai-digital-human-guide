<script setup>
import { useUnityAuth } from "@/composables/useUnityAuth.js";

const { login, logout } = useUnityAuth();
import {onMounted, ref} from 'vue'
import {useRoute} from "vue-router";
import {ChatLineSquare, Delete, Microphone, More, Promotion} from "@element-plus/icons-vue";
import router from "@/router";
import {ElMessage} from "element-plus";
import axios from "axios";
import {backendUrl, llmUrl} from "@/services/severConfig.js";

const isChatting = ref(false)
const userChatText = ref('')


const props = defineProps({
  showAssistant: {
    type: Boolean,
    required: true
  },
  isCallBtnLoading: {
    type: Boolean,
    required: true
  },
})

window.handleUnityTransmission = function(str) {
  const currentRoute = router.path;
  console.log(str);
  if(str.startsWith("<网站指令>")){
    let command = str.substring(6)

    ElMessage({
      message: '小云正在帮你...' + command + "!",
      type: 'success',
      appendTo: interaction.value
    })

    if(command === "打开登录表单" || command === "退出登录"){
      if(currentRoute !== '/login'){
        logout();
      }

      if (command === "打开登录表单") {
        router.push({path: '/login', query: {form: 'login'}})
      }
      else{
        router.push({path: '/login'})
      }
    }
    else if(command === "推荐游览路线"){
      router.push({path: '/routes'})
    }
    else if(command === "打开景点导览" || command === "带我逛逛灵山"){
      router.push({path: '/'})
    }
    else if(command === "带我去灵山大佛"){
      router.push({path: '/spots/1'})
    }
    else if(command === "查看我的游览记录"){
      router.push({path: '/profile'})
    }
  }
  else if(str.startsWith("<用户输入>")){
    ElMessage({
      message: '识别到用户语音:' + str.substring(6),
      type: 'success',
      appendTo: interaction.value
    })
  }
  else if(str.startsWith("<LLM回复>")){
    ElMessage({
      message: '小云的回复已生成：' + str.substring(7),
      type: 'success',
      appendTo: interaction.value
    })
    ElMessage({
      message: '正在合成小云的语音...',
      appendTo: interaction.value
    })
  }
  else if(str.startsWith("<聊天完成>")){
    isChatting.value=false;
    ElMessage({
      message: '希望你对小云感到满意🌟',
      type: 'success',
      appendTo: interaction.value
    })
  }
  else if(str.startsWith("<请求失败>")){
    isChatting.value=false;
    ElMessage({
      message: '发生错误！' + str,
      type: 'error',
      appendTo: interaction.value
    })
  }
}

const isVoiceRecording = ref(false)

const emit = defineEmits(['changeRemoteServer', 'summarizeWebsite'])

const route = useRoute()

const websiteDescription = {
  '/login': '网页内容：灵山胜境景区AI导览的登录页面，在这里可以登录你的游客账号',
  '/': '网页内容：灵山胜境景区导览主页，可以看到热门景点推荐和游览路线',
  '/spots/1': '网页内容：灵山大佛景点详情页面，可以看到大佛的建筑参数、文化内涵和游览亮点',
  '/routes': '网页内容：游览路线推荐页面，可以根据历史人文、自然风光、亲子游等兴趣标签选择路线',
  '/profile': '网页内容：游客个人中心页面，可以查看你的游览记录和偏好设置',
}

const voiceChatBtn = ref(null)

// UnityIns 安全检查：Unity WebGL 加载完成前返回 false
const safeSendMessage = (obj, method, ...args) => {
  if (typeof window.UnityIns !== 'undefined' && window.UnityIns) {
    window.UnityIns.SendMessage(obj, method, ...args)
    return true
  }
  ElMessage({
    message: '小云还在准备中，请稍等片刻...',
    type: 'warning',
    duration: 2000
  })
  isChatting.value = false
  isVoiceRecording.value = false
  return false
}

const handleSummarizeWebsite = () => {
  var path = route.path
  var description = websiteDescription[path]
  console.log(description)

  safeSendMessage('ChatManager',
      'StartChat', '请你作为灵山胜境的AI导游小云，帮我介绍一下当前页面的功能，并引导我如何使用：'
      + description);
}


const startRecordingVoice = () => {
    isVoiceRecording.value = true;
    isChatting.value = true;
    safeSendMessage('ChatManager',
      'StartRecorderFunc');
}

const endRecordingVoice = () => {
  isVoiceRecording.value = false;
  safeSendMessage('ChatManager',
      'EndRecorderFunc');
  voiceOff();
}

const sendUserText = () => {
  isChatting.value = true
  safeSendMessage('ChatManager',
      'StartChat', userChatText.value);
  userChatText.value = ""
  textOff();
}

const interaction = ref(null);
const cameraVideo = ref(null)
const cameraPhoto = ref(null)
const imageDate = ref('')
const analysis = ref(null)
const mediaSteam = ref(null)
const rawImage = ref('')

const initMedia = () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    ElMessage(
        {
          title: '打开麦克风、摄像头失败',
          type: 'error',
          message: '出现问题啦，我们无法获取到您的麦克风及摄像头权限',
          duration: 4000
        }
    )
  }
  else{
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    }).then((stream) => {
      mediaSteam.value = stream
      let cv = document.getElementById('cameraVideo')
      let cp = document.getElementById('cameraPhoto')
      cameraVideo.value = cv
      cameraPhoto.value = cp
      cv.srcObject = stream
    }).catch((err) => {
      ElMessage({
        title: '打开麦克风、摄像头失败',
        type: 'error',
        message: '出现问题啦，我们无法看到你的小表情奥' + err,
        duration: 4000
      })
    })
  }
}

const voiceOff = () => {
  const canvas = cameraPhoto.value.getContext('2d')
  canvas.drawImage(
      cameraVideo.value,
      0, 0,
      cameraPhoto.value.width,
      cameraPhoto.value.height)
  fetchFaceAnalysis(3)
}

const textOff = () => {
  const canvas = cameraPhoto.value.getContext('2d')
  canvas.drawImage(
      cameraVideo.value,
      0, 0,
      cameraPhoto.value.width,
      cameraPhoto.value.height)
  fetchFaceAnalysis(2)
}

const fetchFaceAnalysis = (type) => {
  cameraPhoto.value.toBlob((blob) => {
    const formData = new FormData()
    formData.append('img', blob, 'face.png')
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
    const reader = new FileReader()
    reader.onload = function(e) {
      rawImage.value = e.target.result;
    };
    reader.readAsDataURL(blob)
    axios.post(llmUrl+'face/analysis/', formData, config)
        .then((res) => {
          imageDate.value = 'data:image/png;base64,' + res.data['img']
          analysis.value = res.data['analysis']

          const emotionType = analysis.value?.result?.face_list?.[0]?.emotion?.type || 'neutral'
          console.log('[小云] 检测到游客情绪:', emotionType, '互动类型:', type === 3 ? '语音' : '文字')

          ElMessage({
            title: '表情识别完成',
            type: 'success',
            message: '小云感知到了你的情绪，会用更适合的方式回应你！',
            duration: 3000
          })
        })
        .catch((err) => {
          console.log('[小云] 表情分析失败（不影响对话）:', err)
        })
  })
}

const {user} = useUnityAuth();
initMedia()
</script>

<template>
  <div id="InteractionContainer"
       ref="i"
       v-if="showAssistant">
    <div class="interaction—item">
      <el-button
          type="primary"
          @click="handleSummarizeWebsite"
          :loading="isCallBtnLoading">
        询问小云有关当前页面的讯息...
      </el-button>
    </div>
    <div id="chat-container">
        <el-button :icon="Microphone"
                   type="primary"
                   size="large"
                   ref="voiceChatBtn"
                   :loading="isChatting"
                   v-if="!isVoiceRecording"
                   style="margin-bottom: 24px"
                   @click="startRecordingVoice"
                   round>
          按住说话...
        </el-button>
        <el-button
                   type="danger"
                   size="large"
                   ref="voiceChatBtn"
                   v-else
                   style="margin-bottom: 24px"
                   @click="endRecordingVoice"
                   round>
          <el-icon class="is-loading" style="margin-right: 8px">
            <More />
          </el-icon>
          松开并发送...
        </el-button>
      <el-input
          size="large"
          style="max-width: 360px; background: var(--el-bg-color);"
          clearable
          placeholder="请输入你想对小云说的话..."
          v-model="userChatText"
      >
        <template #prepend>
          <el-icon>
            <ChatLineSquare/>
          </el-icon>
        </template>
      </el-input>

      <div style="width:100%;
      margin-top: 8px;
      padding-right: 32px;
      display: flex;
      justify-content: flex-end;"
      >
        <el-button type="info" :icon="Delete" @click="userChatText=''" :loading="isChatting">
          重置
        </el-button>
        <el-button type="success" :icon="Promotion" @click="sendUserText" :loading="isChatting">
          发送
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
#InteractionContainer{
  height: 100%;
  width: 100%;
  position: absolute;
}

.interaction—item{
  margin: 8px;
}
#chat-container{
  position: absolute;
  top:65%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
</style>
