<template>
  <div class="text-sm p-2" id="popup" ref="popup">
    <section v-if="status.action !== 'editingJSON'">
      <div class="flex">
        <span
          class="cursor-pointer text-green-300 hover:text-green-600 mr-2 mt-4 w-6 relative"
          @click="toggleAdd"
        >
          <AddIcon
            :size="20"
            class="absolute"
            :class="status.action === 'adding' ? 'adding' : ''"
          />
        </span>
        <div class="relative w-full mt-px pt-px">
          <transition name="fade" mode="out-in" @after-enter="afterEnter">
            <div v-if="status.action === 'adding'" :key="'adding'">
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
                <b-radio
                  v-model="addType"
                  name="type"
                  native-value="cookie"
                  size="is-small"
                  type="is-success"
                >
                  Cookie
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
                      @click="toggleAdd"
                    >
                      Cancel
                    </b-button>
                  </p>
                </b-field>
              </div>
            </div>
            <div
              v-else-if="status.isSearching"
              class="h-12 flex items-center justify-end pr-4"
              :key="'searching'"
            >
              <b-field custom-class="is-small" type="is-success">
                <b-input
                  placeholder="Search..."
                  size="is-small"
                  v-model="keyword"
                  type="search"
                  class="w-40"
                  ref="search"
                ></b-input>
              </b-field>
            </div>
            <b-field v-else class="h-12">
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
              <b-checkbox
                v-model="checked"
                native-value="cookie"
                type="is-warning"
                size="is-small"
                :disabled="d.cookie.length === 0"
                >Cookie ({{ d.cookie.length }})</b-checkbox
              >
            </b-field>
          </transition>
        </div>
        <span
          class="cursor-pointer text-green-300 hover:text-green-600 mr-2 mt-4 w-6"
          @click="toggleSearch"
        >
          <MagnifyPlusIcon v-if="!status.isSearching" :size="20" />
          <MagnifyCloseIcon v-else :size="20" />
        </span>
        <span
          class="cursor-pointer text-green-300 hover:text-green-600 mr-2 mt-4 w-6"
          @click="popup2"
          v-if="!isPopup2"
        >
          <OpenIcon :size="20" />
        </span>
      </div>
      <b-table
        class="mb-8"
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
              :key="'raw'"
              v-text="props.row.value"
            ></div>
            <div
              v-else
              contenteditable
              class="content-cell overflow-y-auto bg-blue-100"
              ref="editor"
              :key="'editing'"
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
                class="cursor-pointer text-yellow-600 hover:text-yellow-400 mr-1 group-hover:visible"
                :class="
                  favorites[`${props.row._type}_${props.row.key}`]
                    ? 'visible '
                    : 'invisible '
                "
                v-if="
                  !isRemoving(props.row.key, props.row._type) &&
                    !isEditing(props.row.key, props.row._type)
                "
              >
                <component
                  :is="getFavIcon(props.row.key, props.row._type)"
                  :size="20"
                  title="Edit"
                  @click="toggleFav(props.row.key, props.row._type)"
                />
              </span>
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
                  <b-button size="is-small" type="is-light" @click="cancel">
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
                <b-button size="is-small" type="is-light" @click="cancel">
                  Cancel
                </b-button>
              </span>
            </div>
          </b-table-column>
        </template>
        <template slot="footer">
          <div class="flex text-xs fixed bottom-0 w-full pr-5 py-2 bg-white">
            <div
              class="flex items-end"
              v-if="d.local.length || d.session.length"
            >
              <span class="text-grey-700 mr-1">Used Space:</span>

              <template v-if="d.local.length && !isNotRemovingAll('local')">
                <span
                  v-if="!isRemovingAll('local')"
                  class="mr-2 cursor-pointer group flex"
                  title="Delete All Local Storage?"
                  @click="removingAll('local')"
                >
                  <span class="text-local group-hover:line-through">
                    Local: {{ localSize }}
                  </span>
                  <span class="text-red-200 group-hover:text-red-400 group">
                    <DeleteIcon :size="18" class="group-hover:hidden" />
                    <DeleteHoverIcon
                      :size="18"
                      class="hidden group-hover:inline"
                    />
                  </span>
                </span>
                <span v-else class="flex">
                  <b-button
                    size="is-small"
                    type="is-danger"
                    class="mr-1"
                    @click="removeAll('local')"
                  >
                    Delete All LocalStorage
                  </b-button>
                  <span
                    class="text-grey-500 hover:text-grey-700 cursor-pointer"
                    @click="cancel"
                  >
                    <CloseCircleOutlineIcon :size="18" />
                  </span>
                </span>
              </template>

              <template v-if="d.session.length && !isNotRemovingAll('session')">
                <span
                  v-if="!isRemovingAll('session')"
                  class="mr-2 cursor-pointer group flex"
                  title="Delete All Session Storage?"
                  @click="removingAll('session')"
                >
                  <span class="text-session group-hover:line-through">
                    Session: {{ sessionSize }}
                  </span>
                  <span class="text-red-200 group-hover:text-red-400 group">
                    <DeleteIcon :size="18" class="group-hover:hidden" />
                    <DeleteHoverIcon
                      :size="18"
                      class="hidden group-hover:inline"
                    />
                  </span>
                </span>
                <span v-else class="flex">
                  <b-button
                    size="is-small"
                    type="is-danger"
                    class="mr-1"
                    @click="removeAll('session')"
                  >
                    Delete All SessionStorage
                  </b-button>
                  <span
                    class="text-grey-500 hover:text-grey-700 cursor-pointer"
                    @click="cancel"
                  >
                    <CloseCircleOutlineIcon :size="18" />
                  </span>
                </span>
              </template>

              <template v-if="d.cookie.length && !isNotRemovingAll('cookie')">
                <span
                  v-if="!isRemovingAll('cookie')"
                  class="mr-2 cursor-pointer group flex"
                  title="Delete All Cookie?"
                  @click="removingAll('cookie')"
                >
                  <span class="text-cookie group-hover:line-through">
                    Cookie: {{ cookieSize }}
                  </span>
                  <span class="text-red-200 group-hover:text-red-400 group">
                    <DeleteIcon :size="18" class="group-hover:hidden" />
                    <DeleteHoverIcon
                      :size="18"
                      class="hidden group-hover:inline"
                    />
                  </span>
                </span>
                <span v-else class="flex">
                  <b-button
                    size="is-small"
                    type="is-danger"
                    class="mr-1"
                    @click="removeAll('cookie')"
                  >
                    Delete All Cookie
                  </b-button>
                  <span
                    class="text-grey-500 hover:text-grey-700 cursor-pointer"
                    @click="cancel"
                  >
                    <CloseCircleOutlineIcon :size="18" />
                  </span>
                </span>
              </template>
            </div>
            <div class="flex-grow flex justify-end items-end">
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
            <div
              class="text-center"
              v-else-if="status.isSearching && this.keyword !== ''"
            >
              Search result is empty
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
          Editing {{ getDisplayType(status.type) }}: {{ status.key }}
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
import { Component, Vue, Ref, Watch } from "vue-property-decorator";
import DeleteIcon from "vue-material-design-icons/DeleteOutline.vue";
import DeleteHoverIcon from "vue-material-design-icons/Delete.vue";
import EditIcon from "vue-material-design-icons/PencilOutline.vue";
import HeartIcon from "vue-material-design-icons/HandHeart.vue";
import BugIcon from "vue-material-design-icons/Bug.vue";
import AddIcon from "vue-material-design-icons/PlusCircleOutline.vue";
import OpenIcon from "vue-material-design-icons/OpenInNew.vue";
import MagnifyPlusIcon from "vue-material-design-icons/MagnifyPlus.vue";
import MagnifyCloseIcon from "vue-material-design-icons/MagnifyClose.vue";
import StarOutlineIcon from "vue-material-design-icons/StarOutline.vue";
import CloseCircleOutlineIcon from "vue-material-design-icons/CloseCircleOutline.vue";
import StarIcon from "vue-material-design-icons/Star.vue";
import JsonEditor from "vue-json-editor";

