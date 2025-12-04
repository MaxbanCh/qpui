<script setup lang="ts">
    import { ref } from 'vue';
    
    const emit = defineEmits(['joinRoom']);
    const username = ref<string>('');
    const roomCode = ref<string>('');

    function handleJoinRoom() {
      if (username.value && roomCode.value) {
        emit('joinRoom', { 
          username: username.value, 
          roomCode: roomCode.value 
        });
      }
    }
</script>

<template>
  <div class="player-info">
    <label for="username">Username:</label>
    <input id="username" v-model="username" type="text" placeholder="Enter your username" />

    <label for="roomCode">Room Code:</label>
    <input id="roomCode" v-model="roomCode" type="text" placeholder="Enter room code" />
    
    <input type="button" value="Join Room" @click="handleJoinRoom" />
  </div>
</template>