// http://microformatshiv.com/javascript/microformat-shiv.min.js
// https://raw.githubusercontent.com/glennjones/microformat-shiv/master/microformat-shiv.js

var microformats = {
};
microformats.Parser = function () {
  this.version = '0.3.0';
  this.rootPrefix = 'h-';
  this.propertyPrefixes = [
    'p-',
    'dt-',
    'u-',
    'e-'
  ];
  this.options = {
    'baseUrl': '',
    'filters': [
    ],
    'version1': true,
    'children': true,
    'childrenRel': false,
    'rel': true,
    'includes': true,
    'textFormat': 'normalised'
  };
  this.maps = {
  };
  this.rels = {
  };
};
microformats.Parser.prototype = {
  get: function (dom, rootNode, options) {
    var errors = null,
    items,
    children,
    data = [
    ],
    ufs = [
    ],
    x,
    i,
    z,
    y,
    rels,
    baseTag,
    href;
    this.mergeOptions(options);
    this.rootID = 0;
    if (!dom || !rootNode) {
      errors = [
        {
          'error': 'No DOM or rootNode given'
        }
      ];
      return {
        'errors': errors,
        'data': {
        }
      };
    } else {
      if (this.options.includes) {
        this.addIncludes(dom, rootNode);
      }
      baseTag = dom.querySelectorAll('base');
      if (baseTag.length > 0) {
        href = this.domUtils.getAttribute(dom, baseTag, 'href');
        if (href) {
          this.options.baseUrl = href;
        }
      }
      items = this.findRootNodes(dom, rootNode);
      if (items && !errors) {
        x = 0;
        i = items.length;
        while (x < i) {
          if (!this.domUtils.hasAttribute(dom, items[x], 'data-include')) {
            ufs = this.walkTree(dom, items[x], true);
            z = 0;
            y = ufs.length;
            while (z < y) {
              if (ufs[z] && this.utils.hasProperties(ufs[z].properties) && this.shouldInclude(ufs[z], this.options.filters)) {
                if (this.options.children) {
                  children = this.findChildItems(dom, items[x], ufs[z].type[0]);
                  if (children.length > 0) {
                    ufs[z].children = children;
                  }
                }
                data.push(ufs[z]);
              }
              z++;
            }
          }
          x++;
        }
      }
      if (this.options.rel) {
        rels = this.findRels(dom, rootNode);
        if (rels && this.shouldInclude(rels, this.options.filters)) {
          data.push(rels);
        }
      }
    }
    this.clearUpDom(dom);
    return {
      'items': data
    };
  },
  shouldInclude: function (uf, filters) {
    var i;
    if (this.utils.isArray(filters) && filters.length > 0) {
      i = filters.length;
      while (i--) {
        if (uf.type[0] === filters[i]) {
          return true;
        }
      }
      return false;
    } else {
      return true;
    }
  },
  findChildItems: function (dom, rootNode, ufName) {
    var items,
    out = [
    ],
    ufs = [
    ],
    x,
    i,
    z,
    y,
    rels;
    items = this.findRootNodes(dom, rootNode, true);
    if (items.length > 0) {
      i = items.length;
      x = 0;
      while (x < i) {
        var classes = this.getUfClassNames(dom, items[x], ufName);
        if (classes.root.length > 0 && classes.properties.length === 0) {
          ufs = this.walkTree(dom, items[x], true);
          y = ufs.length;
          z = 0;
          while (z < y) {
            if (ufs[z] && this.utils.hasProperties(ufs[z].properties)) {
              out.push(ufs[z]);
            }
            z++;
          }
        }
        x++;
      }
    }
    if (this.options.rel && this.options.childrenRel) {
      rels = this.findRels(dom, rootNode);
      if (rels) {
        out.push(rels);
      }
    }
    return out;
  },
  findRootNodes: function (dom, rootNode, fromChildren) {
    var arr = null,
    out = [
    ],
    classList = [
    ],
    test,
    items,
    x,
    i,
    y,
    key;
    for (key in this.maps) {
      classList.push(this.maps[key].root);
    }
    fromChildren = (fromChildren) ? fromChildren : false;
    if (fromChildren) {
      arr = this.domUtils.getNodesByAttribute(dom, rootNode, 'class');
    } else {
      arr = this.domUtils.getNodesByAttribute(dom, rootNode, 'class');
    }
    x = 0;
    i = arr.length;
    while (x < i) {
      items = this.domUtils.getAttributeList(dom, arr[x], 'class');
      y = items.length;
      while (y--) {
        if (classList.indexOf(items[y]) > - 1) {
          out.push(arr[x]);
          break;
        }
        if (this.utils.startWith(items[y], 'h-')) {
          out.push(arr[x]);
          break;
        }
      }
      x++;
    }
    return out;
  },
  walkTree: function (dom, node) {
    var classes,
    out = [
    ],
    obj,
    itemRootID,
    x,
    i;
    classes = this.getUfClassNames(dom, node);
    if (classes) {
      x = 0;
      i = classes.root.length;
      while (x < i) {
        this.rootID++;
        itemRootID = this.rootID,
        obj = this.createUfObject(classes.root[x]);
        this.walkChildren(dom, node, obj, classes.root[x], itemRootID);
        this.impliedRules(dom, node, obj);
        out.push(obj);
        x++;
      }
    }
    return out;
  },
  impliedRules: function (dom, node, uf) {
    var context = this,
    value,
    descendant,
    newDate;
    function getNameAttr(dom, node) {
      var value = context.domUtils.getAttrValFromTagList(dom, node, [
        'img'
      ], 'alt');
      if (!value) {
        value = context.domUtils.getAttrValFromTagList(dom, node, [
          'abbr'
        ], 'title');
      }
      return value;
    }
    function getPhotoAttr(dom, node) {
      var value = context.domUtils.getAttrValFromTagList(dom, node, [
        'img'
      ], 'src');
      if (!value) {
        value = context.domUtils.getAttrValFromTagList(dom, node, [
          'object'
        ], 'data');
      }
      return value;
    }
    if (uf && uf.properties) {
      if (!uf.properties.name) {
        value = getNameAttr(dom, node);
        if (!value) {
          descendant = this.domUtils.isSingleDescendant(dom, node, [
            'img',
            'abbr'
          ]);
          if (descendant) {
            value = getNameAttr(dom, descendant);
          }
          if (node.children.length > 0) {
            child = this.domUtils.isSingleDescendant(dom, node);
            if (child) {
              descendant = this.domUtils.isSingleDescendant(dom, child, [
                'img',
                'abbr'
              ]);
              if (descendant) {
                value = getNameAttr(dom, descendant);
              }
            }
          }
        }
        if (!value) {
          value = this.text.parse(dom, node, this.options.textFormat);
        }
        if (value) {
          uf.properties.name = [
            this.utils.trim(value) .replace(/[\t\n\r ]+/g, ' ')
          ];
        }
      }
      if (!uf.properties.photo) {
        value = getPhotoAttr(dom, node);
        if (!value) {
          descendant = this.domUtils.isOnlySingleDescendantOfType(dom, node, [
            'img',
            'object'
          ]);
          if (descendant) {
            value = getPhotoAttr(dom, descendant);
          }
          if (node.children.length > 0) {
            child = this.domUtils.isSingleDescendant(dom, node);
            if (child) {
              descendant = this.domUtils.isOnlySingleDescendantOfType(dom, child, [
                'img',
                'object'
              ]);
              if (descendant) {
                value = getPhotoAttr(dom, descendant);
              }
            }
          }
        }
        if (value) {
          if (value && value !== '' && value.indexOf(':') === - 1) {
            value = this.domUtils.resolveUrl(dom, value, this.options.baseUrl);
          }
          uf.properties.photo = [
            this.utils.trim(value)
          ];
        }
      }
      if (!uf.properties.url) {
        value = this.domUtils.getAttrValFromTagList(dom, node, [
          'a'
        ], 'href');
        if (value) {
          uf.properties.url = [
            this.utils.trim(value)
          ];
        }
      }
    }
    if (uf.times.length > 0 && uf.dates.length > 0) {
      newDate = this.dates.dateTimeUnion(uf.dates[0][1], uf.times[0][1]);
      uf.properties[this.removePropPrefix(uf.times[0][0])][0] = newDate.toString();
    }
    delete uf.times;
    delete uf.dates;
  },
  walkChildren: function (dom, node, out, ufName, rootID) {
    var context = this,
    childOut = {
    },
    rootItem,
    itemRootID,
    value,
    propertyName,
    i,
    x,
    y,
    z,
    child;
    y = 0;
    z = node.children.length;
    while (y < z) {
      child = node.children[y];
      var classes = context.getUfClassNames(dom, child, ufName);
      if (classes.root.length > 0 && classes.properties.length > 0) {
        rootItem = context.createUfObject(classes.root, this.text.parse(dom, child, this.options.textFormat));
        propertyName = context.removePropPrefix(classes.properties[0]);
        if (out.properties[propertyName]) {
          out.properties[propertyName].push(rootItem);
        } else {
          out.properties[propertyName] = [
            rootItem
          ];
        }
        context.rootID++;
        x = 0;
        i = rootItem.type.length;
        itemRootID = context.rootID;
        while (x < i) {
          context.walkChildren(dom, child, rootItem, rootItem.type[x], itemRootID);
          x++;
        }
        context.impliedRules(dom, child, rootItem);
      }
      if (classes.root.length === 0 && classes.properties.length > 0) {
        x = 0;
        i = classes.properties.length;
        while (x < i) {
          value = context.getValue(dom, child, classes.properties[x], out);
          propertyName = context.removePropPrefix(classes.properties[x]);
          if (value !== '' && !context.hasRootID(dom, child, rootID, propertyName)) {
            if (out.properties[propertyName]) {
              out.properties[propertyName].push(value);
            } else {
              out.properties[propertyName] = [
                value
              ];
            }
            context.appendRootID(dom, child, rootID, propertyName);
          }
          x++;
        }
        context.walkChildren(dom, child, out, ufName, rootID);
      }
      if (classes.root.length === 0 && classes.properties.length === 0) {
        context.walkChildren(dom, child, out, ufName, rootID);
      }
      y++;
    }
  },
  getValue: function (dom, node, className, uf) {
    var value = '';
    if (this.utils.startWith(className, 'p-')) {
      value = this.getPValue(dom, node, true);
    }
    if (this.utils.startWith(className, 'e-')) {
      value = this.getEValue(dom, node);
    }
    if (this.utils.startWith(className, 'u-')) {
      value = this.getUValue(dom, node, true);
    }
    if (this.utils.startWith(className, 'dt-')) {
      value = this.getDTValue(dom, node, className, uf, true);
    }
    return value;
  },
  getPValue: function (dom, node, valueParse) {
    var out = '';
    if (valueParse) {
      out = this.getValueClass(dom, node, 'p');
    }
    if (!out && valueParse) {
      out = this.getValueTitle(dom, node);
    }
    if (!out) {
      out = this.domUtils.getAttrValFromTagList(dom, node, [
        'abbr'
      ], 'title');
    }
    if (!out) {
      out = this.domUtils.getAttrValFromTagList(dom, node, [
        'data'
      ], 'value');
    }
    if (node.name === 'br' || node.name === 'hr') {
      out = '';
    }
    if (!out) {
      out = this.domUtils.getAttrValFromTagList(dom, node, [
        'img',
        'area'
      ], 'alt');
    }
    if (!out) {
      out = this.text.parse(dom, node, this.options.textFormat);
    }
    return (out) ? out : '';
  },
  getEValue: function (dom, node) {
    return this.domUtils.innerHTML(dom, node);
  },
  getUValue: function (dom, node, valueParse) {
    var out = '';
    if (valueParse) {
      out = this.getValueClass(dom, node, 'u');
    }
    if (!out && valueParse) {
      out = this.getValueTitle(dom, node);
    }
    if (!out) {
      out = this.domUtils.getAttrValFromTagList(dom, node, [
        'a',
        'area'
      ], 'href');
    }
    if (!out) {
      out = this.domUtils.getAttrValFromTagList(dom, node, [
        'img'
      ], 'src');
    }
    if (!out) {
      out = this.domUtils.getAttrValFromTagList(dom, node, [
        'object'
      ], 'data');
    }
    if (out && out !== '' && out.indexOf(':') === - 1) {
      out = this.domUtils.resolveUrl(dom, out, this.options.baseUrl);
    }
    if (!out) {
      out = this.domUtils.getAttrValFromTagList(dom, node, [
        'abbr'
      ], 'title');
    }
    if (!out) {
      out = this.domUtils.getAttrValFromTagList(dom, node, [
        'data'
      ], 'value');
    }
    if (!out) {
      out = this.text.parse(dom, node, this.options.textFormat);
    }
    return (out) ? out : '';
  },
  getDTValue: function (dom, node, className, uf, valueParse) {
    var out = '';
    if (valueParse) {
      out = this.getValueClass(dom, node, 'dt');
    }
    if (!out && valueParse) {
      out = this.getValueTitle(dom, node);
    }
    if (!out) {
      out = this.domUtils.getAttrValFromTagList(dom, node, [
        'time',
        'ins',
        'del'
      ], 'datetime');
    }
    if (!out) {
      out = this.domUtils.getAttrValFromTagList(dom, node, [
        'abbr'
      ], 'title');
    }
    if (!out) {
      out = this.domUtils.getAttrValFromTagList(dom, node, [
        'data'
      ], 'value');
    }
    if (!out) {
      out = this.text.parse(dom, node, this.options.textFormat);
    }
    if (out) {
      if (this.dates.isDuration(out)) {
        return out;
      } else if (this.dates.isTime(out)) {
        if (uf) {
          uf.times.push([className,
          this.dates.parseAmPmTime(out)]);
        }
        return this.dates.parseAmPmTime(out);
      } else {
        if (uf) {
          uf.dates.push([className,
          new ISODate(out) .toString()]);
        }
        return new ISODate(out) .toString();
      }
    } else {
      return '';
    }
  },
  appendRootID: function (dom, node, id, propertyName) {
    var rootids = [
    ];
    if (this.domUtils.hasAttribute(dom, node, 'rootids')) {
      rootids = this.domUtils.getAttributeList(dom, node, 'rootids');
    }
    rootids.push('id' + id + '-' + propertyName);
    this.domUtils.setAttribute(dom, node, 'rootids', rootids.join());
  },
  hasRootID: function (dom, node, id, propertyName) {
    var rootids = [
    ];
    if (!this.domUtils.hasAttribute(dom, node, 'rootids')) {
      return false;
    } else {
      rootids = this.domUtils.getAttributeList(dom, node, 'rootids');
      return (rootids.indexOf('id' + id + '-' + propertyName) > - 1);
    }
  },
  getValueClass: function (dom, node, propertyType) {
    var context = this,
    out = [
    ],
    child,
    x,
    i;
    x = 0;
    i = node.children.length;
    while (x < i) {
      child = node.children[x];
      var value = null;
      if (this.domUtils.hasAttributeValue(dom, child, 'class', 'value')) {
        switch (propertyType) {
        case 'p':
          value = context.getPValue(dom, child, false);
          break;
        case 'u':
          value = context.getUValue(dom, child, false);
          break;
        case 'dt':
          value = context.getDTValue(dom, child, '', null, false);
          break;
        }
        if (value) {
          out.push(this.utils.trim(value));
        }
      }
      x++;
    }
    if (out.length > 0) {
      if (propertyType === 'p') {
        return out.join(' ') .replace(/[\t\n\r ]+/g, ' ');
      }
      if (propertyType === 'u') {
        return out.join('');
      }
      if (propertyType === 'dt') {
        return this.dates.concatFragments(out) .toString();
      }
    } else {
      return null;
    }
  },
  getValueTitle: function (dom, node) {
    var out = [
    ],
    items,
    i,
    x;
    items = this.domUtils.getNodesByAttributeValue(dom, node, 'class', 'value-title');
    x = 0;
    i = items.length;
    while (x < i) {
      if (this.domUtils.hasAttribute(dom, items[x], 'title')) {
        out.push(this.domUtils.getAttribute(dom, items[x], 'title'));
      }
      x++;
    }
    return out.join('');
  },
  getUfClassNames: function (dom, node, ufName) {
    var out = {
      'root': [
      ],
      'properties': [
      ]
    },
    classNames,
    key,
    items,
    item,
    i,
    x,
    z,
    y,
    map,
    prop,
    propName,
    v2Name,
    impiedRel;
    classNames = this.domUtils.getAttribute(dom, node, 'class');
    if (classNames) {
      items = classNames.split(' ');
      x = 0;
      i = items.length;
      while (x < i) {
        item = this.utils.trim(items[x]);
        if (this.utils.startWith(item, this.rootPrefix)) {
          out.root.push(item);
        }
        z = this.propertyPrefixes.length;
        while (z--) {
          if (this.utils.startWith(item, this.propertyPrefixes[z])) {
            out.properties.push(item);
          }
        }
        if (this.options.version1) {
          for (key in this.maps) {
            if (this.maps.hasOwnProperty(key)) {
              if (this.maps[key].root === item && out.root.indexOf(key) === - 1) {
                if (this.maps[key].subTree && this.isSubTreeRoot(dom, node, this.maps[key], items) === false) {
                  out.properties.push('p-' + this.maps[key].root);
                } else {
                  out.root.push(key);
                }
                break;
              }
            }
          }
          map = this.getMapping(ufName);
          if (map) {
            for (key in map.properties) {
              prop = map.properties[key];
              propName = (prop.map) ? prop.map : 'p-' + key;
              if (key === item) {
                if (prop.uf) {
                  y = 0;
                  while (y < i) {
                    v2Name = this.getV2RootName(items[y]);
                    if (prop.uf.indexOf(v2Name) > - 1 && out.root.indexOf(v2Name) === - 1) {
                      out.root.push(v2Name);
                    }
                    y++;
                  }
                  if (out.properties.indexOf(propName) === - 1) {
                    out.properties.push(propName);
                  }
                } else {
                  if (out.properties.indexOf(propName) === - 1) {
                    out.properties.push(propName);
                  }
                }
                break;
              }
            }
          }
        }
        x++;
      }
    }
    impiedRel = this.findRelImpied(dom, node, ufName);
    if (impiedRel && out.properties.indexOf(impiedRel) === - 1) {
      out.properties.push(impiedRel);
    }
    return out;
  },
  getMapping: function (name) {
    var key;
    for (key in this.maps) {
      if (this.maps[key].root === name || key === name) {
        return this.maps[key];
      }
    }
    return null;
  },
  getV2RootName: function (name) {
    var key;
    for (key in this.maps) {
      if (this.maps[key].root === name) {
        return key;
      }
    }
    return null;
  },
  isSubTreeRoot: function (dom, node, map, classList) {
    var out,
    hasSecondRoot,
    i,
    x;
    out = this.createUfObject(map.name);
    hasSecondRoot = false;
    x = 0;
    i = classList.length;
    while (x < i) {
      var item = this.utils.trim(classList[x]);
      for (var key in this.maps) {
        if (this.maps.hasOwnProperty(key)) {
          if (this.maps[key].root === item && this.maps[key].root !== map.root) {
            hasSecondRoot = true;
            break;
          }
        }
      }
      x++;
    }
    this.walkChildren(dom, node, out, map.name, null);
    if (this.utils.hasProperties(out.properties) && hasSecondRoot === false) {
      return true;
    } else {
      return false;
    }
  },
  findRelImpied: function (dom, node, ufName) {
    var out,
    map,
    i;
    map = this.getMapping(ufName);
    if (map) {
      for (var key in map.properties) {
        var prop = map.properties[key],
        propName = (prop.map) ? prop.map : 'p-' + key,
        relCount = 0;
        if (prop.relAlt && this.domUtils.hasAttribute(dom, node, 'rel')) {
          i = prop.relAlt.length;
          while (i--) {
            if (this.domUtils.hasAttributeValue(dom, node, 'rel', prop.relAlt[i])) {
              relCount++;
            }
          }
          if (relCount === prop.relAlt.length) {
            out = propName;
          }
        }
      }
    }
    return out;
  },
  createUfObject: function (names, value) {
    var out = {
    };
    if (value) {
      out.value = value;
    }
    if (this.utils.isArray(names)) {
      out.type = names;
    } else {
      out.type = [
        names
      ];
    }
    out.properties = {
    };
    out.times = [
    ];
    out.dates = [
    ];
    return out;
  },
  removePropPrefix: function (str) {
    var i;
    i = this.propertyPrefixes.length;
    while (i--) {
      var prefix = this.propertyPrefixes[i];
      if (this.utils.startWith(str, prefix)) {
        str = str.substr(prefix.length);
      }
    }
    return str;
  },
  findRels: function (dom, rootNode, fromChildren) {
    var uf,
    out = {
    },
    x,
    i,
    y,
    z,
    relList,
    items,
    item,
    key,
    value,
    arr;
    fromChildren = (fromChildren) ? fromChildren : false;
    if (fromChildren) {
      arr = this.domUtils.getNodesByAttribute(dom, rootNode, 'rel');
    } else {
      arr = this.domUtils.getNodesByAttribute(dom, rootNode, 'rel');
    }
    x = 0;
    i = arr.length;
    while (x < i) {
      relList = this.domUtils.getAttribute(dom, arr[x], 'rel');
      if (relList) {
        items = relList.split(' ');
        z = 0;
        y = items.length;
        while (z < y) {
          item = this.utils.trim(items[z]);
          for (key in this.rels) {
            if (key === item) {
              value = this.domUtils.getAttrValFromTagList(dom, arr[x], [
                'a',
                'area'
              ], 'href');
              if (!value) {
                value = this.domUtils.getAttrValFromTagList(dom, arr[x], [
                  'link'
                ], 'href');
              }
              if (!out[key]) {
                out[key] = [
                ];
              }
              if (value && value !== '' && value.indexOf(':') === - 1) {
                value = this.domUtils.resolveUrl(dom, value, this.options.baseUrl);
              }
              out[key].push(value);
            }
          }
          z++;
        }
      }
      x++;
    }
    if (this.utils.hasProperties(out)) {
      uf = this.createUfObject('rel');
      delete uf.times;
      delete uf.dates;
      uf.properties = out;
    }
    return uf;
  },
  addIncludes: function (dom, rootNode) {
    this.addAttributeIncludes(dom, rootNode, 'itemref');
    this.addAttributeIncludes(dom, rootNode, 'headers');
    this.addClassIncludes(dom, rootNode);
  },
  addAttributeIncludes: function (dom, rootNode, attributeName) {
    var out = {
    },
    arr,
    idList,
    i,
    x,
    z,
    y;
    arr = this.domUtils.getNodesByAttribute(dom, rootNode, attributeName);
    x = 0;
    i = arr.length;
    while (x < i) {
      idList = this.domUtils.getAttributeList(dom, arr[x], attributeName);
      if (idList) {
        z = 0;
        y = idList.length;
        while (z < y) {
          this.apppendInclude(dom, arr[x], idList[z]);
          z++;
        }
      }
      x++;
    }
  },
  addClassIncludes: function (dom, rootNode) {
    var out = {
    },
    node,
    id,
    clone,
    arr,
    x = 0,
    i;
    arr = this.domUtils.getNodesByAttributeValue(dom, rootNode, 'class', 'include');
    i = arr.length;
    while (x < i) {
      id = this.domUtils.getAttrValFromTagList(dom, arr[x], [
        'a'
      ], 'href');
      if (!id) {
        id = this.domUtils.getAttrValFromTagList(dom, arr[x], [
          'object'
        ], 'data');
      }
      this.apppendInclude(dom, arr[x], id);
      x++;
    }
  },
  apppendInclude: function (dom, node, id) {
    var include,
    clone;
    id = this.utils.trim(id.replace('#', ''));
    include = dom.getElementById(id);
    if (include) {
      clone = this.domUtils.clone(dom, include);
      this.markIncludeChildren(dom, clone);
      this.domUtils.appendChild(dom, node, clone);
    }
  },
  markIncludeChildren: function (dom, rootNode) {
    var arr,
    x,
    i;
    arr = this.findRootNodes(dom, rootNode);
    x = 0;
    i = arr.length;
    this.domUtils.setAttribute(dom, rootNode, 'data-include', 'true');
    this.domUtils.setAttribute(dom, rootNode, 'style', 'display:none');
    while (x < i) {
      this.domUtils.setAttribute(dom, arr[x], 'data-include', 'true');
      x++;
    }
  },
  mergeOptions: function (options) {
    var key;
    for (key in options) {
      if (options.hasOwnProperty(key)) {
        this.options[key] = options[key];
      }
    }
  },
  clearUpDom: function (dom) {
    var arr,
    i;
    arr = this.domUtils.getNodesByAttribute(dom, dom, 'data-include');
    i = arr.length;
    while (i--) {
      this.domUtils.removeChild(dom, arr[i]);
    }
    arr = this.domUtils.getNodesByAttribute(dom, dom, 'rootids');
    i = arr.length;
    while (i--) {
      this.domUtils.removeAttribute(dom, arr[i], 'rootids');
    }
  }
};
microformats.parser = new microformats.Parser();
microformats.getItems = function (options) {
  var dom,
  node;
  dom = (options && options.document) ? options.document : document;
  node = (options && options.node) ? options.node : document;
  options = (options) ? options : {
  };
  if (!options.baseUrl && document && document.location) {
    options.baseUrl = document.location.href;
  }
  return this.parser.get(dom, node, options);
};
microformats.parser.utils = {
  isString: function (obj) {
    return typeof (obj) === 'string';
  },
  startWith: function (str, test) {
    return (str.indexOf(test) === 0);
  },
  trim: function (str) {
    if (this.isString(str)) {
      return str.replace(/^\s+|\s+$/g, '');
    } else {
      return '';
    }
  },
  isOnlyWhiteSpace: function (str) {
    return !(/[^\t\n\r ]/.test(str));
  },
  removeWhiteSpace: function (str) {
    return str.replace(/[\t\n\r ]+/g, ' ');
  },
  isArray: function (obj) {
    return obj && !(obj.propertyIsEnumerable('length')) && typeof obj === 'object' && typeof obj.length === 'number';
  },
  hasProperties: function (obj) {
    var key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        return true;
      }
    }
    return false;
  }
};
microformats.parser.domUtils = {
  innerHTML: function (dom, node) {
    return node.innerHTML;
  },
  hasAttribute: function (dom, node, attributeName) {
    return (node.attributes[attributeName]) ? true : false;
  },
  getAttribute: function (dom, node, attributeName) {
    return node.getAttribute(attributeName);
  },
  removeAttribute: function (dom, node, attributeName) {
    node.removeAttribute(attributeName);
  },
  getAttributeList: function (dom, node, attributeName) {
    var out = [
    ],
    attList;
    attList = node.getAttribute(attributeName);
    if (attList && attList !== '') {
      if (attList.indexOf(' ') > - 1) {
        out = attList.split(' ');
      } else {
        out.push(attList);
      }
    }
    return out;
  },
  hasAttributeValue: function (dom, node, attributeName, value) {
    var attList = this.getAttributeList(dom, node, attributeName);
    return (attList.indexOf(value) > - 1);
  },
  hasAttributeValueByPrefix: function (dom, node, attributeName, value) {
    var attList = [
    ],
    x = 0,
    i;
    attList = this.getAttributeList(dom, node, attributeName);
    i = attList.length;
    while (x < i) {
      if (utils.startWith(utils.trim(attList[x]), value)) {
        return true;
      }
      x++;
    }
    return false;
  },
  getNodesByAttribute: function (dom, node, name) {
    var selector = '[' + name + ']';
    return node.querySelectorAll(selector);
  },
  getNodesByAttributeValue: function (dom, rootNode, name, value) {
    var arr = [
    ],
    x = 0,
    i,
    out = [
    ];
    arr = this.getNodesByAttribute(dom, rootNode, name);
    if (arr) {
      i = arr.length;
      while (x < i) {
        if (this.hasAttributeValue(dom, arr[x], name, value)) {
          out.push(arr[x]);
        }
        x++;
      }
    }
    return out;
  },
  setAttribute: function (dom, node, name, value) {
    node.setAttribute(name, value);
  },
  getAttrValFromTagList: function (dom, node, tagNames, attributeName) {
    var i = tagNames.length;
    while (i--) {
      if (node.tagName.toLowerCase() === tagNames[i]) {
        var attr = this.getAttribute(dom, node, attributeName);
        if (attr && attr !== '') {
          return attr;
        }
      }
    }
    return null;
  },
  isSingleDescendant: function (dom, rootNode, tagNames) {
    var count = 0,
    out = null,
    child,
    x,
    i,
    y;
    x = 0;
    y = rootNode.children.length;
    while (x < y) {
      child = rootNode.children[x];
      if (child.tagName) {
        if (tagNames && this.hasTagName(child, tagNames)) {
          out = child;
        }
        if (!tagNames) {
          out = child;
        }
        count++;
      }
      x++;
    }
    if (count === 1 && out) {
      return out;
    } else {
      return null;
    }
  },
  isOnlySingleDescendantOfType: function (dom, rootNode, tagNames) {
    var i = rootNode.children.length,
    count = 0,
    child,
    out = null;
    while (i--) {
      child = rootNode.children[i];
      if (child.nodeType === 1) {
        if (this.hasTagName(child, tagNames)) {
          out = child;
          count++;
        }
      }
    }
    if (count === 1 && out) {
      return out;
    } else {
      return null;
    }
  },
  hasTagName: function (node, tagNames) {
    var i = tagNames.length;
    while (i--) {
      if (node.tagName.toLowerCase() === tagNames[i]) {
        return true;
      }
    }
    return false;
  },
  appendChild: function (dom, node, childNode) {
    node.appendChild(childNode);
  },
  removeChild: function (dom, node) {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
  },
  clone: function (dom, node) {
    var newNode = node.cloneNode(true);
    newNode.removeAttribute('id');
    return newNode;
  },
  resolveUrl: function (dom, url, baseUrl) {
    var link,
    head,
    base,
    resolved = '',
    myBase;
    if (url && url !== '' && url.indexOf(':')) {
      head = dom.getElementsByTagName('head') [0];
      base = dom.getElementsByTagName('base') [0];
      if (baseUrl && baseUrl !== '' && !base) {
        if (!head) {
          head = dom.appendChild(dom.createElement('head'));
        }
        if (!base) {
          base = myBase = dom.head.appendChild(dom.createElement('base'));
        }
        base.href = baseUrl;
      }
      link = dom.createElement('a');
      link.href = url;
      resolved = link.href;
      if (myBase) {
        head.removeChild(myBase);
      }
    }
    return resolved;
  }
};
function ISODate() {
  this.dY = - 1;
  this.dM = - 1;
  this.dD = - 1;
  this.dDDD = - 1;
  this.tH = - 1;
  this.tM = - 1;
  this.tS = - 1;
  this.tD = - 1;
  this.tzH = - 1;
  this.tzM = - 1;
  this.tzPN = '+';
  this.z = false;
  this.format = 'uf';
  this.setFormatSep();
  if (arguments[0]) {
    this.parse(arguments[0]);
  }
}
ISODate.prototype = {
  parse: function (dateString) {
    var dateNormalised = '',
    parts = [
    ],
    tzArray = [
    ],
    position = 0,
    datePart = '',
    timePart = '',
    timeZonePart = '';
    dateString = dateString.toString() .toUpperCase();
    if (dateString.indexOf('T') > - 1) {
      parts = dateString.split('T');
      datePart = parts[0];
      timePart = parts[1];
      if (timePart.indexOf('Z') > - 1) {
        this.z = true;
      }
      if (timePart.indexOf('+') > - 1 || timePart.indexOf('-') > - 1) {
        tzArray = timePart.split('Z');
        timePart = tzArray[0];
        timeZonePart = tzArray[1];
        if (timePart.indexOf('+') > - 1 || timePart.indexOf('-') > - 1) {
          position = 0;
          if (timePart.indexOf('+') > - 1) {
            position = timePart.indexOf('+');
          } else {
            position = timePart.indexOf('-');
          }
          timeZonePart = timePart.substring(position, timePart.length);
          timePart = timePart.substring(0, position);
        }
      }
    } else {
      datePart = dateString;
    }
    if (datePart !== '') {
      this.parseDate(datePart);
      if (timePart !== '') {
        this.parseTime(timePart);
        if (timeZonePart !== '') {
          this.parseTimeZone(timeZonePart);
        }
      }
    }
    return this.toString();
  },
  parseDate: function (dateString) {
    var dateNormalised = '',
    parts = [
    ];
    parts = dateString.match(/(\d\d\d\d)-(\d\d\d)/);
    if (parts) {
      if (parts[1]) {
        this.dY = parts[1];
      }
      if (parts[2]) {
        this.dDDD = parts[2];
      }
    }
    if (this.dDDD === - 1) {
      parts = dateString.match(/(\d\d\d\d)?-?(\d\d)?-?(\d\d)?/);
      if (parts[1]) {
        this.dY = parts[1];
      }
      if (parts[2]) {
        this.dM = parts[2];
      }
      if (parts[3]) {
        this.dD = parts[3];
      }
    }
    return this.toString();
  },
  parseTime: function (timeString) {
    var timeNormalised = '',
    parts = [
    ];
    parts = timeString.match(/(\d\d)?:?(\d\d)?:?(\d\d)?.?([0-9]+)?/);
    if (parts[1]) {
      this.tH = parts[1];
    }
    if (parts[2]) {
      this.tM = parts[2];
    }
    if (parts[3]) {
      this.tS = parts[3];
    }
    if (parts[4]) {
      this.tD = parts[4];
    }
    return this.toString();
  },
  parseTimeZone: function (timeString) {
    var timeNormalised = '',
    parts = [
    ];
    parts = timeString.match(/([\-\+]{1})?(\d\d)?:?(\d\d)?/);
    if (parts[1]) {
      this.tzPN = parts[1];
    }
    if (parts[2]) {
      this.tzH = parts[2];
    }
    if (parts[3]) {
      this.tzM = parts[3];
    }
    return this.toString();
  },
  toString: function (format) {
    var output = '';
    if (format) {
      this.format = format;
    }
    this.setFormatSep();
    if (this.dY > - 1) {
      output = this.dY;
      if (this.dM > 0 && this.dM < 13) {
        output += this.dsep + this.dM;
        if (this.dD > 0 && this.dD < 32) {
          output += this.dsep + this.dD;
          if (this.tH > - 1 && this.tH < 25) {
            output += 'T' + this.toTimeString(this);
          }
        }
      }
      if (this.dDDD > - 1) {
        output += this.dsep + this.dDDD;
      }
    } else if (this.tH > - 1) {
      output += this.toTimeString(this);
    }
    return output;
  },
  toTimeString: function (iso) {
    var out = '';
    this.setFormatSep();
    if (iso.tH) {
      if (iso.tH > - 1 && iso.tH < 25) {
        out += iso.tH;
        out += (iso.tM > - 1 && iso.tM < 61) ? this.tsep + iso.tM : this.tsep + '00';
        out += (iso.tS > - 1 && iso.tS < 61) ? this.tsep + iso.tS : this.tsep + '00';
        out += (iso.tD > - 1) ? '.' + iso.tD : '';
        if (iso.z) {
          out += 'Z';
        } else {
          if (iso.tzH && iso.tzH > - 1 && iso.tzH < 25) {
            out += iso.tzPN + iso.tzH;
            out += (iso.tzM > - 1 && iso.tzM < 61) ? this.tzsep + iso.tzM : this.tzsep + '00';
          }
        }
      }
    }
    return out;
  },
  setFormatSep: function () {
    switch (this.format) {
    case 'RFC3339':
      this.dsep = '';
      this.tsep = '';
      this.tzsep = '';
      break;
    case 'W3C':
      this.dsep = '-';
      this.tsep = ':';
      this.tzsep = ':';
      break;
    default:
      this.dsep = '-';
      this.tsep = ':';
      this.tzsep = '';
    }
  },
  hasFullDate: function () {
    return (this.dY !== - 1 && this.dM !== - 1 && this.dD !== - 1);
  },
  hasDate: function () {
    return (this.dY !== - 1);
  },
  hasTime: function () {
    return (this.tH !== - 1);
  },
  hasTimeZone: function () {
    return (this.tzH !== - 1);
  }
};
microformats.parser.dates = {
  utils: microformats.parser.utils,
  removeAMPM: function (str) {
    return str.replace('pm', '') .replace('p.m.', '') .replace('am', '') .replace('a.m.', '');
  },
  hasAM: function (time) {
    time = time.toLowerCase();
    return (time.indexOf('am') > - 1 || time.indexOf('a.m.') > - 1);
  },
  hasPM: function (time) {
    time = time.toLowerCase();
    return (time.indexOf('pm') > - 1 || time.indexOf('p.m.') > - 1);
  },
  isDuration: function (str) {
    if (this.utils.isString(str)) {
      str = str.toLowerCase();
      if (this.utils.startWith(str, 'p') && !str.match('t') && !str.match('-') && !str.match(':')) {
        return true;
      }
    }
    return false;
  },
  isTime: function (str) {
    if (this.utils.isString(str)) {
      str = str.toLowerCase();
      if ((str.match(':') || this.utils.startWith(str, 'z') || this.utils.startWith(str, '-') || this.utils.startWith(str, '+') || this.hasAM(str) || this.hasPM(str)) && !str.match('t')) {
        return true;
      }
    }
    return false;
  },
  parseAmPmTime: function (time) {
    var out = time,
    times = [
    ];
    if (this.utils.isString(out)) {
      time = time.toLowerCase();
      time = time.replace(/[ ]+/g, '');
      if (time.match(':') || this.hasAM(time) || this.hasPM(time)) {
        if (time.match(':')) {
          times = time.split(':');
        } else {
          times[0] = time;
          times[0] = this.removeAMPM(times[0]);
        }
        if (this.hasAM(time)) {
          if (times[0] === '12') {
            times[0] = '00';
          }
        }
        if (this.hasPM(time)) {
          if (times[0] < 12) {
            times[0] = parseInt(times[0], 10) + 12;
          }
        }
        if (times[0] && times[0].length === 1) {
          times[0] = '0' + times[0];
        }
        if (times[0]) {
          time = times.join(':');
        }
      }
    }
    return this.removeAMPM(time);
  },
  dateTimeUnion: function (date, time) {
    var isodate = new ISODate(date),
    isotime = new ISODate();
    isotime.parseTime(this.parseAmPmTime(time));
    if (isodate.hasFullDate() && isotime.hasTime()) {
      isodate.tH = isotime.tH;
      isodate.tM = isotime.tM;
      isodate.tS = isotime.tS;
      isodate.tD = isotime.tD;
      return isodate;
    } else {
      new ISODate();
    }
  },
  concatFragments: function (arr) {
    var out = null,
    i = 0,
    date = '',
    time = '',
    offset = '',
    value = '';
    for (i = 0; i < arr.length; i++) {
      value = arr[i].toUpperCase();
      if (value.match('T')) {
        return new ISODate(value);
      }
      if (value.charAt(4) === '-') {
        date = value;
      } else if ((value.charAt(0) === '-') || (value.charAt(0) === '+') || (value === 'Z')) {
        if (value.length === 2) {
          offset = value[0] + '0' + value[1];
        } else {
          offset = value;
        }
      } else {
        time = this.parseAmPmTime(value);
      }
    }
    if (date !== '') {
      return new ISODate(date + (time ? 'T' : '') + time + offset);
    } else {
      out = new ISODate(value);
      if (time !== '') {
        out.parseTime(time);
      }
      if (offset !== '') {
        out.parseTime(offset);
      }
      return out;
    }
  }
};
function Text() {
  this.textFormat = 'normalised';
  this.blockLevelTags = [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p',
    'hr',
    'pre',
    'table',
    'address',
    'article',
    'aside',
    'blockquote',
    'caption',
    'col',
    'colgroup',
    'dd',
    'div',
    'dt',
    'dir',
    'fieldset',
    'figcaption',
    'figure',
    'footer',
    'form',
    'header',
    'hgroup',
    'hr',
    'li',
    'map',
    'menu',
    'nav',
    'optgroup',
    'option',
    'section',
    'tbody',
    'testarea',
    'tfoot',
    'th',
    'thead',
    'tr',
    'td',
    'ul',
    'ol',
    'dl',
    'details'
  ];
  this.excludeTags = [
    'noframe',
    'noscript',
    'script',
    'style',
    'frames',
    'frameset'
  ];
}
Text.prototype = {
  parse: function (dom, node, textFormat) {
    var out;
    this.textFormat = (textFormat) ? textFormat : this.textFormat;
    if (this.textFormat === 'normalised') {
      out = this.walkTreeForText(node);
      if (out !== undefined) {
        out = out.replace(/&nbsp;/g, ' ');
        out = this.removeWhiteSpace(out);
        out = this.decodeEntities(out);
        out = out.replace('–', '-');
        return this.trim(out);
      } else {
        return undefined;
      }
    } else {
      return dom(node) .text();
    }
  },
  walkTreeForText: function (node) {
    var out = '',
    j = 0;
    if (this.excludeTags.indexOf(node.name) > - 1) {
      return out;
    }
    if (node.nodeType && node.nodeType === 3) {
      out += this.getElementText(node);
    }
    if (node.childNodes && node.childNodes.length > 0) {
      for (j = 0; j < node.childNodes.length; j++) {
        var text = this.walkTreeForText(node.childNodes[j]);
        if (text !== undefined) {
          out += text;
        }
      }
    }
    if (this.blockLevelTags.indexOf(node.name) !== - 1) {
      out += ' ';
    }
    return (out === '') ? undefined : out;
  },
  getElementText: function (node) {
    if (node.nodeValue) {
      return node.nodeValue;
    } else {
      return '';
    }
  },
  trim: function (str) {
    return str.replace(/^\s+|\s+$/g, '');
  },
  removeWhiteSpace: function (str) {
    return str.replace(/[\t\n\r ]+/g, ' ');
  },
  decodeEntities: function (str) {
    return document.createTextNode(str) .nodeValue;
  }
};
microformats.parser.text = {
};
microformats.parser.text.parse = function (dom, node, textFormat) {
  var text = new Text();
  return text.parse(dom, node, textFormat);
}
microformats.parser.maps['h-adr'] = {
  root: 'adr',
  name: 'h-adr',
  properties: {
    'post-office-box': {
    },
    'street-address': {
    },
    'extended-address': {
    },
    'locality': {
    },
    'region': {
    },
    'postal-code': {
    },
    'country-name': {
    }
  }
};
microformats.parser.maps['h-card'] = {
  root: 'vcard',
  name: 'h-card',
  properties: {
    'fn': {
      'map': 'p-name'
    },
    'adr': {
      'uf': [
        'h-adr'
      ]
    },
    'agent': {
      'uf': [
        'h-card'
      ]
    },
    'bday': {
      'map': 'dt-bday'
    },
    'class': {
    },
    'category': {
      'map': 'p-category',
      'relAlt': [
        'tag'
      ]
    },
    'email': {
      'map': 'u-email'
    },
    'geo': {
      'map': 'p-geo',
      'uf': [
        'h-geo'
      ]
    },
    'key': {
    },
    'label': {
    },
    'logo': {
      'map': 'u-logo'
    },
    'mailer': {
    },
    'honorific-prefix': {
    },
    'given-name': {
    },
    'additional-name': {
    },
    'family-name': {
    },
    'honorific-suffix': {
    },
    'nickname': {
    },
    'note': {
    },
    'org': {
    },
    'p-organization-name': {
    },
    'p-organization-unit': {
    },
    'photo': {
      'map': 'u-photo'
    },
    'rev': {
      'map': 'dt-rev'
    },
    'role': {
    },
    'sequence': {
    },
    'sort-string': {
    },
    'sound': {
      'map': 'u-sound'
    },
    'title': {
    },
    'tel': {
    },
    'tz': {
    },
    'uid': {
      'map': 'u-uid'
    },
    'url': {
      'map': 'u-url'
    }
  }
};
microformats.parser.maps['h-entry'] = {
  root: 'hentry',
  name: 'h-entry',
  properties: {
    'entry-title': {
      'map': 'p-name'
    },
    'entry-summary': {
      'map': 'p-summary'
    },
    'entry-content': {
      'map': 'e-content'
    },
    'published': {
      'map': 'dt-published'
    },
    'updated': {
      'map': 'dt-updated'
    },
    'author': {
      'uf': [
        'h-card'
      ]
    },
    'category': {
      'map': 'p-category',
      'relAlt': [
        'tag'
      ]
    },
    'geo': {
      'map': 'p-geo',
      'uf': [
        'h-geo'
      ]
    },
    'latitude': {
    },
    'longitude': {
    },
    'url': {
      'map': 'u-url',
      'relAlt': [
        'bookmark'
      ]
    }
  }
};
microformats.parser.maps['h-event'] = {
  root: 'vevent',
  name: 'h-event',
  properties: {
    'summary': {
      'map': 'p-name'
    },
    'dtstart': {
      'map': 'dt-start'
    },
    'dtend': {
      'map': 'dt-end'
    },
    'description': {
    },
    'url': {
      'map': 'u-url'
    },
    'category': {
      'map': 'p-category',
      'relAlt': [
        'tag'
      ]
    },
    'location': {
      'uf': [
        'h-card'
      ]
    },
    'geo': {
      'uf': [
        'h-geo'
      ]
    },
    'latitude': {
    },
    'longitude': {
    },
    'duration': {
      'map': 'dt-duration'
    },
    'contact': {
      'uf': [
        'h-card'
      ]
    },
    'organizer': {
      'uf': [
        'h-card'
      ]
    },
    'attendee': {
      'uf': [
        'h-card'
      ]
    },
    'uid': {
      'map': 'u-uid'
    },
    'attach': {
      'map': 'u-attach'
    },
    'status': {
    },
    'rdate': {
    },
    'rrule': {
    }
  }
};
microformats.parser.maps['h-geo'] = {
  root: 'geo',
  name: 'h-geo',
  properties: {
    'latitude': {
    },
    'longitude': {
    }
  }
};
microformats.parser.maps['h-item'] = {
  root: 'item',
  name: 'h-item',
  subTree: true,
  properties: {
    'fn': {
      'map': 'p-name'
    },
    'url': {
      'map': 'u-url'
    },
    'photo': {
      'map': 'u-photo'
    }
  }
};
microformats.parser.maps['h-listing'] = {
  root: 'hlisting',
  name: 'h-listing',
  properties: {
    'version': {
    },
    'lister': {
      'uf': [
        'h-card'
      ]
    },
    'dtlisted': {
      'map': 'dt-listed'
    },
    'dtexpired': {
      'map': 'dt-expired'
    },
    'location': {
    },
    'price': {
    },
    'item': {
      'uf': [
        'h-card',
        'a-adr',
        'h-geo'
      ]
    },
    'summary': {
      'map': 'p-name'
    },
    'description': {
      'map': 'e-description'
    },
    'listing': {
    }
  }
};
microformats.parser.maps['h-news'] = {
  root: 'hnews',
  name: 'h-news',
  properties: {
    'entry': {
      'uf': [
        'h-entry'
      ]
    },
    'geo': {
      'uf': [
        'h-geo'
      ]
    },
    'latitude': {
    },
    'longitude': {
    },
    'source-org': {
      'uf': [
        'h-card'
      ]
    },
    'dateline': {
      'uf': [
        'h-card'
      ]
    },
    'item-license': {
      'map': 'u-item-license'
    },
    'principles': {
      'map': 'u-principles',
      'relAlt': [
        'principles'
      ]
    }
  }
};
microformats.parser.maps['h-org'] = {
  root: 'h-x-org',
  name: 'h-org',
  properties: {
    'organization-name': {
    },
    'organization-unit': {
    }
  }
};
microformats.parser.maps['h-product'] = {
  root: 'hproduct',
  name: 'h-product',
  properties: {
    'brand': {
      'uf': [
        'h-card'
      ]
    },
    'category': {
      'map': 'p-category',
      'relAlt': [
        'tag'
      ]
    },
    'price': {
    },
    'description': {
      'map': 'e-description'
    },
    'fn': {
      'map': 'p-name'
    },
    'photo': {
      'map': 'u-photo'
    },
    'url': {
      'map': 'u-url'
    },
    'review': {
      'uf': [
        'h-review',
        'h-review-aggregate'
      ]
    },
    'listing': {
      'uf': [
        'h-listing'
      ]
    },
    'identifier': {
      'map': 'u-identifier'
    }
  }
};
microformats.parser.maps['h-recipe'] = {
  root: 'hrecipe',
  name: 'h-recipe',
  properties: {
    'fn': {
      'map': 'p-name'
    },
    'ingredient': {
      'map': 'e-ingredient'
    },
    'yield': {
    },
    'instructions': {
      'map': 'e-instructions'
    },
    'duration': {
      'map': 'dt-duration'
    },
    'photo': {
      'map': 'u-photo'
    },
    'summary': {
    },
    'author': {
      'uf': [
        'h-card'
      ]
    },
    'published': {
      'map': 'dt-published'
    },
    'nutrition': {
    },
    'tag': {
    }
  }
};
microformats.parser.maps['h-resume'] = {
  root: 'hresume',
  name: 'h-resume',
  properties: {
    'summary': {
    },
    'contact': {
      'uf': [
        'h-card'
      ]
    },
    'education': {
      'uf': [
        'h-card',
        'h-event'
      ]
    },
    'experience': {
      'uf': [
        'h-card',
        'h-event'
      ]
    },
    'skill': {
    },
    'affiliation': {
      'uf': [
        'h-card'
      ]
    }
  }
};
microformats.parser.maps['h-review-aggregate'] = {
  root: 'hreview-aggregate',
  name: 'h-review-aggregate',
  properties: {
    'summary': {
      'map': 'p-name'
    },
    'item': {
      'map': 'p-item',
      'uf': [
        'h-item',
        'h-geo',
        'h-adr',
        'h-card',
        'h-event',
        'h-product'
      ]
    },
    'rating': {
    },
    'average': {
    },
    'best': {
    },
    'worst': {
    },
    'count': {
    },
    'votes': {
    },
    'category': {
      'map': 'p-category',
      'relAlt': [
        'tag'
      ]
    },
    'url': {
      'map': 'u-url',
      'relAlt': [
        'self',
        'bookmark'
      ]
    }
  }
};
microformats.parser.maps['h-review'] = {
  root: 'hreview',
  name: 'h-review',
  properties: {
    'summary': {
      'map': 'p-name'
    },
    'description': {
      'map': 'e-description'
    },
    'item': {
      'map': 'p-item',
      'uf': [
        'h-item',
        'h-geo',
        'h-adr',
        'h-card',
        'h-event',
        'h-product'
      ]
    },
    'reviewer': {
      'uf': [
        'h-card'
      ]
    },
    'dtreviewer': {
      'map': 'dt-reviewer'
    },
    'rating': {
    },
    'best': {
    },
    'worst': {
    },
    'category': {
      'map': 'p-category',
      'relAlt': [
        'tag'
      ]
    },
    'url': {
      'map': 'u-url',
      'relAlt': [
        'self',
        'bookmark'
      ]
    }
  }
};
microformats.parser.rels = {
  'friend': [
    'yes',
    'external'
  ],
  'acquaintance': [
    'yes',
    'external'
  ],
  'contact': [
    'yes',
    'external'
  ],
  'met': [
    'yes',
    'external'
  ],
  'co-worker': [
    'yes',
    'external'
  ],
  'colleague': [
    'yes',
    'external'
  ],
  'co-resident': [
    'yes',
    'external'
  ],
  'neighbor': [
    'yes',
    'external'
  ],
  'child': [
    'yes',
    'external'
  ],
  'parent': [
    'yes',
    'external'
  ],
  'sibling': [
    'yes',
    'external'
  ],
  'spouse': [
    'yes',
    'external'
  ],
  'kin': [
    'yes',
    'external'
  ],
  'muse': [
    'yes',
    'external'
  ],
  'crush': [
    'yes',
    'external'
  ],
  'date': [
    'yes',
    'external'
  ],
  'sweetheart': [
    'yes',
    'external'
  ],
  'me': [
    'yes',
    'external'
  ],
  'license': [
    'yes',
    'yes'
  ],
  'nofollow': [
    'no',
    'external'
  ],
  'tag': [
    'no',
    'yes'
  ],
  'self': [
    'no',
    'external'
  ],
  'bookmark': [
    'no',
    'external'
  ],
  'author': [
    'no',
    'external'
  ],
  'home': [
    'no',
    'external'
  ],
  'directory': [
    'no',
    'external'
  ],
  'enclosure': [
    'no',
    'external'
  ],
  'pronunciation': [
    'no',
    'external'
  ],
  'payment': [
    'no',
    'external'
  ],
  'principles': [
    'no',
    'external'
  ]
};

