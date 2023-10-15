"use strict";
/*
 * Source : https://dev.w3.org/SVG/modules/ref/master/ref2.js
 */
const svgns = "http://www.w3.org/2000/svg";
const xlinkns = "http://www.w3.org/1999/xlink";
// 
function parseParameters() {
    const defs = document.getElementsByTagName("defs")[0];
    const refs = {};
    const refList = defs.getElementsByTagName("ref");
    for (let i = 0; i < refList.length; ++i) {
        const ref = refList.item(i);
        const id = ref.getAttribute("id");
        const name = ref.getAttribute("param");
        let default_value = ref.getAttribute("default");
        if (!default_value) {
            if (ref.firstChild)
                default_value = ref.firstChild.nodeValue;
            else
                default_value = "";
        }
        refs[name] = [ref, id, default_value];
    }
    const href = document.defaultView?.location.href;
    if (-1 != href.indexOf("?")) {
        const href_parameters = href.split("?")[1].split(/&|;/);
        for (let i = 0, pLen = href_parameters.length; i < pLen; ++i) {
            const values = href_parameters[i].split("=");
            refs[unescape(values[0])][2] = unescape(values[1]);
        }
    }
    if (document.defaultView?.frameElement) {
        const parameters = document.defaultView.frameElement.getElementsByTagName("param");
        for (let i = 0, iLen = parameters.length; iLen > i; i++)
            refs[parameters[i].getAttribute("name")][2] = parameters[i].getAttribute("value");
    }
    const parameters = Object.values(refs);
    for (let i = 0; i < parameters.length; ++i)
        parseReferences(parameters[i][1], parameters[i][2]);
}
// 
function parseReferences(id, value) {
    const elements = document.documentElement.getElementsByTagName("*");
    for (let i = 0, iLen = elements.length; iLen > i; i++) {
        const element = elements.item(i);
        for (let j = 0, aLen = element.attributes.length; j < aLen; ++j) {
            const attribute = element.attributes[j];
            if (attribute && -1 != attribute.value.indexOf("#" + id)) {
                if ("tref" == element.localName)
                    element.parentNode?.replaceChild(document.createTextNode(value), element);
                else
                    element.setAttributeNS(attribute.namespaceURI, attribute.name, value);
            }
        }
    }
}
// 
parseParameters();
