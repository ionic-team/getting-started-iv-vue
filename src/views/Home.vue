<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Blank</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Blank</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-list>
        <ion-item>
          <ion-label position="floating">Enter the "session" data</ion-label>
          <ion-input v-model="data"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label>
            <ion-button expand="block" @click="setSession(data)"
              >Set Session Data</ion-button
            >
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label>
            <ion-button expand="block" @click="restoreSession"
              >Restore Session Data</ion-button
            >
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label>
            <div>Session Data: {{ session }}</div>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { defineComponent, ref } from 'vue';
import useVault from '@/services/useVault';

export default defineComponent({
  name: 'Home',
  components: {
    IonButton,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonPage,
    IonTitle,
    IonToolbar,
  },
  setup() {
    const data = ref('');

    return { ...useVault(), data };
  },
});
</script>

<style scoped></style>
