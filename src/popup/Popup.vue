<template>
  <div class="text-sm p-2" id="popup" ref="popup">
    <section v-if="status.action !== 'editingJSON'">
      <div class="flex">
        <span
          class="cursor-pointer text-green-300 hover:text-green-600 mr-2 mt-4 w-6 relative"
          @click="addToggle"
        >
          <AddIcon
            :size="20"
            class="absolute"
            :class="status.action === 'adding' ? 'adding' : ''"
          />
        </span>
        <div class="relative w-full mt-px pt-px">
          <transition name="fade" mode="out-in">
            <b-field v-if="status.action !== 'adding'" class="h-12">
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
            <div v-else class="">
              <div>
                <b-radio
                  v-model="addType"
                  name="type"
                  native-value="local"
                  size="is-small"
                  type="is-success"
                >
                  Local Storage
                </b-radio>
                <b-radio
                  v-model="addType"
                  name="type"
                  native-value="session"
                  size="is-small"
                  type="is-success"
                >
                  Session Storage
                </b-radio>
              </div>
              <div>
                <b-field grouped>
                  <b-input
                    size="is-small"
                    placeholder="Key"
                    v-model="addKey"
                    @keydown.native.enter="add"
                  ></b-input>
                  <b-input
                    size="is-small"
                    placeholder="Value (Optional)"
                    v-model="addValue"
                    @keydown.native.enter="add"
                  ></b-input>
                  <p class="control">
                    <b-button type="is-success" size="is-small" @click="add">
                      Add
                    </b-button>
                  </p>
                  <p class="control">
                    <b-button
                      type="is-light"
                      size="is-small"
                      @click="addToggle"
                    >
                      Cancel
                    </b-button>
                  </p>
                </b-field>
              </div>
            </div>
          </transition>
        </div>
        <span
          class="cursor-pointer text-green-300 hover:text-green-600 mr-2 mt-4 w-6"
          @click="popup2"
          v-if="!isPopup2"
        >
          <OpenIcon :size="20" />
        </span>
      </div>
      <b-table
        :data="table"
        :striped="false"
        :narrowed="true"
        :hoverable="true"
        :mobile-cards="false"
        :row-class="() => 'group'"
        :sticky-header="false"
        v-cloak
      >
        <template slot-scope="props">
          <b-table-column
            field="key"
            label="Key"
            class="w-32"
            :width="128"
            :class="[props.row._type, props.row._json ? 'json' : '']"
          >
            <div class="content-cell overflow-y-auto">{{ props.row.key }}</div>
          </b-table-column>
          <b-table-column field="value" label="Value" class="cursor-pointer">
            <div
              @click="
                editing(
                  props.row.key,
                  props.row._type,
                  props.row._json,
                  props.row._index
                )
              "
              v-if="!isEditing(props.row.key, props.row._type)"
              class="content-cell overflow-y-auto max-w-xs"
              key="raw"
              v-text="props.row.value"
            ></div>
            <div
              v-else
              contenteditable
              class="bg-blue-100"
              ref="editor"
              key="editing"
              v-text="status.value"
              @keydown.enter.prevent="edit(props.row.key, props.row._type)"
            ></div>
          </b-table-column>
          <b-table-column
            class="w-36"
            :class="`${props.row._type}-${props.row._index}`"
          >
            <div class="flex justify-end">
              <span
                class="cursor-pointer text-blue-300 hover:text-blue-600 mr-1 invisible group-hover:visible"
                v-if="
                  !isRemoving(props.row.key, props.row._type) &&
                    !isEditing(props.row.key, props.row._type)
                "
              >
                <EditIcon
                  :size="20"
                  title="Edit"
                  @click="
                    editing(
                      props.row.key,
                      props.row._type,
                      props.row._json,
                      props.row._index
                    )
                  "
                />
              </span>
              <span
                class="cursor-pointer text-red-300 hover:text-red-600 invisible group-hover:visible"
                @click="removing(props.row.key, props.row._type)"
                v-if="
                  !isRemoving(props.row.key, props.row._type) &&
                    !isEditing(props.row.key, props.row._type)
                "
              >
                <DeleteIcon :size="20" title="Delete?" />
              </span>
              <span
                class="h-5 w-32"
                :class="`${props.row._type}-${props.row._index}`"
                v-if="isEditing(props.row.key, props.row._type)"
              >
                <span :class="ioFix">
                  <b-button
                    size="is-small"
                    type="is-success"
                    class="mr-1"
                    @click="edit(props.row.key, props.row._type)"
                  >
                    Submit
                  </b-button>
                  <b-button
                    size="is-small"
                    type="is-light"
                    @click="cancel(props.row.key, props.row._type)"
                  >
                    Discard
                  </b-button>
                </span>
              </span>
              <span v-if="isRemoving(props.row.key, props.row._type)">
                <b-button
                  size="is-small"
                  type="is-danger"
                  class="mr-1"
                  @click="remove(props.row.key, props.row._type)"
                >
                  Delete
                </b-button>
                <b-button
                  size="is-small"
                  type="is-light"
                  @click="cancel(props.row.key, props.row._type)"
                >
                  Cancel
                </b-button>
              </span>
            </div>
          </b-table-column>
        </template>
        <template slot="footer">
          <div class="flex mt-2 text-xs">
            <div class="items-end" v-if="d.local.length || d.session.length">
              <span class="text-grey-700">Used Space:</span>
              <span class="text-local mr-2" v-if="d.local.length">
                Local: {{ localSize }}Mb
              </span>
              <span class="text-session" v-if="d.session.length">
                Session: {{ sessionSize }}Mb
              </span>
            </div>
            <div class="ml-auto flex-grow flex justify-end">
              <a
                href="https://github.com/sponsors/andrelion"
                target="_blank"
                class="flex justify-end text-pink-300 hover:text-sponsor mr-2"
              >
                <HeartIcon :size="16" class="mr-1" />
                Sponsor
              </a>
              <a
                href="https://github.com/AndreLion/html5-localstorage-manager/issues"
                target="_blank"
                class="flex justify-end text-grey-500 hover:text-grey-700"
              >
                <BugIcon :size="16" class="mr-1" />
                Report Bug
              </a>
            </div>
          </div>
        </template>
        <template slot="empty">
          <div class="text-grey-700">
            <div
              class="h-16 flex items-center justify-center"
              v-if="d.session.length === 0 && d.local.length === 0"
            >
              No data stored in local / session storage
            </div>
            <div class="text-center" v-else>
              Storage data is hidden
            </div>
          </div>
        </template>
      </b-table>
    </section>
    <section v-else>
      <div class="flex justify-end py-2">
        <span class="mr-auto" ref="jsonKey">
          Editing {{ status.type }}Storage: {{ status.key }}
        </span>
        <b-button
          size="is-small"
          type="is-success"
          class="mr-1"
          @click="editJSON"
        >
          Submit
        </b-button>
        <b-button size="is-small" type="is-light" @click="cancelJSON">
          Discard
        </b-button>
      </div>
      <JsonEditor
        v-model="status.json"
        :show-btns="false"
        :expandedOnStart="true"
      />
    </section>
  </div>
