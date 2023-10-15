"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var html;
(function (html) {
    function renewScriptElement(script_element) {
        let new_script_element = document.createElement("script");
        const attributes = Array.from(script_element.attributes);
        for (let i = 0; i < attributes.length; ++i) {
            let attribute = attributes[i];
            new_script_element.setAttribute(attribute.name, attribute.value);
        }
        let new_script_content = document.createTextNode(script_element.innerHTML);
        new_script_element.appendChild(new_script_content);
        script_element.parentNode?.replaceChild(new_script_element, script_element);
    }
    html.renewScriptElement = renewScriptElement;
    // 
    function renewContainerScripts(container, filter) {
        if (container instanceof HTMLScriptElement
            && (!(filter instanceof Function) || filter(container) === true)) {
            renewScriptElement(container);
        }
        else {
            const childnodes = Array.from(container.childNodes);
            for (let i = 0; i < childnodes.length; ++i) {
                let childnode = childnodes[i];
                renewContainerScripts(childnode, filter);
            }
        }
    }
    html.renewContainerScripts = renewContainerScripts;
})(html || (html = {}));
// 
exports.default = html;
