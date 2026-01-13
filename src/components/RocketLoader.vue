<template>
  <transition name="fade">
    <div v-if="visible" class="rocket-loader-container">
      <div class="stars"></div>
      <div class="rocket-wrapper">
        <div class="rocket-body">
          <div class="body"></div>
          <div class="fin fin-left"></div>
          <div class="fin fin-right"></div>
          <div class="window"></div>
          <div class="exhaust-flame"></div>
          <ul class="exhaust-fumes">
            <li></li><li></li><li></li><li></li><li></li>
          </ul>
        </div>
      </div>
      <div class="warp-speed-text" v-if="text">{{ text }}</div>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  text?: string
}>()
</script>

<style scoped lang="scss">
.rocket-loader-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #101010;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(white 1px, transparent 1px) 0 0 / 50px 50px;
  opacity: 0.3;
  animation: moveStars 0.5s linear infinite;
}

@keyframes moveStars {
  from { background-position: 0 0; }
  to { background-position: 0 100px; }
}

.rocket-wrapper {
  position: relative;
  // 这里不需要很高的z-index，让它自然层叠即可
  animation: rocketEnter 0.8s ease-out forwards;
}

@keyframes rocketEnter {
  0% { transform: translateY(100vh) scale(0.5); opacity: 0; }
  60% { transform: translateY(-20px) scale(1.2); opacity: 1; }
  100% { transform: translateY(0) scale(1); }
}

// ⬇️⬇️⬇️ 重点修改区域 ⬇️⬇️⬇️
.warp-speed-text {
  margin-top: 150px;
  color: #fff;
  font-family: 'Courier New', Courier, monospace;
  font-size: 1.5rem;
  letter-spacing: 5px;
  animation: blink 1s infinite;
  
  // 【核心修改】确保文字在最上层
  position: relative; // 必须设置 position 才能让 z-index 生效
  z-index: 100;       // 设置一个比烟雾更高的层级
  text-shadow: 0 2px 10px rgba(0,0,0,0.5); // 加一点文字阴影，让它更清晰
}
// ⬆️⬆️⬆️ 重点修改区域 ⬆️⬆️⬆️

.rocket-body {
  width: 80px;
  left: calc(50% - 40px);
  position: relative;
  animation: shake 0.2s infinite; 

  .body {
    background-color: #dadada;
    height: 180px;
    left: calc(50% - 50px);
    border-top-right-radius: 100%;
    border-top-left-radius: 100%;
    border-bottom-left-radius: 50%;
    border-bottom-right-radius: 50%;
    border-top: 5px solid #f5f5f5;
    position: relative;
    z-index: 2; // 确保机身在翅膀上面
  }

  .window {
    position: absolute;
    width: 40px;
    height: 40px;
    border-radius: 100%;
    background-color: #a75248;
    left: calc(50% - 20px);
    top: 40px;
    border: 5px solid #b4b2b2;
    box-shadow: inset -5px 5px 0 #7e3028;
    z-index: 3; // 窗户在机身上面
    
    &:after {
        content: '';
        position: absolute;
        width: 10px;
        height: 10px;
        background: rgba(255,255,255,0.6);
        border-radius: 50%;
        top: 5px;
        left: 5px;
    }
  }

  .fin {
    position: absolute;
    z-index: -1; // 翅膀在机身下面
    height: 55px;
    width: 50px;
    background-color: #a75248;
  }
  .fin-left { left: -30px; top: calc(100% - 55px); border-top-left-radius: 80%; border-bottom-left-radius: 20%; }
  .fin-right { right: -30px; top: calc(100% - 55px); border-top-right-radius: 80%; border-bottom-right-radius: 20%; }

  .exhaust-flame {
    position: absolute;
    top: 90%;
    width: 28px;
    background: linear-gradient(to bottom, transparent 10%, #f5f5f5 15%, transparent 20%, #f5f5f5 75%, transparent 80%);
    height: 150px;
    left: calc(50% - 14px);
    animation: exhaust 0.2s infinite;
    z-index: 1; // 火焰层级
  }

  .exhaust-fumes li {
    width: 60px;
    height: 60px;
    background-color: #f5f5f5;
    list-style: none;
    position: absolute;
    border-radius: 100%;
    z-index: 0; // 烟雾在最下层
    &:first-child { width: 200px; height: 200px; bottom: -300px; animation: fumes 5s infinite; }
    &:nth-child(2) { width: 150px; height: 150px; bottom: -250px; animation: fumes 3.2s infinite; }
    &:nth-child(3) { width: 130px; height: 130px; bottom: -120px; left: -90px; animation: fumes 3s infinite; }
    &:nth-child(4) { width: 120px; height: 120px; bottom: -170px; left: 90px; animation: fumes 4s infinite; }
    &:nth-child(5) { width: 180px; height: 180px; bottom: -250px; left: -60px; animation: fumes 5s infinite; }
  }
}

@keyframes shake {
  0% { transform: translate(1px, 1px) rotate(0deg); }
  100% { transform: translate(-1px, -2px) rotate(-1deg); }
}

@keyframes exhaust {
  0% { background: linear-gradient(to bottom, transparent 10%, #f5f5f5 15%, transparent 20%, #f5f5f5 75%, transparent 80%); }
  50% { background: linear-gradient(to bottom, transparent 10%, #f5f5f5 10%, transparent 15%, #f5f5f5 70%, transparent 80%); }
  100% { background: linear-gradient(to bottom, transparent 10%, #f5f5f5 15%, transparent 20%, #f5f5f5 75%, transparent 80%); }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes fumes {
  0%   { transform: scale(0.2); opacity: 0.5; }
  50%  { opacity: 0.8; }
  100% { transform: scale(1) translateY(200px); opacity: 0; }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>