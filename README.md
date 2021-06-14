# Getting Started with Identity Vault in `@ionic/vue`

This application walks through the basic setup and use of Ionic's Identity Vault in an `@ionic/vue` application. Rather than connecting to a back end service and storing the session data this application will just store information that you type in and tell it to store. Almost all of the work done here will be concentrated on a couple of files:

- `src/services/useVault.ts`: a composition API function that abstracts the logic associated with using Identity Vault. This functions and reactive variable exported here model what might be done in a real application.
- `src/views/Home.vue`: the main view will have several form controls that allow the user to manipulate the vault. An application would not typically do this. Rather, it would call the methods from `useVault()` within various workflows. In this "getting started" demo application, however, this allows us to easily play around with the various APIs to see how they behave.

## Generate the Application

The first thing we need to do is generate our application.

```bash
ionic start getting-started-iv-vue blank --type=vue
```

Now that the application has been generated, let's also add the native platforms.

Open the `capacitor.config.ts` file and change the `appId` to something unique like `io.ionic.gettingstartedivvue`:

```TypeScript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.gettingstartedivvue',
  appName: 'getting-started-iv-vue',
  webDir: 'dist',
  bundledWebRuntime: false
};

export default config;
```

Next, build the application, then install and create the platforms:

```bash
npm run build
ionic cap add android
ionic cap add ios
```

Finally, in order to ensure that a `cap copy` with each build, add it to the build script in the `package.json` file as such:

```JSON
  "scripts": {
    "build": "vue-cli-service build && cap copy",
    ...
  },
```

## Install Identity Vault

In order to install Identity Vault, you will need to use `ionic enterprise register` in order to register your product key. This will create a `.npmrc` file containing the product key. If you have already performed that step for your production application, you can just copy the `.npmrc` file from your production project. Since this application is just for learning purposes, you don't need to obtain another key. You can then install Identity Vault.

```bash
npm install @ionic-enterprise/identity-vault
```

## Create the Vault

In this step, we will create the vault and test it by storing an retrieving a value from it. We will call this value the `session` since storing session data in a vault is the most common use case. However, it is certainly not the _only_ use case.

First, create a file named `src/services/useVault.ts`. Within this file, we will define the vault as well as create a composition function that abstracts all of the logic we need in order to interact with the vault.

```TypeScript
import { ref } from 'vue';
import { Vault } from '@ionic-enterprise/identity-vault';

const config = {
  key: 'io.ionic.getstartedivvue',
  type: 'SecureStorage' as any,
  deviceSecurityType: 'SystemPasscode' as any,
  lockAfterBackgrounded: 2000,
  shouldClearVaultAfterTooManyFailedAttempts: true,
  customPasscodeInvalidUnlockAttempts: 2,
  unlockVaultOnLoad: false,
};
const key = 'sessionData';

const vault: Vault = new Vault(config);

const session = ref<string | null | undefined>();

export default function useVault() {
  const setSession = async (value: string): Promise<void> => {
    session.value = value;
    await vault.setValue(key, value);
  };

  const restoreSession = async () => {
    const value = await vault.getValue(key);
    session.value = value;
  };

  return {
    session,

    setSession,
    restoreSession,
  };
}
```

Let's look at this file section by section. The first thing we do is define a configuration for our vault. The `key` gives the vault a name. The other properties provide a default behavior for our vault, and as we shall see later, can be changed as we use the vault.

```TypeScript
const config = {
  key: 'io.ionic.getstartedivvue',
  type: 'SecureStorage' as any,
  deviceSecurityType: 'SystemPasscode' as any,
  lockAfterBackgrounded: 2000,
  shouldClearVaultAfterTooManyFailedAttempts: true,
  customPasscodeInvalidUnlockAttempts: 2,
  unlockVaultOnLoad: false,
};
```

Next, we will define a key for storing data. All data within the vault is stored as a key-value pair, and you can store multiple key-value pairs within a single vault. We will also create the vault as well as a reactive property that will be used to reflect the current `session` data to the outside world.

```TypeScript
const key = 'sessionData';

const vault: Vault = new Vault(config);

const session = ref<string | null | undefined>();
```

Finally, we create a composition function that returns our `session` as well defining a couple of functions that are used to set and restore our session:

```TypeScript
export default function useVault() {
  const setSession = async (value: string): Promise<void> => {
    session.value = value;
    await vault.setValue(key, value);
  };

  const restoreSession = async () => {
    const value = await vault.getValue(key);
    session.value = value;
  };

  return {
    session,

    setSession,
    restoreSession,
  };
}
```

**Note:** rather than create define functions such as `setSession()` and `restoreSession()`, we _could_ just return the `vault` from the composition function and use its API directly in the rest of the application. However, that would expose the rest of the application to potential API changes as well as potentially result in duplicated code. In my opinion, it is a much better option to return functions that define how I would like the rest of the application to interact with the vault. This makes the code more maintainable and easier to debug.

Now that we have the vault in place, let's switch over to `src/views/Home.vue` and code some simple interactions with the vault. Here is a snapshot of what we will change:

1. replace the "container" `div` with a list of form controls
1. add a `setup()` function
1. remove the existing styling

When we are done, the page will look like this:

```HTML
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
```

**Notes:**

1. As we continue with this tutorial, we will just provide the new markup or code that is required. Make sure to add the correct imports and component definitions will be up to you.
1. Notice that this view is returning the full return value of the `useVault()` composition function. This is just being done for convenience. Normally, you would use destructuring to just grab the bits that are needed in any component or service.
