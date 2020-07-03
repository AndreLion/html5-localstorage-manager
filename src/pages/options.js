import Vue from 'vue'
import App from '../components/Options.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#options')
