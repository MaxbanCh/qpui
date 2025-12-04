<script setup lang="ts">
import { ref, computed, onUnmounted, onMounted } from 'vue';
import { WEBSOCKET_URL } from '@/shared/env';

const props = defineProps(['usernameProp', 'roomCodeProp']);

interface Player {
  id: string;
  username: string;
  score: number;
  locked?: boolean;
}

let ws: WebSocket;
const username = ref<string>(props.usernameProp || '');
const players = ref<Player[]>([]);

const activeBuzzer = ref<string>('');
const lockedBuzzer = ref<boolean>(false);
const isHost = ref<boolean>(false);
const roomCode = ref<string>(props.roomCodeProp || '');

const sortedPlayers = computed(() => {
  return players.value.slice().sort((a, b) => b.score - a.score);
});

function pressBuzzer() {
  console.log('Attempting to press buzzer. Locked:', lockedBuzzer.value);
  if (!lockedBuzzer.value && !activeBuzzer.value) {
    ws.send(JSON.stringify({
      type: 'PRESS_BUZZER',
      userId: username.value,
      username: username.value,
      roomCode: roomCode.value,
      timestamp: Date.now()
    }));
  }
}

function resetBuzzer() {
  if (isHost.value) {
    ws.send(JSON.stringify({
      type: 'RESET_BUZZER',
      roomCode: roomCode.value,
    }));
  }
}

function lockPlayerBuzzer(playerId: string, lock: boolean) {
  if (isHost.value) {
    ws.send(JSON.stringify({
      type: 'LOCK_PLAYER_BUZZER',
      roomCode: roomCode.value,
      playerId: playerId,
      lock: lock
    }));
  }
}

function awardPoints(playerId: string, points: number = 1) {
  if (isHost.value) {
    ws.send(JSON.stringify({
      type: 'AWARD_POINTS',
      roomCode: roomCode.value,
      playerId: playerId,
      points: points
    }));
  }
}

function setupWebSocket() {
  ws = new WebSocket(WEBSOCKET_URL + "/BuzzerRoom");
  
  ws.onopen = () => {
    if (username.value) {
      ws.send(JSON.stringify({
        type: 'JOIN_BUZZER_ROOM',
        userId: username.value,
        username: username.value,
        roomCode: roomCode.value,
        isRejoining: true
      }));
    }
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Received WebSocket message:', data);
    
    switch (data.type) {
      case 'ROOM_CREATED':
        roomCode.value = data.room.code;
        isHost.value = true;
        players.value = data.room.players.map((p: Player) => ({
          ...p,
          score: data.room.scores[p.id] || 0
        }));
        localStorage.setItem('buzzerAdminRoom', roomCode.value);
        localStorage.setItem('buzzerAdminUser', username.value);
        break;
        
      case 'ROOM_JOINED':
        roomCode.value = data.room.code;
        players.value = data.room.players.map((p: Player) => ({
          ...p,
          score: data.room.scores[p.id] || 0
        }));
        isHost.value = data.room.host === username.value;
        if (isHost.value) {
          localStorage.setItem('buzzerAdminRoom', roomCode.value);
          localStorage.setItem('buzzerAdminUser', username.value);
        }
        break;
        
      case 'PLAYER_JOINED':
        players.value = data.players;
        break;
        
      case 'PLAYER_LEFT':
        players.value = data.players;
        if (data.newHost === username.value) {
          isHost.value = true;
        }
        break;
        
      case 'BUZZER_PRESSED':
        activeBuzzer.value = data.username;
        break;
        
      case 'BUZZER_RESET':
        activeBuzzer.value = '';
        lockedBuzzer.value = false;
        break;
      
      case 'BUZZER_LOCK':
        lockedBuzzer.value = data.locked;
        break;
        
      case 'PLAYER_BUZZER_LOCKED':
        const player = players.value.find(p => p.id === data.playerId);
        if (player) {
          player.locked = data.locked;
        }
        break;
        
      case 'POINTS_UPDATED':
        players.value = data.players;
        break;

      case 'ERROR':
        break;
    }
  };
}

onMounted(() => {
  username.value = props.usernameProp;
  roomCode.value = props.roomCodeProp;
  
  // Check if admin was previously in a room
  const storedAdminRoom = localStorage.getItem('buzzerAdminRoom');
  const storedAdminUser = localStorage.getItem('buzzerAdminUser');
  
  if (storedAdminRoom && storedAdminUser === username.value) {
    roomCode.value = storedAdminRoom;
    isHost.value = true;
  }
  
  setupWebSocket();
});

onUnmounted(() => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'LEAVE_BUZZER_ROOM',
      username: username.value,
    }));
    ws.close();
  }
});
</script>

<template>
  <div class="buzzer-component">
    <h2>Buzzer Room: {{ roomCode }}</h2>
    <div class="players-list">
      <h3>Players</h3>
      <ul>
        <li v-for="player in sortedPlayers" :key="player.id">
          {{ player.username }} - Score: {{ player.score }}
          <span v-if="player.locked"> Bloqué</span>
          <template v-if="isHost">
            <button @click="lockPlayerBuzzer(player.id, !player.locked)">
              {{ player.locked ? 'Unlock' : 'Lock' }}
            </button>
            <button @click="awardPoints(player.id, 1)">+1</button>
            <button @click="awardPoints(player.id, -1)">-1</button>
          </template>
        </li>
      </ul>
    </div>
    <div class="buzzer-controls" style="position:relative;width:80vw;aspect-ratio: 1/1;" v-if="!isHost">
      <button 
        @click="pressBuzzer" 
        :disabled="lockedBuzzer || !!activeBuzzer"
        :class="{ 'buzzer-active': activeBuzzer === username }"
        style=" 
        background-color: red; 
        width: 100%;
        height: 100%;
        transform: translateY(-15px);
        left:0;
        border-radius:20%;
        aspect-ratio: 1/1;
        position:absolute;
        border:none;">
        BUZZ!!
      </button>
      <div style="background-color: #500000;width:100%;height:100%;border-radius: 20%;"></div>
    </div>
    <div class="buzzer-status" v-if="!isHost">
      <p v-if="activeBuzzer">La main est à : {{ activeBuzzer }}</p>
      <p v-if="lockedBuzzer">Buzzer Bloqué</p>
    </div>
    <div class="buzzer-status" v-if="isHost">
      <p v-if="activeBuzzer">La main est à : {{ activeBuzzer }}</p>
    </div>
    <div class="admin-panel" v-if="isHost">
      <button @click="resetBuzzer">Reset Buzzer</button>
    </div>
  </div>
</template>

<style scoped>
.buzzer-component {
  max-width: 1000px;
  margin: 0 auto;
  text-align: center;
}
.players-list {
  margin-bottom: 20px;
}
.players-list ul {
  list-style-type: none;
  padding: 0;
}
.players-list li {
  margin: 5px 0;
}
.buzzer-controls button {
  padding: 10px 20px;
  font-size: 16px;
}

.buzzer-active {
  background-color: red;
  color: white;
  transform:translateY(0) !important;
}
.admin-panel {
  margin-top: 20px;
}
</style>