@Component({
  components: {
    EditIcon,
    HeartIcon,
    BugIcon,
    DeleteIcon,
    DeleteHoverIcon,
    AddIcon,
    OpenIcon,
    MagnifyPlusIcon,
    MagnifyCloseIcon,
    CloseCircleOutlineIcon,
    JsonEditor
  }
})
export default class Popup extends Vue {
  @Ref("search")
  searchInput;

  @Ref("editor")
  editor;

  @Ref("popup")
  popup;

  @Ref("jsonKey")
  jsonKey;

  @Watch("checked")
  onCheckedChanged(checked) {
    console.log("on checked changed to", checked);
    try {
      const data = {};
      data[this.origin] = {
        favorites: this.favorites,
        checked
      };
      console.log("Set storage:", data);
      chrome.storage.sync.set(data, function() {
        console.log("Favorite storage set");
      });
    } catch (e) {
      console.log("Set favorites storage failed:", e);
    }
  }
  checked = [];
  d = {
    local: [],
    session: [],
    cookie: []
  };
  status = {
    action: null,
    key: null,
    type: null,
    value: null,
    json: null,
    index: null,
    isSearching: false
  };
  e = null;
  addType = "local";
  addKey = "";
  addValue = "";
  isPopup2 = false;
  ioButtons = null;
  ioCell = null;
  ioFix = "";
  origin = "";
  tabId = "";
  favorites = {};
  storageLoaded = false;
  lastUpdatedStorage = 0;
  lastUpdatedCookie = 0;
  keyword = "";