</template>
<script>
import { Component, Vue, Ref } from "vue-property-decorator";
import DeleteIcon from "vue-material-design-icons/DeleteOutline.vue";
import EditIcon from "vue-material-design-icons/PencilOutline.vue";
import HeartIcon from "vue-material-design-icons/HandHeart.vue";
import BugIcon from "vue-material-design-icons/Bug.vue";
import AddIcon from "vue-material-design-icons/PlusCircleOutline.vue";
import OpenIcon from "vue-material-design-icons/OpenInNew.vue";
import JsonEditor from "vue-json-editor";

@Component({
  components: {
    EditIcon,
    HeartIcon,
    BugIcon,
    DeleteIcon,
    AddIcon,
    OpenIcon,
    JsonEditor
  }
})
export default class Popup extends Vue {
  @Ref("editor")
  editor;

  @Ref("popup")
  popup;

  @Ref("jsonKey")
  jsonKey;

  checked = ["local", "session"];
  d = {
    local: [],
    session: []
  };
  status = {
    action: null,
    key: null,
    type: null,
    value: null,
    json: null
  };
  e = null;
  addType = "local";
  addKey = "";
  addValue = "";
  isPopup2 = false;
  ioButtons = null;
  ioCell = null;
  ioFix = "";

  mounted() {
    // Mock
    // this.$set(this.d, "local", [{"key":"wrap","value":`{"frameworks.css":"https://github.githubassets.com/assets/frameworks-feecb8f4bc5dce34742f7eae4fa0a799.css","site.css":"https://github.githubassets.com/assets/site-dfba4b408f2494358f8d655558507d21.css","github.css":"https://github.githubassets.com/assets/github-0f40d092afafb6fe64b4577654ba8a62.css"}`},{ key: "mockKey-mockKey-mockKey-mockKey-mockKey-mockKey-mockKey-mockKey-mockKey-mockKey-mockKey-mockKey-mockKey-mockKey-mockKey-mockKey-mockKey-mockKey-mockKey-mockKey-mockKey-mockKey", value: `{a:1}` }, { key: "JSON", value: `[{"a":1}]` }, { key: "longKey", value: `x[{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"}, {"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"}, {"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"}]` }, { key: "shortKey", value: `abc` }, { key: "shortKey", value: `abc` }, { key: "shortKey", value: `abc` }, { key: "shortKey", value: `abc` }, { key: "shortKey", value: `abc` }, { key: "shortKey", value: `abc` }, { key: "shortKey", value: `abc` }, { key: "shortKey", value: `abc` }, { key: "shortKey", value: `abc` }, { key: "shortKey", value: `abc` }, { key: "shortKey", value: `abc` }, { key: "shortKey", value: `abc` }, { key: "shortKey", value: `abc` }, { key: "shortKey", value: `abc` }, { key: "shortKey", value: `abc` }]);
    // this.$set(this.d, "session", [{ key: "mockSession", value: `123` }]);

    try {
      chrome.runtime.sendMessage({ source: "popup", event: "mounted" });
      chrome.runtime.onConnect.addListener(port => {
        port.onMessage.addListener(msg => {
          const query = { active: true, currentWindow: true };
          chrome.tabs.query(query, tabs => {
            if (tabs.length && tabs[0].url) {
              if (tabs.length && tabs[0].url.startsWith(msg.origin)) {
                this.$set(this.d, "local", msg.local || []);
                this.$set(this.d, "session", msg.session || []);
              }
            } else {
              this.$set(this.d, "local", msg.local || []);
              this.$set(this.d, "session", msg.session || []);
            }
            if (this.d.local.length === 0 && this.d.session.length === 0) {
              this.status.action = "adding";
            }
          });
        });
      });
    } catch (e) {
      this.e = e;
    }
    if (location.hash === "#popup2") {
      this.isPopup2 = true;
    }
    const options = {
      root: this.popup,
      rootMargin: "0px",
      threshold: 1.0
    };
    this.ioButtons = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.ioFix = "";
        } else {
          if (entry.boundingClientRect.bottom > 300) {
            this.ioFix = "fix-bottom";
          } else if (entry.boundingClientRect.top < 300) {
            this.ioFix = "fix-top";
          }
        }
      });
    }, options);
    this.ioCell = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.boundingClientRect.bottom > 300) {
            this.ioFix = "fix-bottom";
          } else if (entry.boundingClientRect.top < 0) {
            this.ioFix = "fix-top";
          }
        } else {
          this.ioFix = "";
        }
      });
    }, Object.assign(options, { threshold: 0 }));
  }

  async editing(key, type, isJson, index) {
    this.status.key = key;
    this.status.type = type;
    const filtered = this.d[type].filter(item => item.key === key);
    if (isJson) {
      this.status.action = "editingJSON";
      this.status.json = JSON.parse(filtered[0].value);
      await this.$nextTick();
      window.scrollTo(0, 0);
      this.jsonKey.scrollIntoView();
    } else {
      this.status.action = "editing";
      await this.$nextTick();
      this.status.value = filtered[0].value;
      this.editor.focus();
      this.ioButtons.observe(document.querySelector(`span.${type}-${index}`));
      this.ioCell.observe(document.querySelector(`td.${type}-${index}`));
    }
  }

  removing(key, type) {
    this.status.action = "removing";
    this.status.key = key;
    this.status.type = type;
  }

  cancel() {
    this.status.action = null;
    this.status.key = null;
    this.status.type = null;
    this.status.value = null;
    this.ioButtons.disconnect();
    this.ioCell.disconnect();
  }

  edit(key, type, v) {
    const value = v ? v : this.editor.textContent.trim();
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs.length) {
          const activeTab = tabs[0];
          chrome.tabs.sendMessage(activeTab.id, {
            source: "popup",
            event: "edit",
            type,
            key,
            value
          });
        }
      });
    } catch (e) {
      this.e = e;
    }
    this.status.action = null;
    this.status.key = null;
    this.status.type = null;
    this.status.value = null;
  }

  cancelJSON() {
    this.status.action = null;
    this.status.key = null;
    this.status.type = null;
    this.status.json = null;
  }

  editJSON() {
    this.edit(
      this.status.key,
      this.status.type,
      JSON.stringify(this.status.json)
    );
  }

  remove(key, type) {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs.length) {
          const activeTab = tabs[0];
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
      this.status.action === "removing" &&
      this.status.type === type &&
      this.status.key === key
    );
  }

  isEditing(key, type) {
    return (
      this.status.action === "editing" &&
      this.status.type === type &&
      this.status.key === key
    );
  }

  isJSON(value) {
    if (value.startsWith("[") || value.startsWith("{")) {
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

  addToggle() {
    if (this.status.action === "adding") {
      this.status.action = null;
    } else {
      this.status.action = "adding";
    }
  }

  add() {
    if (!this.addKey) {
      return;
    }
    try {
      const key = this.addKey;
      const value = this.addValue;
      const type = this.addType;
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs.length) {
          const activeTab = tabs[0];
          chrome.tabs.sendMessage(activeTab.id, {
            source: "popup",
            event: "add",
            type,
            key,
            value
          });
        }
      });
    } catch (e) {
      this.e = e;
    } finally {
      this.addKey = "";
      this.addValue = "";
    }
    this.status.action = null;
    this.status.key = null;
    this.status.type = null;
    this.status.value = null;
  }

  popup2() {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs.length) {
          const activeTab = tabs[0];
          chrome.tabs.sendMessage(activeTab.id, {
            source: "popup",
            event: "popup2",
            hash: ""
          });
        }
      });
    } catch (e) {
      this.e = e;
    }
  }

  calculateSize(type) {
    const content = this.d[type]
      .map(item => [item.key, item.value])
      .flat()
      .join("");
    const byte = new Blob([content]).size;
    return (byte / 1024).toFixed(2);
  }

  get table() {
    let result = [];
    if (this.checked.includes("local")) {
      result = result.concat(
        this.d.local.map((item, index) => ({
          ...item,
          _type: "local",
          _json: this.isJSON(item.value),
          _index: index
        }))
      );
    }

    if (this.checked.includes("session")) {
      result = result.concat(
        this.d.session.map((item, index) => ({
          ...item,
          _type: "session",
          _json: this.isJSON(item.value),
          _index: index
        }))
      );
    }
    return result;
  }

  get localSize() {
    return this.calculateSize("local");
  }

  get sessionSize() {
    return this.calculateSize("session");
  }
}
</script>
<style src="../style.css" />
