<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title data-testid="title">IV Tester</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">IV Tester</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-list>
        <ion-item>
          <ion-input label="Enter the &ldquo;session&rdquo; data" label-placement="floating" v-model="data"></ion-input>
        </ion-item>

        <ion-item>
          <div style="flex: auto">
            <ion-button expand="block" @click="setSessionData">Set Session Data</ion-button>
          </div>
        </ion-item>

        <ion-item>
          <div style="flex: auto">
            <ion-button expand="block" @click="restoreDataFromVault">Restore Session Data</ion-button>
          </div>
        </ion-item>

        <ion-item>
          <div style="flex: auto">
            <ion-button expand="block" @click="clearDataFromVault">Clear Vault</ion-button>
          </div>
        </ion-item>

        <ion-item>
          <div style="flex: auto">
            <ion-button expand="block" @click="lockDataInVault">Lock Vault</ion-button>
          </div>
        </ion-item>

        <ion-item>
          <div style="flex: auto">
            <ion-button expand="block" @click="unlockVault">Unlock Vault</ion-button>
          </div>
        </ion-item>

        <ion-item>
          <ion-checkbox :disabled="!isMobile" :checked="privacyScreen" @ionChange="privacyScreenChanged"
            >Use Privacy Screen</ion-checkbox
          >
        </ion-item>

        <ion-item>
          <ion-radio-group v-model="lockType">
            <ion-list-header>
              <ion-label> Vault Locking Mechanism </ion-label>
            </ion-list-header>

            <ion-item>
              <ion-radio value="NoLocking">Do Not Lock</ion-radio>
            </ion-item>

            <ion-item>
              <ion-radio :disabled="!canUseBiometrics" value="Biometrics">Use Biometrics</ion-radio>
            </ion-item>

            <ion-item>
              <ion-radio :disabled="!canUseSystemPIN" value="SystemPasscode">Use System Passcode</ion-radio>
            </ion-item>

            <ion-item>
              <ion-radio :disabled="!canUseSystemPIN" value="Both">Use Both</ion-radio>
            </ion-item>
          </ion-radio-group>
        </ion-item>

        <ion-item>
          <ion-label>
            <div>Session Data: {{ session }}</div>
            <div>Vault is Locked: {{ vaultIsLocked }}</div>
            <div>Vault Exists: {{ vaultExists }}</div>
            <div>Vault Type: {{ vaultType }}</div>
            <div>Security Type: {{ vaultDeviceSecurityType }}</div>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
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
import { ref } from 'vue';
import { Device } from '@ionic-enterprise/identity-vault';
import { useVault } from '@/composables/vault';

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

const {
  lockType,
  session,
  vaultExists,
  vaultIsLocked,
  vaultType,
  vaultDeviceSecurityType,

  lockVault,
  unlockVault,

  setSession,
  restoreSession,
  clearVault,
} = useVault();

const setSessionData = async () => {
  try {
    await setSession(data.value);
    data.value = '';
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    alert(JSON.stringify(err));
  }
};

const lockDataInVault = async () => {
  try {
    await lockVault();
    data.value = '';
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    alert(JSON.stringify(err));
  }
};

const restoreDataFromVault = async () => {
  try {
    await restoreSession();
    data.value = session.value || '';
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    alert(JSON.stringify(err));
  }
};

const clearDataFromVault = async () => {
  try {
    await clearVault();
    data.value = '';
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    alert(JSON.stringify(err));
  }
};
</script>

<style scoped></style>
