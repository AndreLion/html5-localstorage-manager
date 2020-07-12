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
      :row-class="() => 'group cursor-pointer'"
      :sticky-header="true"
    >
      <template slot-scope="props">
        <b-table-column field="key" label="Key" class="w-20">
          {{ props.row.key }}
        </b-table-column>
        <b-table-column field="value" label="Value">
          {{ props.row.value }}
        </b-table-column>
        <b-table-column class="w-40">
          <div class="flex justify-end ">
            <span
              class="text-blue-300 hover:text-blue-600 mr-1 invisible group-hover:visible"
              v-if="!isDeleting(props.row.key, props.row._type)"
            >
              <EditIcon :size="20" title="Edit" />
            </span>
            <span
              class="text-red-300 hover:text-red-600 invisible group-hover:visible"
              @click="deleting(props.row.key, props.row._type)"
              v-if="!isDeleting(props.row.key, props.row._type)"
            >
              <DeleteIcon :size="20" title="Delete?" />
            </span>
            <b-button
              size="is-small"
              type="is-danger"
              class="mr-1"
              v-if="isDeleting(props.row.key, props.row._type)"
              @click="deleteItem(props.row.key, props.row._type)"
            >
              Delete
            </b-button>
            <b-button
              size="is-small"
              type="is-light"
              v-if="isDeleting(props.row.key, props.row._type)"
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
import EditIcon from "vue-material-design-icons/SquareEditOutline.vue";
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
  mounted() {
    // Mock
    this.$set(this.d, "local", [{ key: "mockKey", value: `123` }, { key: "longKey", value: `[{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},trrt{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"}]tt非人vvvvaaaa` }, { key: "shortKey", value: `abc` }]);

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
      console.log("erro");
    }
  }

  deleting(key, type) {
    console.log("deleting", key, type);
    this.status.action = "deleting";
    this.status.key = key;
    this.status.type = type;
  }

  cancel(key, type) {
    console.log("cancel", key, type);
    this.status.action = null;
    this.status.key = null;
    this.status.type = null;
  }

  deleteItem(key, type) {
    console.log("delete", key, type);
    this.status.action = null;
    this.status.key = null;
    this.status.type = null;
  }

  isDeleting(key, type) {
    return (
      this.status.action === "deleting" &&
      this.status.type === type &&
      this.status.key === key
    );
  }

  get table() {
    let result = [];
    if (this.checked.includes("local")) {
      result = result.concat(
        this.d.local.map(item => ({
          ...item,
          _type: "local"
        }))
      );
    }

    if (this.checked.includes("session")) {
      result = result.concat(
        this.d.session.map(item => ({
          ...item,
          _type: "session"
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
