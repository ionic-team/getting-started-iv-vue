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
            <ion-button expand="block" @click="setSession(data)">Set Session Data</ion-button>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label>
            <ion-button expand="block" @click="restoreSession">Restore Session Data</ion-button>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label>
            <ion-button expand="block" @click="clearVault">Clear Vault</ion-button>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label>
            <ion-button expand="block" @click="lockVault">Lock Vault</ion-button>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label>
            <ion-button expand="block" @click="unlockVault">Unlock Vault</ion-button>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label>Use Privacy Screen</ion-label>
          <ion-checkbox :disabled="!isMobile" :checked="privacyScreen" @ionChange="privacyScreenChanged"></ion-checkbox>
        </ion-item>

        <ion-item>
          <ion-radio-group v-model="lockType">
            <ion-list-header>
              <ion-label> Vault Locking Mechanism </ion-label>
            </ion-list-header>

            <ion-item>
              <ion-label>Do Not Lock</ion-label>
              <ion-radio value="NoLocking"></ion-radio>
            </ion-item>

            <ion-item>
              <ion-label>Use Biometrics</ion-label>
              <ion-radio :disabled="!canUseBiometrics" value="Biometrics"></ion-radio>
            </ion-item>

            <ion-item>
              <ion-label>Use System Passcode</ion-label>
              <ion-radio :disabled="!canUseSystemPIN" value="SystemPasscode"></ion-radio>
            </ion-item>
          </ion-radio-group>
        </ion-item>

        <ion-item>
          <ion-label>
            <div>Session Data: {{ session }}</div>
            <div>Vault is Locked: {{ vaultIsLocked }}</div>
            <div>Vault Exists: {{ vaultExists }}</div>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonButton,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonTitle,
  IonToolbar,
  isPlatform,
} from '@ionic/vue';
import { defineComponent, ref } from 'vue';
import { Device } from '@ionic-enterprise/identity-vault';
import useVault from '@/services/useVault';

export default defineComponent({
  name: 'Home',
  components: {
    IonButton,
    IonCheckbox,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonPage,
    IonRadio,
    IonRadioGroup,
    IonTitle,
    IonToolbar,
  },
  setup() {
    const isMobile = isPlatform('hybrid');
    const canUseBiometrics = ref(false);
    const canUseSystemPIN = ref(false);
    const data = ref('');
    const privacyScreen = ref(false);

    Device.isSystemPasscodeSet().then((x) => (canUseSystemPIN.value = x));
    Device.isBiometricsEnabled().then((x) => (canUseBiometrics.value = x));
    Device.isHideScreenOnBackgroundEnabled().then((x) => (privacyScreen.value = x));

    const privacyScreenChanged = (evt: { detail: { checked: boolean } }) => {
      Device.setHideScreenOnBackground(evt.detail.checked);
    };

    return {
      ...useVault(),
      canUseBiometrics,
      canUseSystemPIN,
      isMobile,
      data,
      privacyScreen,
      privacyScreenChanged,
    };
  },
});
</script>

<style scoped></style>
