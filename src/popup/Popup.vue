<template>
  <div class="border-4 border-black">
    This is Popup in /popup
    {{ timestamp }}
  </div>
</template>
<script>
import { Component, Vue } from "vue-property-decorator";

@Component
export default class Popup extends Vue {
  mounted() {
    chrome.runtime.sendMessage({source:'popup',event:'mounted'});
    chrome.runtime.onConnect.addListener((port) => {
      port.onMessage.addListener((msg) => {
        this.timestamp = msg.local.timestamp;
      });
    });
  }

  timestamp = null;

};
</script>
<style src="../style.css" />
