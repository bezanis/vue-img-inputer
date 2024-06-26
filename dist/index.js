(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.vueImgInputer = factory());
}(this, (function () { 'use strict';

  /**
   * Code copied from https://github.com/ElemeFE/element/blob/dev/packages/upload/src/ajax.js
   */
  function getError(action, option, xhr) {
    var msg;

    if (xhr.response) {
      msg = "".concat(xhr.response.error || xhr.response);
    } else if (xhr.responseText) {
      msg = "".concat(xhr.responseText);
    } else {
      msg = "fail to post ".concat(action, " ").concat(xhr.status);
    }

    var err = new Error(msg);
    err.status = xhr.status;
    err.method = 'post';
    err.url = action;
    return err;
  }

  function getBody(xhr) {
    var text = xhr.responseText || xhr.response;

    if (!text) {
      return text;
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      return text;
    }
  }

  function upload(option) {
    if (typeof XMLHttpRequest === 'undefined') {
      return;
    }

    var xhr = new XMLHttpRequest();
    var action = option.action;

    if (xhr.upload) {
      xhr.upload.onprogress = function progress(e) {
        if (e.total > 0) {
          e.percent = e.loaded / e.total * 100;
        }

        option.onProgress(e);
      };
    }

    var formData = new FormData();

    if (option.data) {
      Object.keys(option.data).forEach(function (key) {
        formData.append(key, option.data[key]);
      });
    }

    formData.append(option.filename, option.file, option.file.name);

    xhr.onerror = function error(e) {
      option.onError(e);
    };

    xhr.onload = function onload() {
      if (xhr.status < 200 || xhr.status >= 300) {
        return option.onError(getError(action, option, xhr));
      }

      option.onSuccess(getBody(xhr));
    };

    xhr.open('post', action, true);

    if (option.withCredentials && 'withCredentials' in xhr) {
      xhr.withCredentials = true;
    }

    var headers = option.headers || {};

    for (var item in headers) {
      if (headers.hasOwnProperty(item) && headers[item] !== null) {
        xhr.setRequestHeader(item, headers[item]);
      }
    }

    xhr.send(formData);
    return xhr;
  }

  //

  var lang = (navigator.language || navigator.browserLanguage).includes("zh") ? "zh" : "en";
  var TRANSLATIONS = {
    readonlyTipText: {
      zh: "不可更改",
      en: "Readonly"
    },
    bottomText: {
      zh: "点击或拖拽图片以修改",
      en: "Drop file here or click to change"
    },
    hoverText: {
      zh: "点击或拖拽图片以修改",
      en: "Drop file here or click to change"
    },
    placeholder: {
      zh: "点击或拖拽选择图片",
      en: "Drop file here or click"
    },
    noMultipleFileMsg: {
      zh: "不支持多文件",
      en: "Not support multiple files"
    },
    exceedSizeMsg: {
      zh: "文件大小不能超过",
      en: "The size of file should less than: "
    },
    noActionUrlMsg: {
      zh: "上传地址未配置",
      en: "Action hasn't set up yet"
    }
  };
  var script = {
    name: "VueImgInputer",
    // !------------------------ P r o p s --------------------------------------------------------
    props: {
      type: {
        default: "img",
        type: String
      },
      accept: {
        default: "image/*,video/*",
        type: String
      },
      capture: {
        default: false,
        type: Boolean
      },
      id: {
        default: "",
        type: String
      },
      onChange: {
        default: null,
        type: Function
      },
      readonly: {
        type: Boolean,
        default: false
      },
      noMultipleText: {
        default: TRANSLATIONS.noMultipleFileMsg[lang],
        type: String
      },
      exceedSizeText: {
        default: TRANSLATIONS.exceedSizeMsg[lang],
        type: String
      },
      noActionText: {
        default: TRANSLATIONS.noActionUrlMsg[lang],
        type: String
      },
      readonlyTipText: {
        default: TRANSLATIONS.readonlyTipText[lang],
        type: String
      },
      bottomText: {
        default: TRANSLATIONS.bottomText[lang],
        type: String
      },
      hoverText: {
        default: TRANSLATIONS.hoverText[lang],
        type: String
      },
      placeholder: {
        default: TRANSLATIONS.placeholder[lang],
        type: String
      },
      value: {
        default: undefined
      },
      icon: {
        default: "",
        type: String
      },
      aliIcon: {
        default: "",
        type: String
      },
      customIconClass: {
        default: "",
        type: String
      },
      maxSize: {
        default: 5120,
        type: Number
      },
      size: {
        default: "",
        type: String
      },
      imgSrc: {
        default: "",
        type: String
      },
      // ! Deprecated, use noHoverEffect instead
      nhe: {
        type: Boolean,
        default: false
      },
      noHoverEffect: {
        type: Boolean,
        default: false
      },
      noMask: {
        type: Boolean,
        default: false
      },
      theme: {
        type: String,
        default: ""
      },
      name: {
        type: String,
        default: "file"
      },
      // 文件自动上传功能抄自 Element/Uploader:
      autoUpload: {
        type: Boolean,
        default: false
      },
      action: {
        type: String,
        default: undefined
      },
      uploadKey: {
        type: String,
        default: "file"
      },
      extraData: {
        type: Object,
        default: function _default() {}
      },
      headers: {
        type: Object,
        default: function _default() {}
      },
      withCookie: {
        type: Boolean,
        default: false
      },
      onStart: {
        default: function _default() {},
        type: Function
      },
      onProgress: {
        default: function _default() {},
        type: Function
      },
      onSuccess: {
        default: function _default() {},
        type: Function
      },
      onError: {
        default: function _default() {},
        type: Function
      }
    },
    // !------------------------ D a t a --------------------------------------------------------
    data: function data() {
      return {
        inputId: "",
        file: null,
        dataUrl: "",
        fileName: "",
        errText: "",
        uploading: false,
        uploadPercent: 0,
        uploaded: false,
        uploadFailed: false
      };
    },
    // !------------------------ C o m p u t e d --------------------------------------------------------
    computed: {
      imgSelected: function imgSelected() {
        return !!this.dataUrl || !!this.fileName;
      },
      sizeHumanRead: function sizeHumanRead() {
        var rst = 0;

        if (this.maxSize < 1024) {
          rst = this.maxSize + "K";
        } else {
          rst = (this.maxSize / 1024).toFixed(this.maxSize % 1024 > 0 ? 2 : 0) + "M";
        }

        return rst;
      },
      sizeClass: function sizeClass() {
        if (this.size) {
          return "img-inputer--".concat(this.size);
        }
      },
      themeClass: function themeClass() {
        return "img-inputer--".concat(this.theme);
      },
      ICON: function ICON() {
        var rst = "";
        var theme = this.theme,
            icon = this.icon,
            autoUpload = this.autoUpload;

        if (icon) {
          rst = icon;
        } else {
          rst = theme === "light" ? "img-light" : autoUpload ? "upload" : "clip";
        }

        return rst;
      },
      processStyle: function processStyle() {
        var uploadPercent = this.uploadPercent;
        return {
          transform: "translate3d(".concat(uploadPercent - 100, "%, 0, 0)")
        };
      }
    },
    // !------------------------ L i f e   c i r c l e --------------------------------------------------------
    mounted: function mounted() {
      var _this = this;

      this.inputId = this.id || this.gengerateID();

      if (this.imgSrc) {
        this.dataUrl = this.imgSrc;
      } // 阻止浏览器默认的拖拽时事件


      ["dragleave", "drop", "dragenter", "dragover"].forEach(function (e) {
        _this.preventDefaultEvent(e);
      }); // 绑定拖拽支持

      this.addDropSupport();
    },
    // !------------------------ M e t h o d s --------------------------------------------------------
    methods: {
      preventDefaultEvent: function preventDefaultEvent(eventName) {
        document.addEventListener(eventName, function (e) {
          e.preventDefault();
        }, false);
      },
      addDropSupport: function addDropSupport() {
        var _this2 = this;

        var BOX = this.$refs.box;
        BOX.addEventListener("drop", function (e) {
          e.preventDefault();
          if (_this2.readonly) return false;
          _this2.errText = "";
          var fileList = e.dataTransfer.files;

          if (fileList.length === 0) {
            return false;
          }

          if (fileList.length > 1) {
            _this2.errText = _this2.noMultipleText;
            return false;
          }

          _this2.handleFileChange(fileList);
        });
      },
      gengerateID: function gengerateID() {
        var nonstr = Math.random().toString(36).substring(3, 8);

        if (!document.getElementById(nonstr)) {
          return nonstr;
        } else {
          return this.gengerateID();
        }
      },
      handleFileChange: function handleFileChange(e) {
        if (typeof e.target === "undefined") this.file = e[0];else this.file = e.target.files[0];
        this.errText = "";
        var size = Math.floor(this.file.size / 1024);

        if (size > this.maxSize) {
          this.errText = "".concat(this.exceedSizeText).concat(this.sizeHumanRead);
          this.$emit("onExceed", this.file);
          return false;
        } // 双向绑定


        this.$emit("input", this.file);
        if (this.autoUpload) this.uploadFile();
        this.onChange && this.onChange(this.file, this.file.name);
        this.$emit("onChange", this.file, this.file.name);
        this.imgPreview(this.file);
        this.fileName = this.file.name;
        this.resetInput();
      },
      imgPreview: function imgPreview(file) {
        var self = this;
        if (!file || !window.FileReader) return;

        if (/^image/.test(file.type)) {
          var reader = new FileReader();
          reader.readAsDataURL(file);

          reader.onloadend = function () {
            self.dataUrl = this.result;
          };
        }
      },
      resetInput: function resetInput() {
        var input = document.getElementById(this.inputId);
        var form = document.createElement("form");
        document.body.appendChild(form);
        var parentNode = input.parentNode; // 判断input 是否为最后一个节点

        var isLastNode = parentNode.lastChild === input;
        var nextSibling; // 如果后面还有节点，则记录下一个node，做位置标志
        // 如果本身已经是最后一个节点，则直接通过parentNode appendChild即可

        if (!isLastNode) {
          nextSibling = input.nextSibling;
        }

        form.appendChild(input);
        form.reset();
        isLastNode ? parentNode.appendChild(input) : parentNode.insertBefore(input, nextSibling);
        document.body.removeChild(form);
      },
      uploadFile: function uploadFile() {
        var onStart = this.onStart,
            file = this.file;

        if (!this.action) {
          this.errText = this.noActionText;
          return;
        }

        onStart && onStart(file);
        this.post(file);
      },
      post: function post(file) {
        var _this3 = this;

        var headers = this.headers,
            withCookie = this.withCookie,
            extraData = this.extraData,
            uploadKey = this.uploadKey,
            action = this.action;
        this.uploading = true;
        var options = {
          headers: headers,
          withCredentials: withCookie,
          file: file,
          data: extraData,
          filename: uploadKey,
          action: action,
          onProgress: function onProgress(e) {
            _this3.uploadPercent = ~~e.percent;

            _this3.onProgress(e, file);
          },
          onSuccess: function onSuccess(res) {
            _this3.uploadPercent = 0;
            _this3.uploading = false;
            _this3.uploaded = true;

            _this3.onSuccess(res, file);
          },
          onError: function onError(err) {
            _this3.uploadPercent = 0;
            _this3.uploading = false;
            _this3.uploadFailed = true;

            _this3.onError(err, file);
          }
        };
        upload(options);
      },
      reset: function reset() {
        this.file = null;
        this.dataUrl = "";
        this.errText = "";
        this.fileName = "";
        this.uploadPercent = 0;
        this.uploading = false;
        this.uploaded = false;
        this.uploadFailed = false;
      }
    },
    // !------------------------ W a t c h --------------------------------------------------------
    watch: {
      imgSrc: function imgSrc(newval) {
        this.dataUrl = newval;

        if (!newval) {
          this.file = null;
          this.errText = "";
          this.fileName = "";
        }
      },
      value: function value(newval, oldval) {
        // reset
        if (oldval && !newval) {
          this.reset();
        }
      }
    }
  };

  function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier
  /* server only */
  , shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
      createInjectorSSR = createInjector;
      createInjector = shadowMode;
      shadowMode = false;
    } // Vue.extend constructor export interop.


    var options = typeof script === 'function' ? script.options : script; // render functions

    if (template && template.render) {
      options.render = template.render;
      options.staticRenderFns = template.staticRenderFns;
      options._compiled = true; // functional template

      if (isFunctionalTemplate) {
        options.functional = true;
      }
    } // scopedId


    if (scopeId) {
      options._scopeId = scopeId;
    }

    var hook;

    if (moduleIdentifier) {
      // server build
      hook = function hook(context) {
        // 2.3 injection
        context = context || // cached call
        this.$vnode && this.$vnode.ssrContext || // stateful
        this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext; // functional
        // 2.2 with runInNewContext: true

        if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
          context = __VUE_SSR_CONTEXT__;
        } // inject component styles


        if (style) {
          style.call(this, createInjectorSSR(context));
        } // register component module identifier for async chunk inference


        if (context && context._registeredComponents) {
          context._registeredComponents.add(moduleIdentifier);
        }
      }; // used by ssr in case component is cached and beforeCreate
      // never gets called


      options._ssrRegister = hook;
    } else if (style) {
      hook = shadowMode ? function () {
        style.call(this, createInjectorShadow(this.$root.$options.shadowRoot));
      } : function (context) {
        style.call(this, createInjector(context));
      };
    }

    if (hook) {
      if (options.functional) {
        // register for functional component in vue file
        var originalRender = options.render;

        options.render = function renderWithStyleInjection(h, context) {
          hook.call(context);
          return originalRender(h, context);
        };
      } else {
        // inject component registration as beforeCreate hook
        var existing = options.beforeCreate;
        options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
      }
    }

    return script;
  }

  var normalizeComponent_1 = normalizeComponent;

  /* script */
  const __vue_script__ = script;

  /* template */
  var __vue_render__ = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{ref:"box",staticClass:"img-inputer",class:[
      _vm.themeClass,
      _vm.sizeClass,
      _vm.nhe || _vm.noHoverEffect ? 'nhe' : '',
      { 'img-inputer--loading': _vm.uploading }
    ]},[(_vm.ICON && !_vm.customIconClass)?_c('i',{staticClass:"img-inputer__icon",class:("ico ico-" + _vm.ICON)}):_vm._e(),_vm._v(" "),(_vm.customIconClass)?_c('i',{staticClass:"img-inputer__icon",class:_vm.customIconClass}):_vm._e(),_vm._v(" "),(!_vm.icon && !_vm.customIconClass)?_vm._t("icon"):_vm._e(),_vm._v(" "),_c('p',{staticClass:"img-inputer__placeholder"},[_vm._v(_vm._s(_vm.placeholder))]),_vm._v(" "),(_vm.imgSelected)?_c('div',{staticClass:"img-inputer__preview-box"},[_c('img',{staticClass:"img-inputer__preview-img",attrs:{"src":_vm.dataUrl}})]):_vm._e(),_vm._v(" "),_c('label',{staticClass:"img-inputer__label",attrs:{"for":_vm.readonly ? '' : _vm.inputId}}),_vm._v(" "),_c('transition',{attrs:{"name":"vip-fade"}},[(_vm.uploading)?_c('div',{staticClass:"img-inputer__loading"},[_c('div',{staticClass:"img-inputer__loading-indicator"}),_vm._v(" "),_c('div',{staticClass:"img-inputer__loading-process",style:(_vm.processStyle)})]):_vm._e()]),_vm._v(" "),_c('transition',{attrs:{"name":"vip-zoom-in"}},[(_vm.autoUpload && _vm.uploaded)?_c('div',{staticClass:"img-inputer__state success"}):_vm._e()]),_vm._v(" "),_c('transition',{attrs:{"name":"vip-zoom-in"}},[(_vm.autoUpload && _vm.uploadFailed)?_c('div',{staticClass:"img-inputer__state fail"}):_vm._e()]),_vm._v(" "),(_vm.imgSelected && !_vm.noMask)?_c('div',{staticClass:"img-inputer__mask"},[_c('p',{staticClass:"img-inputer__file-name"},[_vm._v(_vm._s(_vm.fileName))]),_vm._v(" "),(_vm.readonly)?_c('p',{staticClass:"img-inputer__change"},[_vm._v(_vm._s(_vm.readonlyTipText))]):_c('p',{staticClass:"img-inputer__change"},[_vm._v(_vm._s(_vm.bottomText))])]):_vm._e(),_vm._v(" "),(_vm.capture)?_c('input',_vm._b({ref:"inputer",staticClass:"img-inputer__inputer",attrs:{"type":"file","name":_vm.name,"id":_vm.inputId,"accept":_vm.accept,"capture":"video"},on:{"change":_vm.handleFileChange}},'input',_vm.$attrs,false)):_c('input',_vm._b({ref:"inputer",staticClass:"img-inputer__inputer",attrs:{"type":"file","name":_vm.name,"id":_vm.inputId,"accept":_vm.accept},on:{"change":_vm.handleFileChange}},'input',_vm.$attrs,false)),_vm._v(" "),_c('transition',{attrs:{"name":"vip-move-in"}},[(_vm.errText.length)?_c('div',{staticClass:"img-inputer__err"},[_vm._v(_vm._s(_vm.errText))]):_vm._e()])],2)};
  var __vue_staticRenderFns__ = [];

    /* style */
    const __vue_inject_styles__ = undefined;
    /* scoped */
    const __vue_scope_id__ = undefined;
    /* module identifier */
    const __vue_module_identifier__ = undefined;
    /* functional template */
    const __vue_is_functional_template__ = false;
    /* style inject */
    
    /* style inject SSR */
    

    
    var ImgInputer = normalizeComponent_1(
      { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
      __vue_inject_styles__,
      __vue_script__,
      __vue_scope_id__,
      __vue_is_functional_template__,
      __vue_module_identifier__,
      undefined,
      undefined
    );

  return ImgInputer;

})));