/////////*****************************////////

/*
 JS Beautifier
---------------
  Written by Einars "elfz" Lielmanis, <elfz@laacz.lv> 

      http://elfz.laacz.lv/beautify/

  Originally converted to javascript by Vital, <vital76@gmail.com> 
      http://my.opera.com/Vital/blog/2007/11/21/javascript-beautify-on-javascript-translated

  You are free to use this in any way you want, in case you find this useful or working for you.
  Usage:
    js_beautify(js_source_text);
*/

function js_beautify(js_source_text, indent_size, indent_character)
{
  var input,
  output,
  token_text,
  last_type,
  current_mode,
  modes,
  indent_level,
  indent_string;
  var whitespace,
  wordchar,
  punct;
  indent_character = indent_character || ' ';
  indent_size = indent_size || 4;
  indent_string = '';
  while (indent_size--) indent_string += indent_character;
  input = js_source_text;
  last_word = '';
  // last 'TK_WORD' passed
  last_type = 'TK_START_EXPR';
  // last token type
  last_text = '';
  // last token text
  output = '';
  whitespace = '\n\r\t '.split('');
  wordchar = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$'.split('');
  punct = '+ - * / % & ++ -- = += -= *= /= %= == === != !== > < >= <= >> << >>> >>>= >>= <<= && &= | || ! !! , : ? ^ ^= |='.split(' ');
  // words which should always start on new line.
  line_starters = 'continue,try,throw,return,var,if,switch,case,default,for,while,break,function'.split(',');
  // states showing if we are currently in expression (i.e. "if" case) - 'EXPRESSION', or in usual block (like, procedure), 'BLOCK'.
  // some formatting depends on that.
  current_mode = 'BLOCK';
  modes = [
    current_mode
  ];
  indent_level = 0;
  parser_pos = 0;
  // parser position
  in_case = false;
  // flag for parser that case/default has been processed, and next colon needs special attention
  while (true) {
    var t = get_next_token(parser_pos);
    token_text = t[0];
    token_type = t[1];
    if (token_type == 'TK_EOF') {
      break;
    }
    switch (token_type) {
    case 'TK_START_EXPR':
      set_mode('EXPRESSION');
      if (last_type == 'TK_END_EXPR' || last_type == 'TK_START_EXPR') {
        // do nothing on (( and )( and ][ and ]( ..
      } else if (last_type != 'TK_WORD' && last_type != 'TK_OPERATOR') {
        print_space();
      } else if (in_array(last_word, line_starters) && last_word != 'function') {
        print_space();
      }
      print_token();
      break;
    case 'TK_END_EXPR':
      print_token();
      restore_mode();
      break;
    case 'TK_START_BLOCK':
      set_mode('BLOCK');
      if (last_type != 'TK_OPERATOR' && last_type != 'TK_START_EXPR') {
        if (last_type == 'TK_START_BLOCK') {
          print_newline();
        } else {
          print_space();
        }
      }
      print_token();
      indent();
      break;
    case 'TK_END_BLOCK':
      if (last_type == 'TK_END_EXPR') {
        unindent();
        print_newline();
      } else if (last_type == 'TK_END_BLOCK') {
        unindent();
        print_newline();
      } else if (last_type == 'TK_START_BLOCK') {
        // nothing
        unindent();
      } else {
        unindent();
        print_newline();
      }
      print_token();
      restore_mode();
      break;
    case 'TK_WORD':
      if (token_text == 'case' || token_text == 'default') {
        if (last_text == ':') {
          // switch cases following one another
          remove_indent();
        } else {
          // case statement starts in the same line where switch
          unindent();
          print_newline();
          indent();
        }
        print_token();
        in_case = true;
        break;
      }
      prefix = 'NONE';
      if (last_type == 'TK_END_BLOCK') {
        if (!in_array(token_text.toLowerCase(), [
          'else',
          'catch',
          'finally'
        ])) {
          prefix = 'NEWLINE';
        } else {
          prefix = 'SPACE';
          print_space();
        }
      } else if (last_type == 'TK_END_COMMAND' && current_mode == 'BLOCK') {
        prefix = 'NEWLINE';
      } else if (last_type == 'TK_END_COMMAND' && current_mode == 'EXPRESSION') {
        prefix = 'SPACE';
      } else if (last_type == 'TK_WORD') {
        prefix = 'SPACE';
      } else if (last_type == 'TK_START_BLOCK') {
        prefix = 'NEWLINE';
      } else if (last_type == 'TK_END_EXPR') {
        print_space();
        prefix = 'NEWLINE';
      }
      if (in_array(token_text, line_starters) || prefix == 'NEWLINE') {
        if (last_text == 'else') {
          // no need to force newline on else break
          print_space();
        } else if ((last_type == 'TK_START_EXPR' || last_text == '=') && token_text == 'function') {
          // no need to force newline on 'function': (function
          // DONOTHING
        } else if (last_type == 'TK_WORD' && (last_text == 'return' || last_text == 'throw')) {
          // no newline between 'return nnn'
          print_space();
        } else
        if (last_type != 'TK_END_EXPR') {
          if ((last_type != 'TK_START_EXPR' || token_text != 'var') && last_text != ':') {
            // no need to force newline on 'var': for (var x = 0...)
            if (token_text == 'if' && last_type == 'TK_WORD' && last_word == 'else') {
              // no newline for } else if {
              print_space();
            } else {
              print_newline();
            }
          }
        }
      } else if (prefix == 'SPACE') {
        print_space();
      }
      print_token();
      last_word = token_text;
      break;
    case 'TK_END_COMMAND':
      print_token();
      break;
    case 'TK_STRING':
      if (last_type == 'TK_START_BLOCK' || last_type == 'TK_END_BLOCK') {
        print_newline();
      } else if (last_type == 'TK_WORD') {
        print_space();
      }
      print_token();
      break;
    case 'TK_OPERATOR':
      start_delim = true;
      end_delim = true;
      if (token_text == ':' && in_case) {
        print_token();
        // colon really asks for separate treatment
        print_newline();
        break;
      }
      in_case = false;
      if (token_text == ',') {
        if (last_type == 'TK_END_BLOCK') {
          print_token();
          print_newline();
        } else {
          if (current_mode == 'BLOCK') {
            print_token();
            print_newline();
          } else {
            print_token();
            print_space();
          }
        }
        break;
      } else if (token_text == '--' || token_text == '++') {
        // unary operators special case
        if (last_text == ';') {
          // space for (;; ++i)
          start_delim = true;
          end_delim = false;
        } else {
          start_delim = false;
          end_delim = false;
        }
      } else if (token_text == '!' && last_type == 'TK_START_EXPR') {
        // special case handling: if (!a)
        start_delim = false;
        end_delim = false;
      } else if (last_type == 'TK_OPERATOR') {
        start_delim = false;
        end_delim = false;
      } else if (last_type == 'TK_END_EXPR') {
        start_delim = true;
        end_delim = true;
      } else if (token_text == '.') {
        // decimal digits or object.property
        start_delim = false;
        end_delim = false;
      } else if (token_text == ':') {
        // zz: xx
        // can't differentiate ternary op, so for now it's a ? b: c; without space before colon
        start_delim = false;
      }
      if (start_delim) {
        print_space();
      }
      print_token();
      if (end_delim) {
        print_space();
      }
      break;
    case 'TK_BLOCK_COMMENT':
      print_newline();
      print_token();
      print_newline();
      break;
    case 'TK_COMMENT':
      // print_newline();
      print_space();
      print_token();
      print_newline();
      break;
    case 'TK_UNKNOWN':
      print_token();
      break;
    }
    if (token_type != 'TK_COMMENT') {
      last_type = token_type;
      last_text = token_text;
    }
  }
  return output;
  function print_newline(ignore_repeated)
  {
    ignore_repeated = typeof ignore_repeated == 'undefined' ? true : ignore_repeated;
    output = output.replace(/[ \t]+$/, '');
    // remove possible indent
    if (output == '') return ;
    // no newline on start of file
    if (output.substr(output.length - 1) != '\n' || !ignore_repeated) {
      output += '\n';
    }
    for (var i = 0; i < indent_level; i++) {
      output += indent_string;
    }
  }
  function print_space()
  {
    if (output && output.substr(output.length - 1) != ' ' && output.substr(output.length - 1) != '\n') {
      // prevent occassional duplicate space
      output += ' ';
    }
  }
  function print_token()
  {
    output += token_text;
  }
  function indent()
  {
    indent_level++;
  }
  function unindent()
  {
    if (indent_level) {
      indent_level--;
    }
  }
  function remove_indent()
  {
    if (output.substr(output.length - indent_string.length) == indent_string) {
      output = output.substr(0, output.length - indent_string.length);
    }
  }
  function set_mode(mode)
  {
    modes.push(current_mode);
    current_mode = mode;
  }
  function restore_mode()
  {
    current_mode = modes.pop();
  }
  function get_next_token()
  {
    var n_newlines = 0;
    var c = '';
    do {
      if (parser_pos >= input.length) {
        return ['',
        'TK_EOF'];
      }
      c = input.charAt(parser_pos);
      parser_pos += 1;
      if (c == '\n') {
        n_newlines += 1;
      }
    } 
    while (in_array(c, whitespace));
    if (n_newlines > 1) {
      for (var i = 0; i < n_newlines; i++) {
        print_newline(i == 0);
      }
    }
    var wanted_newline = n_newlines == 1;
    if (in_array(c, wordchar)) {
      if (parser_pos < input.length) {
        while (in_array(input.charAt(parser_pos), wordchar)) {
          c += input.charAt(parser_pos);
          parser_pos += 1;
          if (parser_pos == input.length) break;
        }
      }
      // small and surprisingly unugly hack for 1E-10 representation

      if (parser_pos != input.length && c.match(/^[0-9]+[Ee]$/) && input.charAt(parser_pos) == '-') {
        parser_pos += 1;
        var t = get_next_token(parser_pos);
        next_word = t[0];
        next_type = t[1];
        c += '-' + next_word;
        return [c,
        'TK_WORD'];
      }
      if (c == 'in') {
        // hack for 'in' operator
        return [c,
        'TK_OPERATOR'];
      }
      return [c,
      'TK_WORD'];
    }
    if (c == '(' || c == '[') {
      return [c,
      'TK_START_EXPR'];
    }
    if (c == ')' || c == ']') {
      return [c,
      'TK_END_EXPR'];
    }
    if (c == '{') {
      return [c,
      'TK_START_BLOCK'];
    }
    if (c == '}') {
      return [c,
      'TK_END_BLOCK'];
    }
    if (c == ';') {
      return [c,
      'TK_END_COMMAND'];
    }
    if (c == '/') {
      // peek for comment /* ... */
      if (input.charAt(parser_pos) == '*') {
        comment = '';
        parser_pos += 1;
        if (parser_pos < input.length) {
          while (!(input.charAt(parser_pos) == '*' && input.charAt(parser_pos + 1) && input.charAt(parser_pos + 1) == '/') && parser_pos < input.length) {
            comment += input.charAt(parser_pos);
            parser_pos += 1;
            if (parser_pos >= input.length) break;
          }
        }
        parser_pos += 2;
        return ['/*' + comment + '*/',
        'TK_BLOCK_COMMENT'];
      }
      // peek for comment // ...

      if (input.charAt(parser_pos) == '/') {
        comment = c;
        while (input.charAt(parser_pos) != '\r' && input.charAt(parser_pos) != '\n') {
          comment += input.charAt(parser_pos);
          parser_pos += 1;
          if (parser_pos >= input.length) break;
        }
        parser_pos += 1;
        if (wanted_newline) {
          print_newline();
        }
        return [comment,
        'TK_COMMENT'];
      }
    }
    if (c == '\'' ||
    // string
    c == '"' ||
    // string
    (c == '/' && ((last_type == 'TK_WORD' && last_text == 'return') || (last_type == 'TK_START_EXPR' || last_type == 'TK_END_BLOCK' || last_type == 'TK_OPERATOR' || last_type == 'TK_EOF' || last_type == 'TK_END_COMMAND')))) {
      // regexp
      sep = c;
      c = '';
      esc = false;
      if (parser_pos < input.length) {
        while (esc || input.charAt(parser_pos) != sep) {
          c += input.charAt(parser_pos);
          if (!esc) {
            esc = input.charAt(parser_pos) == '\\';
          } else {
            esc = false;
          }
          parser_pos += 1;
          if (parser_pos >= input.length) break;
        }
      }
      parser_pos += 1;
      if (last_type == 'TK_END_COMMAND') {
        print_newline();
      }
      return [sep + c + sep,
      'TK_STRING'];
    }
    if (in_array(c, punct)) {
      while (parser_pos < input.length && in_array(c + input.charAt(parser_pos), punct)) {
        c += input.charAt(parser_pos);
        parser_pos += 1;
        if (parser_pos >= input.length) break;
      }
      return [c,
      'TK_OPERATOR'];
    }
    return [c,
    'TK_UNKNOWN'];
  }
  function in_array(what, arr)
  {
    for (var i = 0; i < arr.length; i++)
    {
      if (arr[i] == what) return true;
    }
    return false;
  }
}

/////////*****************************////////
// http://microformatshiv.com/javascript/prettify.js

var node,
options,
items,
jsonString;
node = document.getElementById('example');
options = {
  //'node': node,
  'filters': ['h-recipe']
}
items = microformats.getItems(options);
jsonString = JSON.stringify(items);
jsonString = js_beautify(jsonString);
alert(jsonString);
