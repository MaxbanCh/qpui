<script setup lang="ts">
import { ref } from 'vue';
import Player from '../player/Player.vue';
import Buzzer from '../buzzer/Buzzer.vue';

const logged = ref<boolean>(false);
const username = ref<string>('');
const roomCode = ref<string>('');

function handleJoinRoom(data: { username: string; roomCode: string }) {
  username.value = data.username;
  roomCode.value = data.roomCode;
  logged.value = true;
}
</script>

<template>
    <h1>Game Component</h1>
    <Player v-if="!logged" @joinRoom="handleJoinRoom"/>
    <Buzzer v-else :usernameProp="username" :roomCodeProp="roomCode"/>
</template>