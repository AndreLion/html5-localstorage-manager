<template>
  <div class="text-sm">
    <section>
      <b-field>
        <b-checkbox
          v-model="checked"
          native-value="local"
          size="is-small"
          :disabled="d.local.length === 0"
          >Local Storage ({{ d.local.length }})</b-checkbox
        >
        <b-checkbox
          v-model="checked"
          native-value="session"
          type="is-info"
          size="is-small"
          :disabled="d.session.length === 0"
          >Session Storage ({{ d.session.length }})</b-checkbox
        >
      </b-field>
    </section>
    <b-table
      :data="table"
      :striped="false"
      :narrowed="true"
      :hoverable="true"
      :mobile-cards="false"
      :row-class="() => 'group'"
      :sticky-header="true"
    >
      <template slot-scope="props">
        <b-table-column
          field="key"
          label="Key"
          class="w-20"
          :class="[props.row._type]"
        >
          {{ props.row.key }}
        </b-table-column>
        <b-table-column
          field="value"
          label="Value"
          class="cursor-pointer"
          :class="props.row._json ? 'json' : (props.row._eval ? 'eval' : '')"
        >
          {{ props.row.value }}
        </b-table-column>
        <b-table-column class="w-40">
          <div class="flex justify-end ">
            <span
              class="cursor-pointer text-blue-300 hover:text-blue-600 mr-1 invisible group-hover:visible"
              v-if="!isRemoving(props.row.key, props.row._type)"
            >
              <EditIcon :size="20" title="Edit" />
            </span>
            <span
              class="cursor-pointer text-red-300 hover:text-red-600 invisible group-hover:visible"
              @click="remove(props.row.key, props.row._type)"
              v-if="!isRemoving(props.row.key, props.row._type)"
            >
              <DeleteIcon :size="20" title="Delete?" />
            </span>
            <b-button
              size="is-small"
              type="is-danger"
              class="mr-1"
              v-if="isRemoving(props.row.key, props.row._type)"
              @click="removeItem(props.row.key, props.row._type)"
            >
              Delete
            </b-button>
            <b-button
              size="is-small"
              type="is-light"
              v-if="isRemoving(props.row.key, props.row._type)"
              @click="cancel(props.row.key, props.row._type)"
            >
              Cancel
            </b-button>
          </div>
        </b-table-column>
      </template>
      <template slot="footer">
        <div class="has-text-right">
          <a href="#" class="flex justify-end">
            <HeartIcon :size="20" />
            Sponsor
          </a>
        </div>
      </template>
    </b-table>
  </div>
</template>
<script>
import { Component, Vue } from "vue-property-decorator";
import DeleteIcon from "vue-material-design-icons/DeleteOutline.vue";
import EditIcon from "vue-material-design-icons/PencilOutline.vue";
import HeartIcon from "vue-material-design-icons/HandHeart.vue";

@Component({
  components: {
    EditIcon,
    HeartIcon,
    DeleteIcon
  }
})
export default class Popup extends Vue {
  checked = ["local", "session"];
  d = {
    local: [],
    session: []
  };
  status = {
    action: null,
    key: null,
    type: null
  };
  e = null;
  mounted() {
    // Mock
    this.$set(this.d, "local", [{ key: "mockKey", value: `{a:1}` }, { key: "JSON", value: `[{"a":1}]` }, { key: "longKey", value: `[{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},trrt{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"}]tt非人vvvvaaaa` }, { key: "shortKey", value: `abc` }]);
    this.$set(this.d, "session", [{ key: "mockSession", value: `123` }]);

    try {
      chrome.runtime.sendMessage({ source: "popup", event: "mounted" });
      chrome.runtime.onConnect.addListener(port => {
        port.onMessage.addListener(msg => {
          const query = { active: true, currentWindow: true };
          chrome.tabs.query(query, tabs => {
            if (tabs.length && tabs[0].url.startsWith(msg.origin)) {
              this.$set(this.d, "local", msg.local || []);
              this.$set(this.d, "session", msg.session || []);
            }
          });
        });
      });
    } catch (e) {
      this.e = e;
    }
  }

  remove(key, type) {
    console.log("Remove", key, type);
    this.status.action = "remove";
    this.status.key = key;
    this.status.type = type;
  }

  cancel(key, type) {
    console.log("cancel", key, type);
    this.status.action = null;
    this.status.key = null;
    this.status.type = null;
  }

  removeItem(key, type) {
    console.log("Remove", key, type);
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs.length) {
          const activeTab = tabs[0];
          console.log('target tab id', activeTab.id);
          console.log(type, key);
          chrome.tabs.sendMessage(activeTab.id, {
            source: "popup",
            event: "remove",
            type,
            key
          });
        }
      });
    } catch (e) {
      this.e = e;
    }
    this.status.action = null;
    this.status.key = null;
    this.status.type = null;
  }

  isRemoving(key, type) {
    return (
      this.status.action === "remove" &&
      this.status.type === type &&
      this.status.key === key
    );
  }

  isJSON(value) {
    if(value.startsWith('[') || value.startsWith('{')){
      try {
        JSON.parse(value);
        return true;
      } catch (e) {
        this.e = e;
      }
      return false;
    }
    return false;
  }

  isEval(value) {
    if(value.startsWith('[') || value.startsWith('{')){
      try {
        eval(value);
        return true;
      } catch (e) {
        this.e = e;
      }
      return false;
    }
    return false;
  }

  get table() {
    let result = [];
    if (this.checked.includes("local")) {
      result = result.concat(
        this.d.local.map(item => ({
          ...item,
          _type: "local",
          _eval: this.isEval(item.value),
          _json: this.isJSON(item.value)
        }))
      );
    }

    if (this.checked.includes("session")) {
      result = result.concat(
        this.d.session.map(item => ({
          ...item,
          _type: "session",
          _eval: this.isEval(item.value),
          _json: this.isJSON(item.value)
        }))
      );
    }
    return result;
  }

  get columns() {
    return [
      {
        field: "key",
        label: "Key",
        width: "40"
      },
      {
        field: "value",
        label: "Value"
      }
    ];
  }
}
</script>
<style src="../style.css" />
