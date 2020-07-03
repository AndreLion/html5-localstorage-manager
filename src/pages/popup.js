import Vue from 'vue'
import App from '../components/Popup.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#popup')
