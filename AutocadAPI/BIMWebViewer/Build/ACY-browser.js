

/* Copyright (c) 2016, xBIM Team, Northumbria University. All rights reserved.

This javascript library is part of xBIM project. It is provided under the same 
Common Development and Distribution License (CDDL) as the xBIM Toolkit. For 
more information see http://www.openbim.org

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */
﻿function xAttributeDictionary(lang, culture) {
    var dictionaries = [
        {
            lang: 'cs',
            culture: 'cz',
            terms: {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     FacilityDefaultLinearUnit: "Předdefinovaná jednotka délky",
                FacilityDefaultVolumeUnit: "Předdefinovaná jednotka objemu",
                FacilityDeliverablePhaseName: "Název fáze výsledku",
                FacilityDescription: "Popis nemovitosti",
                FacilityName: "Název",
                FloorCategory: "Kategorie",
                FloorDescription: "Popis",
                FloorName: "Název",
                ProjectDescription: "Popis projektu",
                Proj                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     ﻿/**
* This is the main class you need to use to render semantic structure of the building model
* 
* @name xBrowser
* @constructor
* @classdesc This is a reader of COBie data encoded in JSON format in COBieLite data structure. You can easily combine this with 3D viewer xViewer to get full
* user experience. This class is loosely coupled with jQuery UI. It is not a mandatory dependency for the rendering itself. Tree views are basically
* nested unordered lists which is a natural representation for hierarchical data and lists are rendered as a table with one column. Classes are assigned
* to different parts in a way that you can use to style in any way you want.
*
* If you want to do all the rendering yourself you can still take advantage of preprocessing which happens after COBie data is loaded. COBie data model
* is converted to the simplified structure which is more homogenous and better suitable for templating and visual representation. For more detailed 
* information have a look on {@link xVisualModel xVisualModel} and related classes. Visual model is passed as an argument to {@link xBrowser#event.loaded loaded} event.
*
* @param {string} [lang] - language code. This framework contains dictionary for parameters and attributes. It will be used for COBie processing and rendering. If your language or culture is not available default values are "en", "uk"
* @param {string} [culture] - culture code. Default combination of language and culture is "en", "uk".
*/
function xBrowser(lang, culture) {
    this._model = new xVisualModel();
    this._events = [];
    this._lang = lang;
    this._culture = culture;
    this._templates = {};

    //compile templates
    var templateStrings = xVisualTemplates();
    for (var t in templateStrings) {
        var templateString = templateStrings[t];
        this._templates[t] = this._compileTemplate(templateString);
    }
}

xBrowser.prototype._compileTemplate = function (str) {
    // Based on Simple JavaScript Templating
    // John Resig - http://ejohn.org/ - MIT Licensed
    // http://ejohn.org/blog/javascript-micro-templating/
    return new Function("_data_",
                    "var _p_=[],print=function(){_p_.push.apply(_p_,arguments);};" +

                    // Introduce the data as local variables using with(){}
                    "with(_data_){_p_.push('" +

                    // Convert the template into pure JavaScript
                    str
                      .replace(/[\r\t\n]/g, " ")
                      .split("<%").join("\t")
                      .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                      .replace(/\t=(.*?)%>/g, "',$1,'")
                      .split("\t").join("');")
                      .split("%>").join("_p_.push('")
                      .split("\r").join("\\'")
                  + "');}return _p_.join('');");
};

xBrowser.prototype._iconMap = {
    def: 'ui-icon-document',
    facility: 'ui-icon-home',
    space: 'ui-icon-document-b',
    floor: 'ui-icon-image',
    assettype: 'ui-icon-copy',
    asset: 'ui-icon-script',
    document: 'ui-icon-document',
    issue: 'ui-icon-clipboard',
    contact: 'ui-icon-person',
    system: 'ui-icon-wrench',
    zone: 'ui-icon-newwin'
};

/**
* This function renders spatial structure as a tree view (facility -> floors -> spaces -> assets). If you use jQuery UI it can be turned into collapsable tree control
* with UI icons. But it is not mandatory and you can style it any way you want. Just keep in mind that HTML elements
* created by this function have a handlers attached which will fire UI events of {@link xBrowser xBrowser}. If you do any
* heavy transformation of the resulting HTML make sure you keep this if other parts of your code rely on these events.
* @function xBrowser#renderSpatialStructure
* @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
* @param {Bool} initTree - if true and jQuery UI is referenced tree will be rendered using UI icons as a collapsable tree control.
*/
xBrowser.prototype.renderSpatialStructure = function (container, initTree){
    if (!this._model) throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
    
    this._renderTreeView(container, this._model.facility, initTree);
};

/**
* This function renders asset types as a tree view (asset type -> asset). If you use jQuery UI it can be turned into collapsable tree control
* with UI icons. But it is not mandatory and you can style it any way you want. Just keep in mind that HTML elements
* created by this function have a handlers attached which will fire UI events of {@link xBrowser xBrowser}. If you do any
* heavy transformation of the resulting HTML make sure you keep this if other parts of your code rely on these events.
* @function xBrowser#renderAssetTypes
* @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
* @param {Bool} initTree - if true and jQuery UI is referenced tree will be rendered using UI icons as a collapsable tree control.
*/
xBrowser.prototype.renderAssetTypes = function (container, initTree) {
    if (!this._model) throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';

    this._renderTreeView(container, this._model.assetTypes, initTree);
};

/**
* This function renders asset types as a list view (asset type -> asset). If you use jQuery UI it will use UI icons. 
* But it is not mandatory and you can style it any way you want. Just keep in mind that HTML elements
* created by this function have a handlers attached which will fire UI events of {@link xBrowser xBrowser}. If you do any
* heavy transformation of the resulting HTML make sure you keep this if other parts of your code rely on these events.
* @function xBrowser#renderContacts
* @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
*/
xBrowser.prototype.renderContacts = function (container) {
    if (!this._model) throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
    this._renderListView(container, this._model.contacts, this._templates.contact);
};

/**
* This function renders systems as a tree view (systems -> assets). If you use jQuery UI it can be turned into collapsable tree control
* with UI icons. But it is not mandatory and you can style it any way you want. Just keep in mind that HTML elements
* created by this function have a handlers attached which will fire UI events of {@link xBrowser xBrowser}. If you do any
* heavy transformation of the resulting HTML make sure you keep this if other parts of your code rely on these events.
* @function xBrowser#renderSystems
* @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
* @param {Bool} initTree - if true and jQuery UI is referenced tree will be rendered using UI icons as a collapsable tree control.
*/
xBrowser.prototype.renderSystems = function (container, initTree) {
    if (!this._model) throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
    this._renderTreeView(container, this._model.systems, initTree);
};

/**
* This function renders zones as a tree view (zones -> spaces -> assets). If you use jQuery UI it can be turned into collapsable tree control
* with UI icons. But it is not mandatory and you can style it any way you want. Just keep in mind that HTML elements
* created by this function have a handlers attached which will fire UI events of {@link xBrowser xBrowser}. If you do any
* heavy transformation of the resulting HTML make sure you keep this if other parts of your code rely on these events.
* @function xBrowser#renderZones
* @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
* @param {Bool} initTree - if true and jQuery UI is referenced tree will be rendered using UI icons as a collapsable tree control.
*/
xBrowser.prototype.renderZones = function (container, initTree) {
    if (!this._model) throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
    this._renderTreeView(container, this._model.zones, initTree);
};


/**
* This function renders assignments as a list view. This represents different kinds of relations between this and other entities
* If you use jQuery UI it will use UI icons. 
* But it is not mandatory and you can style it any way you want. Just keep in mind that HTML elements
* created by this function have a handlers attached which will fire UI events of {@link xBrowser xBrowser}. If you do any
* heavy transformation of the resulting HTML make sure you keep this if other parts of your code rely on these events.
* @function xBrowser#renderAssignments
* @param {xVisualEntity} entity - visual entity. You can obtain this entity directly from xVisualModel or in a handler of one of these events:
* {@link xBrowser#event:entityClick entityClick}, 
* {@link xBrowser#event:entityDblclick entityDblclick}, 
* {@link xBrowser#event:entityMouseDown entityMouseDown}, 
* {@link xBrowser#event:entityMouseUp entityMouseUp}, 
* {@link xBrowser#event:entityMouseMove entityMouseMove}, 
* {@link xBrowser#event:entityTouch entityTouch}, 
* {@link xBrowser#event:entityActive entityActive} 
* @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
*/
xBrowser.prototype.renderAssignments = function (entity, container) {
    if (!this._model) throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
    container = this._getContainer(container);
    container.innerHTML = "";

    var sets = entity.assignments;
    if (sets.length == 0) return;
    for (var i = 0; i < sets.length; i++) {
        var set = sets[i];
        if (set.assignments.length == 0) continue;

        var div = document.createElement("div");
        div.classList.add('ACY-assignment');
        div.classList.add('ui-widget');
        div.classList.add('ui-corner-all');
        div.classList.add('ui-widget-content');

        var header = document.createElement('h3');
        header.classList.add('ACY-assignment-header');
        header.classList.add('ui-corner-all');
        header.classList.add('ui-widget-header');
        header.classList.add('ui-state-default');
        header.innerHTML = set.name ? set.name : 'Undefined';
        div.appendChild(header);

        var data = document.createElement('div');
        data.classList.add('ACY-assignment-content');
        this._renderListView(data, set.assignments)
        div.appendChild(data);

        container.appendChild(div);
    }


};

/**
* This function renders documents as a list view. If you use jQuery UI it will use UI icons. 
* But it is not mandatory and you can style it any way you want. Just keep in mind that HTML elements
* created by this function have a handlers attached which will fire UI events of {@link xBrowser xBrowser}. If you do any
* heavy transformation of the resulting HTML make sure you keep this if other parts of your code rely on these events.
* @function xBrowser#renderDocuments
* @param {xVisualEntity} entity - visual entity. You can obtain this entity directly from xVisualModel or in a handler of one of these events:
* {@link xBrowser#event:entityClick entityClick}, 
* {@link xBrowser#event:entityDblclick entityDblclick}, 
* {@link xBrowser#event:entityMouseDown entityMouseDown}, 
* {@link xBrowser#event:entityMouseUp entityMouseUp}, 
* {@link xBrowser#event:entityMouseMove entityMouseMove}, 
* {@link xBrowser#event:entityTouch entityTouch}, 
* {@link xBrowser#event:entityActive entityActive} 
* @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
*/
xBrowser.prototype.renderDocuments = function (entity, container) {
    if (!entity) throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
    var self = this;
    container = this._getContainer(container);
    var docs = entity.documents;
    if (docs) {
        this._renderListView(container, docs, null, 'document');
    }
};

/**
* This function renders issues assigned to the entity as a list view. If you use jQuery UI it will use UI icons. 
* But it is not mandatory and you can style it any way you want. Just keep in mind that HTML elements
* created by this function have a handlers attached which will fire UI events of {@link xBrowser xBrowser}. If you do any
* heavy transformation of the resulting HTML make sure you keep this if other parts of your code rely on these events.
* @function xBrowser#renderIssues
* @param {xVisualEntity} entity - visual entity. You can obtain this entity directly from xVisualModel or in a handler of one of these events:
* {@link xBrowser#event:entityClick entityClick}, 
* {@link xBrowser#event:entityDblclick entityDblclick}, 
* {@link xBrowser#event:entityMouseDown entityMouseDown}, 
* {@link xBrowser#event:entityMouseUp entityMouseUp}, 
* {@link xBrowser#event:entityMouseMove entityMouseMove}, 
* {@link xBrowser#event:entityTouch entityTouch}, 
* {@link xBrowser#event:entityActive entityActive} 
* @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
*/
xBrowser.prototype.renderIssues = function (entity, container) {
    if (!entity) throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
    var self = this;
    container = this._getContainer(container);
    var issues = entity.issues;
    if (issues) {
        this._renderListView(container, issues, null, 'clipboard');
    }
};


/**
* This function renders attributes assigned to the entity as a list view. Attributes are COBie equivalent for Property Sets and can contain
* arbitrary data. If you use jQuery UI it will use UI icons. 
* But it is not mandatory and you can style it any way you want. 
* @function xBrowser#renderAttributes
* @param {xVisualEntity} entity - visual entity. You can obtain this entity directly from xVisualModel or in a handler of one of these events:
* {@link xBrowser#event:entityClick entityClick}, 
* {@link xBrowser#event:entityDblclick entityDblclick}, 
* {@link xBrowser#event:entityMouseDown entityMouseDown}, 
* {@link xBrowser#event:entityMouseUp entityMouseUp}, 
* {@link xBrowser#event:entityMouseMove entityMouseMove}, 
* {@link xBrowser#event:entityTouch entityTouch}, 
* {@link xBrowser#event:entityActive entityActive} 
* @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
*/
xBrowser.prototype.renderAttributes = function (entity, container) {
    if (!entity) throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
    var self = this;
    container = this._getContainer(container);
    var html = self._templates.attribute(entity);
    container.innerHTML = html;
};

/**
* This function renders properties assigned to the entity as a list view. Properties are predefined in COBie data model. If you use jQuery UI it will use UI icons. 
* But it is not mandatory and you can style it any way you want. 
* @function xBrowser#renderProperties
* @param {xVisualEntity} entity - visual entity. You can obtain this entity directly from xVisualModel or in a handler of one of these events:
* {@link xBrowser#event:entityClick entityClick}, 
* {@link xBrowser#event:entityDblclick entityDblclick}, 
* {@link xBrowser#event:entityMouseDown entityMouseDown}, 
* {@link xBrowser#event:entityMouseUp entityMouseUp}, 
* {@link xBrowser#event:entityMouseMove entityMouseMove}, 
* {@link xBrowser#event:entityTouch entityTouch}, 
* {@link xBrowser#event:entityActive entityActive} 
* @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
*/
xBrowser.prototype.renderProperties = function (entity, container) {
    if (!entity) throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
    var self = this;
    container = this._getContainer(container);
    var html = self._templates.property(entity);
    container.innerHTML = html;
};

/**
* This function renders properties and attributes assigned to the entity as a list view. This combines data which can be rendered separately 
* by {@link xBrowser#renderProperties renderProperties()} or {@link xBrowser#renderAttributes renderAttributes()} but it is sometimes convenient
* to render both into one single layout.  If you use jQuery UI it will use UI icons. 
* But it is not mandatory and you can style it any way you want.
* 
* @function xBrowser#renderPropertiesAttributes
* @param {xVisualEntity} entity - visual entity. You can obtain this entity directly from xVisualModel or in a handler of one of these events:
* {@link xBrowser#event:entityClick entityClick}, 
* {@link xBrowser#event:entityDblclick entityDblclick}, 
* {@link xBrowser#event:entityMouseDown entityMouseDown}, 
* {@link xBrowser#event:entityMouseUp entityMouseUp}, 
* {@link xBrowser#event:entityMouseMove entityMouseMove}, 
* {@link xBrowser#event:entityTouch entityTouch}, 
* {@link xBrowser#event:entityActive entityActive} 
* @param {string|HTMLElement} container - string ID of the contaier or HTMLElement representing container. Resulting HTML will be placed inside of this element. Be aware that this will erase any actual content of the container element.
*/
xBrowser.prototype.renderPropertiesAttributes = function (entity, container) {
    if (!entity) throw 'No data to be rendered. Use this function in an event handler of "loaded" event.';
    var self = this;
    container = this._getContainer(container);
    var html = self._templates.propertyattribute(entity);
    container.innerHTML = html;
};

xBrowser.prototype._registerEntityCallBacks = function (element, entity) {
    var self = this;
    element.entity = entity; 
    //element.addEventListener('', function (e) { self._fire('', { entity: entity, event: e , element: element}); e.stopPropagation(); });

    /**
    * Occurs when user clicks on a HTML element representing {@link xVisualEntity xVisualEntity}
    * @event xBrowser#entityClick
    * @type {object}
    * @param {xVisualEntity} entity 
    * @param {object} event 
    * @param {HTMLElement} element 
    */
    /**
    * Occurs when user clicks on a HTML element representing {@link xVisualEntity xVisualEntity} or if {@link xBrowser#activateEntity activateEntity()} is called. 
    * @event xBrowser#entityActive
    * @type {object}
    * @param {xVisualEntity} entity 
    * @param {object} event 
    * @param {HTMLElement} element - This argument might be null if event is fired in code by call to {@link xBrowser#activateEntity activateEntity()}. 
    */
    /**
    * Occurs when user double clicks on a HTML element representing {@link xVisualEntity xVisualEntity}.
    * @event xBrowser#entityDblclick
    * @type {object}
    * @param {xVisualEntity} entity 
    * @param {object} event 
    * @param {HTMLElement} element - This argument might be null if event is fired in code by call to {@link xBrowser#activateEntity activateEntity()}. 
    */
    element.addEventListener('click', function (e) {
        self._fire('entityClick', { entity: entity, event: e, element: element });
        self._fire('entityActive', { entity: entity, event: e, element: element });
        e.stopPropagation();
    });
    element.addEventListener('dblclick', function (e) {
        self._fire('entityDblclick', { entity: entity, event: e, element: element });
        self._fire('entityActive', { entity: entity, event: e, element: element });
        e.stopPropagation();
    });

    /**
    * Occurs when mouseDown event occurs on a HTML element representing {@link xVisualEntity xVisualEntity}
    * @event xBrowser#entityMouseDown
    * @type {object}
    * @param {xVisualEntity} entity 
    * @param {object} event 
    * @param {HTMLElement} element 
    */
    element.addEventListener('mouseDown', function (e) { self._fire('entityMouseDown', { entity: entity, event: e, element: element }); e.stopPropagation(); });
    /**
    * Occurs when mouseUp event occurs on a HTML element representing {@link xVisualEntity xVisualEntity}
    * @event xBrowser#entityMouseUp
    * @type {object}
    * @param {xVisualEntity} entity 
    * @param {object} event 
    * @param {HTMLElement} element 
    */
    element.addEventListener('mouseUp', function (e) { self._fire('entityMouseUp', { entity: entity, event: e, element: element }); e.stopPropagation(); });
    /**
    * Occurs when mouseMove event occurs on a HTML element representing {@link xVisualEntity xVisualEntity}
    * @event xBrowser#entityMouseMove
    * @type {object}
    * @param {xVisualEntity} entity 
    * @param {object} event 
    * @param {HTMLElement} element 
    */
    element.addEventListener('mouseMove', function (e) { self._fire('entityMouseMove', { entity: entity, event: e, element: element }); e.stopPropagation(); });
    /**
    * Occurs when touch event occurs on a HTML element representing {@link xVisualEntity xVisualEntity}
    * @event xBrowser#entityTouch
    * @type {object}
    * @param {xVisualEntity} entity 
    * @param {object} event 
    * @param {HTMLElement} element 
    */
    element.addEventListener('touch', function (e) { self._fire('entityTouch', { entity: entity, event: e, element: element }); e.stopPropagation(); });
};

xBrowser.prototype._uiTree = function (container) {
    if (!container) return;
    //this only works if jQuery UI is available
    if (!jQuery || !jQuery.ui) return;

    var $container = typeof (container) == 'string' ? $("#" + container) : $(container);
    var elements = typeof (container) == 'string' ? $("#" + container + " li") : $(container).find('li');

    //return if tree has been initialized already
    if ($container.hasClass('ACY-tree')) return;
    $container.addClass('ACY-tree');

    var iconOpen = "ui-icon-triangle-1-s";
    var iconClosed = "ui-icon-triangle-1-e";
    var iconLeaf = "ui-icon-document";

    elements
        .prepend(function () {
            if ($(this).children('ul').length > 0){
                $(this).addClass('ACY-tree-node');
                return '<span class="ui-icon ' + iconClosed + '" style="float: left;"></span>';
            }
            else {
                $(this).addClass('ACY-tree-leaf');
                return '';
            }
        })
        .css('list-style-type', 'none')
        .css('cursor', 'default')
    .children('ul').hide();

    elements.find('span.' + iconClosed).on("click", function (e) {
        e.stopPropagation();
        $(this).parent().children('ul').slideToggle();

        if ($(this).hasClass(iconClosed))
            $(this).removeClass(iconClosed).addClass(iconOpen);
        else
            $(this).removeClass(iconOpen).addClass(iconClosed);
    });

    //open first level if there is only one element
    var firstLevel = $container.children('ul').children('li');
    if (firstLevel.length == 1) firstLevel.children('span.' + iconClosed).click();
};

xBrowser.prototype._renderListView = function (container, entities, entityTemplate) {
    var self = this;
    container = this._getContainer(container);
    entityTemplate = entityTemplate ? entityTemplate : self._templates.entity;

    var table = document.createElement('table');
    container.innerHTML = "";
    container.appendChild(table);

    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        var html = entityTemplate(entity);

        var tr = document.createElement('tr');
        table.appendChild(tr);
        var td = document.createElement('td');
        tr.appendChild(td);

        td.innerHTML = html;
        this._registerEntityCallBacks(td, entity);

        if (jQuery && jQuery.ui) {
            var icon = this._iconMap[entity.type] ? this._iconMap[entity.type] : this._iconMap['def'];
            $(td).prepend('<span class="ui-icon ' + icon + '" style="float: left;"></span>');
        }
    }
};

xBrowser.prototype._renderTreeView = function (container, roots, initSimpleTree, entityTemplate) {
    var self = this;
    container = this._getContainer(container);
    entityTemplate = entityTemplate ? entityTemplate : self._templates.entity;  
    initSimpleTree = initSimpleTree ? initSimpleTree : true;

    var renderEntities = function (entities, ul) {
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            var html = entityTemplate(entity);

            var li = document.createElement('li');
            li.innerHTML = html;
            self._registerEntityCallBacks(li, entity);

            if (!ul) {
                var ul = document.createElement('ul');
                container.appendChild(ul);
            }

            ul.appendChild(li);

            //recursive call if this element has any children
            if (entity.children && entity.children.length > 0) {
                var inUl = document.createElement('ul');
                li.appendChild(inUl);
                renderEntities(entity.children, inUl)
            }

            if (jQuery && jQuery.ui) {
                var icon = self._iconMap[entity.type] ? self._iconMap[entity.type] : self._iconMap['def'];
                $(li).prepend('<span class="ui-icon ' + icon + '" style="float: left;"></span>');
            }
        }
    };

    
    renderEntities(roots);
    if (initSimpleTree) this._uiTree(container);
};

/**
* Use this function to activate entity from code. This will cause {@link xBrowser#event:entityActive entityActive} event to be fired.
* That might be usefull to update data relying on any kind of selection.
* @function xBrowser#activateEntity
* @param {Number} id - ID of the entity to be activated
*/
xBrowser.prototype.activateEntity = function (id) {
    if (!this._model) return;
    var entity = this._model.getEntity(id);
    if (!entity) return;

    this._fire('entityActive', { entity: entity });
};

xBrowser.prototype._getContainer = function (container) {
    if (typeof (container) == 'object') return container;
    if (typeof (container) == 'string') {
        container = document.getElementById(container);
        if (container) return container;
    }
    if (!container) return document.documentElement;
};

/**
* Use this function to load data from JSON representation of COBieLite. Listen to {@link xBrowser#event:loaded loaded} event to start
* using the browser.
* @function xBrowser#                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             ﻿function xCobieUkUtils(lang, culture) {
    this._dictionary = new xAttributeDictionary(lang, culture);
    this._contacts = [];
};

xCobieUkUtils.prototype.settings = {
    decimalPlaces: 4
};

xCobieUkUtils.prototype.getVisualEntity = function (entity, type) {
    if (!entity || !type) throw 'entity must be defined';
    return new xVisualEntity({
        id: entity.ExternalId,
        type: type,
        name: this.getValidationStatus(entity) + entity.Name, //prepend validation status. This will make it easier for later.
        description: entity.Description,
        attributes: this.getAttributes(entity),
        properties: this.getProperties(entity),
        assignments: this.getAssignments(entity, type),
        documents: this.getDocuments(entity, type),
        issues: this.getIssues(entity)
    });
};

xCobieUkUtils.prototype.getValidationStatus = function (entity) {
    if (entity.Categories == null) return "";

    for (var i = 0; i < entity.Categories.length; i++) {
        var category = entity.Categories[i];
        if (typeof (category.Code) !== "undefined" && category.Code.toLowerCase() === "failed")
            return "[F] ";
        if (typeof (category.Code) !== "undefined" && category.Code.toLowerCase() === "passed")
            return "[T] ";
    }
    return "";
};

xCobieUkUtils.prototype.getVisualModel = function (data) {
    if (!data) throw 'data must be defined';

    //contacts are used very often as a references in assignments
    //so it is good to have them in the wide scope for processing
    this._contacts = this.getContacts(data);

    var types = this.getAssetTypes(data);
    //this will also add assets to spaces where they should be
    var facility = this.getSpatialStructure(data, types);
    return new xVisualModel({
        facility: facility,
        zones: this.getZones(data, facility),
        systems: this.getSystems(data, types),
        assetTypes: types,
        contacts: this._contacts
    });
};

xCobieUkUtils.prototype.getContacts = function (data) {
    if (!data) throw 'data must be defined';
    var result = [];
    var contacts = data.Contacts;
    if (!contacts) return result;

    for (var i = 0; i < contacts.length; i++) {
        var vContact = this.getVisualEntity(contacts[i], 'contact');
        result.push(vContact);
    }

    return result;
};

xCobieUkUtils.prototype.getSpatialStructure = function (data, types) {
    if (!data) throw 'data must be defined';
    if (!types) throw 'types must be defined';

    var facility = this.getVisualEntity(data, 'facility');

    var floors = data.Floors;
    if (!floors || floors.length == 0)
        return [facility];

    for (var i in floors) {
        var floor = floors[i];
        var vFloor = this.getVisualEntity(floor, 'floor');
        facility.children.push(vFloor);

        var spaces = floor.Spaces;
        if (!spaces) continue;

        for (var s in spaces) {
            var space = spaces[s];
            var vSpace = this.getVisualEntity(space, 'space');
            vFloor.children.push(vSpace);
        }
    }

    //add asset types and assets to spaces 
    for (var t in types) {
        var type = types[t];
        for (var i in type.children) {
            var instance = type.children[i];

            //check assignments
            var assignmentSet = instance.assignments.filter(function (e) { return e.id == 'Space' })[0];
            if (!assignmentSet) continue;
            key = assignmentSet.assignments[0];
            if (!key) continue;

            var spaceProp = key.properties.filter(function (e) { return e.id == 'Name' })[0];
            if (!spaceProp) continue;

            var spaceName = spaceProp.value.split(",")[0];

            for (var j = 0; j < facility.children.length; j++) {
                var floor = facility.children[j];

                var space = floor.children.filter(function (e) { return e.name == spaceName })[0];
                if (!space) continue;

                space.children.push(instance);
                assignmentSet.assignments[0] = space;
                break;;
            }


        }
    }

    //facility is a root element of the tree spatial structure
    return [facility];
};

xCobieUkUtils.prototype.getZones = function (data, facility) {
    if (!data) throw 'data must be defined';
    if (!facility) throw 'data must be defined';
    var result = [];

    var zones = data.Zones;
    if (!zones) return result;

    for (var z in zones) {
        var zone = zones[z];
        var vZone = this.getVisualEntity(zone, 'zone');
        result.push(vZone);

        //add spaces as a children
        var keys = zone.Spaces;
        if (!keys || keys.length == 0) continue;

        for (var ki in keys) {
            var key = keys[ki];
            for (var i = 0; i < facility.length; i++) { //f                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                t);
                        }
                        assignmentSet.assignments.push(vZone);
                    }
                }
            }
        }
    }

    return result;
};

xCobieUkUtils.prototype.getSystems = function (data, types) {
    if (!data) throw 'data must be defined';
    if (!types) throw 'types must be defined';
    var result = [];

    var systems = data.Systems;
    if (!systems) return result;

    var instances = [];
    for (var k = 0; k < types.length; k++) {
        var type = types[k];
        for (var c in type.children) {
            instances.push(type.children[c]);
        }
    }

    for (var s in systems) {
        var system = systems[s];
        var vSystem = this.getVisualEntity(system, 'system');
        result.push(vSystem);

        //add assets to systems 
        var componentKeys = system.Components;
        for (var j = 0; j < componentKeys.length; j++) {
            var key = componentKeys[j];
            var candidates = instances.filter(function (e) { return e.name == key.Name; });
            if (!candidates) continue;
            var instance = candidates[0];
            if(!instance) continue;

            //add asset to system
            vSystem.children.push(instance);
            //add system to asset assignments
            var assignmentSet = instance.assignments.filter(function (e) { return e.id == 'System'; })[0];
            if (!assignmentSet) {
                assignmentSet = new xVisualAssignmentSet();
                assignmentSet.id = "System";
                assignmentSet.Name = "Systems";
                instance.assignments.push(assignmentSet);
            }
            assignmentSet.assignments.push(vSystem);
        }
    }
    return result;
};

xCobieUkUtils.prototype.getAssetTypes = function (data) {
    if (!data) throw 'data must be defined';
    var result = [];
    var tr                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          ﻿/**
* @name xVisualAttribute
* @constructor
* @classdesc Visual model describing attribute of the object
* @param {object} [values] - Object which can be used to initialize content of the object. It can be also used to create shallow copy of the object.
*/
function xVisualAttribute(values) {

    /** @member {string} xVisualAttribute#name */
    this.name = "";
    /** @member {string} xVisualAttribute#description */
    this.description = "";
    /** @member {string} xVisualAttribute#value */
    this.value = "";
    /** @member {string} xVisualAttribute#propertySet - original property set name from IFC file */
    this.propertySet = "";
    /** @member {string} xVisualAttribute#category */
    this.category = "";
    /** @member {xVisualEntity[]} xVisualAttribute#issues */
    this.issues = [];

    if (typeof (values) == 'object') {
        for (var a in values) {
            this[a] = values[a];
        }
    }
};
﻿/**
* Visual model containing entity data
* 
* @name xVisualEntity
* @constructor
* @classdesc Visual model containing entity data
* @param {object} [values] - Object which can be used to initialize content of the object. It can be also used to create shallow copy of the object.
*/
function xVisualEntity(values) {
    /** @member {string} xVisualEntity#id - ID extracted from object attributes*/
    this.id = "";
    /** @member {string} xVisualEntity#type - type of the object like asset, assettype, floor, facility, assembly and others. It is always one lower case word.*/
    this.type = "";
    /** @member {string} xVisualEntity#name - Name extracted from object attributes*/
    this.name = "";
    /** @member {string} xVisualEntity#description - Description extracted from attributes*/
    this.description = "";
    /** @member {xVisualAttribute[]} xVisualEntity#attributes */
    this.attributes = [];
    /** @member {xVisualProperty[]} xVisualEntity#properties */
    this.properties = [];
    /** @member {xVisualEntity[]} xVisualEntity#documents */
    this.documents = [];
    /** @member {xVisualEntity[]} xVisualEntity#issues */
    this.issues = [];
    /** @member {xVisualAssignmentSet[]} xVisualEntity#assignments - An array of {@link xVisualAsignmentSet visual assignment sets} */
    this.assignments = [];
    /** @member {xVisualEntity[]} xVisualEntity#children - this can be used to build hierarchical structures like facility -> floors -> spaces -> assets */
    this.children = []; 
    /** @member {xVisualEntity[]} xVisualEntity#warranties - this is applicable for asset type only. */
    this.warranties = []; 

    this.isKey = false; //indicates if this is only a key for the actual entity

    if (typeof (values) == 'object') {
        for (var a in values) {
            this[a] = values[a];
        }
    }
};
﻿/**
* Visual model containing preprocessed COBie data in more uniform form usable for templating and rendering
* 
* @name xVisualModel
* @constructor
* @classdesc Visual model containing preprocessed COBie data in more uniform form usable for templating and rendering
* @param {object} [values] - Object which can be used to initialize content of the object. It can be also used to create shallow copy of the object.
*/
function xVisualModel(values) {
    /** @member {xVisualEntity[]} xVisualModel#facility - An array of facilities. There is always one faclity but it is convenient to have all
    * members of xVisualModel to be an array so they can be accessed in an uniform way.
    */
    this.facility = [];
    /** @member {xVisualEntity[]} x                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  var get = function (collection, id) {
        for (var i = 0; i < collection.length; i++) {
            var entity = collection[i];
            if (entity.id == id) return entity;
            var result = get(entity.children, id);
            if (result) return result;
        }
        return null;
    };

    for (var i in this) {
        if (typeof (this[i]) == 'function') continue;
        var result = get(this[i], id);
        if (result) return result;
    }
    return null;
};                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 ﻿function xVisualTemplates() {
    return {
        property:
'<%if (properties && properties.length > 0) {%>\
<table> \
    <% for (var p in properties) { var prop = properties[p];%> \
    <tr> \
        <td><%=prop.name%></td>\
        <td><%=prop.value%></td>\
    </tr>\
    <%}%>\
</table> \
<%}%>',
        attribute:
'<% if (attributes && attributes.length > 0) {\
    var psets = [];\
    for(var i = 0; i < attributes.length; i++){\
        var attr = attributes[i]; var pset = attr.propertySet; if (pset) {if(psets.indexOf(pset) == -1){psets.push(pset);}}\
    }\
%>\
<table> \
    <% for (var p in psets) { var psetName = psets[p]; var pset = attributes.filter(function(e){ return e.propertySet == psetName;});\
%>\
<tr><th colspan="2"><%=psetName%></th></tr>\
<%for (var a in pset) { var attr = pset[a];%> \
    <tr title="<%=attr.description%>"> \
        <td><%=attr.name%></td>\
        <td><%=attr.value%></td>\
    </tr>\
    <%}}%>\
</table>\
<%}%>',
        propertyattribute:
'<%if (properties.length > 0 || attributes.length > 0) {%><table> \
    <% for (var p in properties) { var prop = properties[p];%> \
    <tr> \
        <td><%=prop.name%></td>\
        <td><%=prop.value%></td>\
    </tr>\
    <%}%>\
<%}\
if (attributes && attributes.length > 0) {\
    var psets = [];\
    for(var i = 0; i < attributes.length; i++){\
        var attr = attributes[i]; if (!attr.propertySet) attr.propertySet = "General";\
        var pset = attr.propertySet; if (pset) {if(psets.indexOf(pset) == -1){psets.push(pset);}}\
    }\
%>\
    <% for (var p in psets) { var psetName = psets[p]; var pset = attributes.filter(function(e){ return e.propertySet == psetName;});\
%>\
<tr><th colspan="2"><%=psetName%></th></tr>\
<%for (var a in pset) { var attr = pset[a];%> \
    <tr title="<%=attr.description%>"> \
        <td><%=attr.name%></td>\
        <td><%=attr.value%></td>\
    </tr>\
    <%}}%>\
</table>\
<%}%>',
        entity: '<span class="ACY-entity" title="<%=typeof(description) != "undefined" ? description : ""%>"> <%= name? name: (function f() { return type.charAt(0).toUpperCase() + type.slice(1); })() %> </span>',
        contact:
'<% var nameA = properties.filter(function(e){return e.id == "ContactGivenName";})[0] || properties.filter(function(e){return e.id == "GivenName";})[0]; \
var surnameA = properties.filter(function(e){return e.id == "ContactFamilyName";})[0] || properties.filter(function(e){return e.id == "FamilyName";})[0]; \
var emailA = properties.filter(function(e){return e.id == "ContactEmail";})[0] || properties.filter(function(e){return e.id == "Email";})[0]; \
var name = nameA ? nameA.value : "";\
var surname = surnameA ? surnameA.value : "";\
var email = emailA ? emailA.value : ""; %>\
<span class="ACY-entity" title="<%=email%>"> <%=name%> <%=surname%> <% if (!name && !surname) print("No name"); %> </span>'
    }
};
