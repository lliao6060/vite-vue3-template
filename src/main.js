import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import pinia from './store';
import 'maju-ui';
import "@/assets/styles/global.scss";
import common from '@/common.js'
import { getImageUrl, mobileDevice } from  '@/utils'
import fixLandscape from './mixin/fix-landscape.js'

import VueLazyLoad from 'vue3-lazyload'
import VueCountdown from '@chenfengyuan/vue-countdown';

const app = createApp(App);

app.config.globalProperties.$common = common;
app.use(VueLazyLoad, {
  loading: mobileDevice ? getImageUrl('loading_p.jpg') : getImageUrl('loading_1920X765.jpg'),
  lifecycle:{
    loading: (el) => {
      console.log('loading', el)
    },
    error: (el) => {
      console.log('error', el)
    },
    loaded: (el) => {
      console.log('loaded', el)
    }
  }
})
app.component(VueCountdown.name, VueCountdown);

app.use(pinia);
app.use(router);
app.mixin(fixLandscape)

app.mount('#app')
