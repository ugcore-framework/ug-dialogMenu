(function () {
    let MenuTpl =
        '<div id="menu_{{_namespace}}_{{_name}}" class="dialog {{#isBig}}big{{/isBig}}">' +
        '<div class="head"><span>{{title}}</span></div>' +
        '{{#isDefault}}<input type="text" name="value" id="inputText"/>{{/isDefault}}' +
        '{{#isBig}}<textarea name="value"/>{{/isBig}}' +
        '<button type="button" name="submit">Submit</button>' +
        '<button type="button" name="cancel">Cancel</button>' +
        "</div>" +
        "</div>";
    window.UgCore = {};
    UgCore.ResourceName = "ug-dialogMenu";
    UgCore.Openned = {};
    UgCore.Focus = [];
    UgCore.Pos = {};

    UgCore.open = function (namespace, name, data) {
        if (typeof UgCore.Openned[namespace] === "undefined") {
            UgCore.Openned[namespace] = {};
        }

        if (typeof UgCore.Openned[namespace][name] != "undefined") {
            UgCore.close(namespace, name);
        }

        if (typeof UgCore.Pos[namespace] === "undefined") {
            UgCore.Pos[namespace] = {};
        }

        if (typeof data.type === "undefined") {
            data.type = "default";
        }

        if (typeof data.align === "undefined") {
            data.align = "top-left";
        }

        data._index = UgCore.Focus.length;
        data._namespace = namespace;
        data._name = name;

        UgCore.Openned[namespace][name] = data;
        UgCore.Pos[namespace][name] = 0;

        UgCore.Focus.push({
            namespace: namespace,
            name: name,
        });

        document.onkeyup = function (key) {
            if (key.which === 27) {
                // Escape key
                SendMessage(UgCore.ResourceName, "menu_cancel", data);
            } else if (key.which === 13) {
                // Enter key
                SendMessage(UgCore.ResourceName, "menu_submit", data);
            }
        };

        UgCore.render();
    };

    UgCore.close = function (namespace, name) {
        delete UgCore.Openned[namespace][name];

        for (let i = 0; i < UgCore.Focus.length; i++) {
            if (UgCore.Focus[i].namespace === namespace && UgCore.Focus[i].name === name) {
                UgCore.Focus.splice(i, 1);
                break;
            }
        }

        UgCore.render();
    };

    UgCore.render = function () {
        let menuContainer = $("#menus")[0];
        $(menuContainer).find('button[name="submit"]').unbind("click");
        $(menuContainer).find('button[name="cancel"]').unbind("click");
        $(menuContainer).find('[name="value"]').unbind("input propertychange");
        menuContainer.innerHTML = "";
        $(menuContainer).hide();

        for (let namespace in UgCore.Openned) {
            for (let name in UgCore.Openned[namespace]) {
                let menuData = UgCore.Openned[namespace][name];
                let view = JSON.parse(JSON.stringify(menuData));

                switch (menuData.type) {
                    case "default": {
                        view.isDefault = true;
                        break;
                    }

                    case "big": {
                        view.isBig = true;
                        break;
                    }

                    default:
                        break;
                }

                let menu = $(Mustache.render(MenuTpl, view))[0];

                $(menu).css("z-index", 1000 + view._index);

                $(menu)
                    .find('button[name="submit"]')
                    .click(
                        function () {
                            UgCore.submit(this.namespace, this.name, this.data);
                        }.bind({ namespace: namespace, name: name, data: menuData })
                    );

                $(menu)
                    .find('button[name="cancel"]')
                    .click(
                        function () {
                            UgCore.cancel(this.namespace, this.name, this.data);
                        }.bind({ namespace: namespace, name: name, data: menuData })
                    );

                $(menu)
                    .find('[name="value"]')
                    .bind(
                        "input propertychange",
                        function () {
                            this.data.value = $(menu).find('[name="value"]').val();
                            UgCore.change(this.namespace, this.name, this.data);
                        }.bind({ namespace: namespace, name: name, data: menuData })
                    );

                if (typeof menuData.value != "undefined") {
                    $(menu).find('[name="value"]').val(menuData.value);
                }

                menuContainer.appendChild(menu);
            }
        }

        $(menuContainer).show();
        $("#inputText").Focus();
    };

    UgCore.submit = function (namespace, name, data) {
        SendMessage(UgCore.ResourceName, "menu_submit", data);
    };

    UgCore.cancel = function (namespace, name, data) {
        SendMessage(UgCore.ResourceName, "menu_cancel", data);
    };

    UgCore.change = function (namespace, name, data) {
        SendMessage(UgCore.ResourceName, "menu_change", data);
    };

    UgCore.getFocused = function () {
        return UgCore.Focus[UgCore.Focus.length - 1];
    };

    window.onData = (data) => {
        switch (data.action) {
            case "openMenu": {
                UgCore.open(data.namespace, data.name, data.data);
                break;
            }

            case "closeMenu": {
                UgCore.close(data.namespace, data.name);
                break;
            }
        }
    };

    window.onload = function (e) {
        window.addEventListener("message", (event) => {
            onData(event.data);
        });
    };
})();