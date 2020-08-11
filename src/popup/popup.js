import Vue from "vue";
import Buefy from "buefy";
import Popup from "./Popup.vue";
import "buefy/dist/buefy.css";

Vue.config.productionTip = false;
Vue.use(Buefy);

new Vue({
  render: h => h(Popup)
}).$mount("#popup");