  mounted() {
    // Mock
    // this.$set(this.d, "local", [{"key":"wrap","value":"p:*|l:1_{\"state\":null,\"url\":\"/\",\"metadata\":{\"n$\":1595622219462,\"Ck\":1595622219463,\"kR\":1595622219464,\"jK\":0}}"},{"key":"snowplowOutQueue_spTrack_webTracker_get","value":`{"frameworks.css":"https://github.githubassets.com/assets/frameworks-feecb8f4bc5dce34742f7eae4fa0a799.css","site.css":"https://github.githubassets.com/assets/site-dfba4b408f2494358f8d655558507d21.css","github.css":"https://github.githubassets.com/assets/github-0f40d092afafb6fe64b4577654ba8a62.css"}`},{ key: "mockKey-mockKey-mockKey-mockKey-mockKey-mockKey-mockKey-mockKey-mockKey-mockKey-mockKey-mockKey-mockKey-mockKey-mockKey-mockKey-mockKey-mockKey-mockKey-mockKey-mockKey-mockKey", value: `{a:1}` }, { key: "JSON", value: `[{"a":1}]` }, { key: "longKey", value: `x[{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"}, {"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"}, {"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"},{"name":"John","age":31,"city":"New York"}]` }, { key: "shortKey", value: `abc` }, { key: "shortKey", value: `abc` }, { key: "shortKey", value: `abc` }, { key: "shortKey", value: `abc` }, { key: "shortKey", value: `abc` }, { key: "shortKey", value: `abc` }, { key: "shortKey", value: `abc` }, { key: "shortKey", value: `abc` }, { key: "shortKey", value: `abc` }, { key: "shortKey", value: `abc` }, { key: "shortKey", value: `abc` }, { key: "shortKey", value: `abc` }, { key: "shortKey", value: `abc` }, { key: "shortKey", value: `abc` }, { key: "shortKey", value: `abc` }]);
    // this.$set(this.d, "local", [{ key: "mockLocal", value: `123` }]);
    // this.$set(this.d, "session", [{ key: "mockSession", value: `123` }]);
    // this.$set(this.d, "cookie", [{ key: "mockCookie", value: `1223` }]);

    if (location.hash.startsWith("#popup2")) {
      this.isPopup2 = true;
      this.origin = location.hash.split("|")[1];
      this.tabId = parseInt(location.hash.split("|")[2]);
      console.log(
        "popup2 opened from origin:",
        this.origin,
        "Tab ID:",
        this.tabId
      );
    }
    try {
      chrome.runtime.sendMessage({
        source: this.isPopup2 ? "popup2" : "popup",
        event: "mounted"
      });
      chrome.runtime.onConnect.addListener(port => {
        port.onMessage.addListener(msg => {
          if (!this.origin) {
            this.origin = msg.origin;
          }
          if (!this.storageLoaded) {
            chrome.storage.sync.get([this.origin], result => {
              console.log("favorites in storage:", result);
              if (result && result[this.origin]) {
                this.favorites =
                  result[this.origin].favorites || this.favorites;
                this.checked = result[this.origin].checked || [
                  "local",
                  "session",
                  "cookie"
                ];
              } else {
                this.checked = ["local", "session", "cookie"];
              }
              this.storageLoaded = true;
            });
          }
          const query = { active: true, currentWindow: true };
          chrome.tabs.query(query, tabs => {
            if (tabs.length && tabs[0].url) {
              if (tabs.length && tabs[0].url.startsWith(msg.origin)) {
                this.update(msg);
              }
            } else {
              if (this.origin === msg.origin) {
                this.update(msg);
              }
            }
          });
        });
      });
    } catch (e) {
      console.log("Init Mounting Failed:", e);
    }
    if (this.isPopup2) {
      this.syncRequest();
    }
    const options = {
      root: this.popup,
      rootMargin: "-13px",
      threshold: 1.0
    };
    this.ioCell = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!this.isInViewport(entry.target)) {
            if (entry.boundingClientRect.bottom > 300) {
              console.log("IO: cell shows up, fix bottom");
              this.ioFix = "fix-bottom";
            } else if (entry.boundingClientRect.top < 0) {
              console.log("IO: cell shows up, fix top");
              this.ioFix = "fix-top";
            }
          }
        } else {
          console.log("IO: cell is hidden, no fix");
          this.ioFix = "";
        }
      });
    }, Object.assign(options, { threshold: 0 }));
    this.ioButtons = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          console.log("IO: button shows up , no fix");
          this.ioFix = "";
        } else {
          if (!this.isInViewport(entry.target.closest("td"))) {
            if (entry.boundingClientRect.bottom > 300) {
              console.log("IO: button is hidden, fix bottom");
              this.ioFix = "fix-bottom";
            } else if (entry.boundingClientRect.top < 300) {
              console.log("IO: button is hidden, fix top");
              this.ioFix = "fix-top";
            }
          }
        }
      });
    }, options);
  }

  update({ local = null, session = null, cookie = null, timestamp }) {
    if (local !== null || session !== null) {
      if (timestamp > this.lastUpdatedStorage) {
        local && this.$set(this.d, "local", local);
        session && this.$set(this.d, "session", session);
        this.lastUpdatedStorage = timestamp;
      }
    }
    if (cookie !== null) {
      if (timestamp > this.lastUpdatedCookie) {
        cookie && this.$set(this.d, "cookie", cookie);
        this.lastUpdatedCookie = timestamp;
      }
    }
  }

  async editing(key, type, isJson, index) {
    this.status.key = key;
    this.status.type = type;
    this.status.index = index;
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
    this.status.index = null;
    this.ioButtons.disconnect();
    this.ioCell.disconnect();
  }

  edit(key, type, v) {
    const value = v ? v : this.editor.textContent.trim();
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs.length) {
          const activeTab = tabs[0];
          const id = this.isPopup2 ? this.tabId : activeTab.id;
          chrome.tabs.sendMessage(id, {
            source: "popup",
            event: "edit",
            type,
            key,
            value
          });
        }
      });
    } catch (e) {
      console.log("Edit Failed:", e);
    }
    this.status.action = null;
    this.status.key = null;
    this.status.type = null;
    this.status.value = null;
    this.status.index = null;
    this.ioButtons.disconnect();
    this.ioCell.disconnect();
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
          const id = this.isPopup2 ? this.tabId : activeTab.id;
          chrome.tabs.sendMessage(id, {
            source: "popup",
            event: "remove",
            type,
            key
          });
        }
      });
    } catch (e) {
      console.log("Remove Failed:", e);
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

  removingAll(type) {
    console.log("removing all", type);
    this.status.action = "removingAll";
    this.status.type = type;
  }

  removeAll(type) {
    console.log("remove all", type);
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs.length) {
          const activeTab = tabs[0];
          const id = this.isPopup2 ? this.tabId : activeTab.id;
          chrome.tabs.sendMessage(id, {
            source: "popup",
            event: "removeAll",
            type
          });
        }
      });
    } catch (e) {
      console.log("Remove All Failed:", e);
    }
    this.status.action = null;
    this.status.key = null;
    this.status.type = null;
  }

  isRemovingAll(type) {
    return this.status.action === "removingAll" && this.status.type === type;
  }

  isNotRemovingAll(type) {
    return this.status.action === "removingAll" && this.status.type !== type;
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

  toggleAdd() {
    if (this.status.action === "adding") {
      this.status.action = null;
    } else {
      this.status.action = "adding";
    }
  }

  toggleSearch() {
    this.status.isSearching = !this.status.isSearching;
  }

  afterEnter() {
    if (this.status.isSearching && this.searchInput) {
      this.searchInput.$el.querySelector("input").select();
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
          const id = this.isPopup2 ? this.tabId : activeTab.id;
          chrome.tabs.sendMessage(id, {
            source: "popup",
            event: "add",
            type,
            key,
            value
          });
        }
      });
    } catch (e) {
      console.log("Add item Failed:", e);
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
            hash: "",
            tabId: activeTab.id
          });
        }
      });
    } catch (e) {
      console.log("Popup 2 Failed:", e);
    }
  }

  calculateSize(type) {
    const content = this.d[type]
      .map(item => [item.key, item.value])
      .flat()
      .join("");
    const byte = new Blob([content]).size;
    const kb = (byte / 1024).toFixed(2);
    const mb = (byte / 1024 / 1024).toFixed(2);
    if (mb > 1) {
      return `${mb}Mb`;
    }
    return `${kb}kb`;
  }

  syncRequest() {
    try {
      chrome.tabs.sendMessage(this.tabId, {
        source: "popup2",
        event: "syncStorage"
      });
      chrome.tabs.sendMessage(this.tabId, {
        source: "popup2",
        event: "syncCookie"
      });
    } catch (e) {
      console.log("Popup2 Sync Request Failed:", e);
    }
  }

  getFavIcon(key, type) {
    if (this.favorites[`${type}_${key}`]) {
      return StarIcon;
    }
    return StarOutlineIcon;
  }

  toggleFav(key, type) {
    console.log("fav", key, type);
    if (this.favorites[`${type}_${key}`]) {
      this.$delete(this.favorites, `${type}_${key}`);
    } else {
      this.$set(this.favorites, `${type}_${key}`, true);
    }
    try {
      const data = {};
      data[this.origin] = {
        favorites: this.favorites,
        checked: this.checked
      };
      console.log("Set storage:", data);
      chrome.storage.sync.set(data, function() {
        console.log("Favorite storage set");
      });
    } catch (e) {
      console.log("Set favorites storage failed:", e);
    }
  }

  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  getDisplayType(type) {
    if (type === "cookie") {
      return type;
    } else {
      return `${type} storage`;
    }
  }

  get table() {
    let result = [];
    if (this.checked.includes("local")) {
      result = result.concat(
        this.d.local
          .map((item, index) => ({
            ...item,
            _type: "local",
            _json: this.isJSON(item.value),
            _index: index
          }))
          .sort((a, b) => {
            const A = a.key.toUpperCase();
            const B = b.key.toUpperCase();
            return A < B ? -1 : A > B ? 1 : 0;
          })
      );
    }

    if (this.checked.includes("session")) {
      result = result.concat(
        this.d.session
          .map((item, index) => ({
            ...item,
            _type: "session",
            _json: this.isJSON(item.value),
            _index: index
          }))
          .sort((a, b) => {
            const A = a.key.toUpperCase();
            const B = b.key.toUpperCase();
            return A < B ? -1 : A > B ? 1 : 0;
          })
      );
    }

    if (this.checked.includes("cookie")) {
      result = result.concat(
        this.d.cookie
          .map((item, index) => ({
            ...item,
            _type: "cookie",
            _json: this.isJSON(item.value),
            _index: index
          }))
          .sort((a, b) => {
            const A = a.key.toUpperCase();
            const B = b.key.toUpperCase();
            return A < B ? -1 : A > B ? 1 : 0;
          })
      );
    }

    // Fav check
    result = result.sort((a, b) => {
      const A = this.favorites[`${a._type}_${a.key}`];
      const B = this.favorites[`${b._type}_${b.key}`];
      return A && !B ? -1 : !A && B ? 1 : 0;
    });

    // Search check
    if (this.status.isSearching && this.keyword !== "") {
      result = result.filter(item => {
        const regex = RegExp(this.keyword, "ig");
        item._keyMatched = regex.test(item.key);
        item._valueMatched = regex.test(item.value);
        return item._keyMatched || item._valueMatched;
      });
    }
    return result;
  }

  get localSize() {
    return this.calculateSize("local");
  }

  get sessionSize() {
    return this.calculateSize("session");
  }

  get cookieSize() {
    return this.calculateSize("cookie");
  }
}
</script>
<style src="../style.css" />
