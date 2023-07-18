class _Templates extends EventTarget {

    ATTRIBUTES = {
        TEMPLATE_IMPORT_ID: "template-import-id",
        LINKED_TEMPLATE_IMPORT_ID:"linked-template-import-id"
    };

    ELEMENTS = {
        TEMPLATE_IMPORT: "template-import",
        TEMPLATE_TOKEN: "template-token"
    }

    // 

    isTemplateImport(node: Node): node is HTMLElement {
        return node instanceof HTMLElement ? node.nodeName.toLowerCase() == this.ELEMENTS.TEMPLATE_IMPORT.toLowerCase() : false;
    }

    // 

    #setImportId(element: HTMLElement, id: string) {
        element.setAttribute(this.ATTRIBUTES.TEMPLATE_IMPORT_ID, `${id}`);
    }

    getImportId(element: HTMLElement) {
        return element.getAttribute(this.ATTRIBUTES.TEMPLATE_IMPORT_ID);
    }

    // 

    setLinkedImportId(element: HTMLElement, id: string) {
        element.setAttribute(this.ATTRIBUTES.LINKED_TEMPLATE_IMPORT_ID, `${id}`);
    }

    getLinkedImportId(element: HTMLElement) {
        return element.getAttribute(this.ATTRIBUTES.LINKED_TEMPLATE_IMPORT_ID);
    }

    removeAllImportGarbagesById(id: string | null) {
        document.querySelectorAll(`[${this.ATTRIBUTES.LINKED_TEMPLATE_IMPORT_ID}="${id}"]`).forEach(garbage_element => { garbage_element.remove(); });
    }

    // 

    async loadImport(template_import: HTMLElement, depth=0) {
        const import_id = Date.now().toString(16) + "." + depth;

        // 

        if(!this.isTemplateImport(template_import)) throw new Error("Unable to load template : invalid element passed.");

        if(!template_import.hasAttribute("src")) throw new Error("Unable to load template : missing path.");

        // 

        const template_source = template_import.getAttribute("src") as string;

        let template_url = new URL(window.location.href);
            template_url.pathname = template_source;

        const fetch_template_response = await fetch(template_url);

        if(fetch_template_response.status == 404) throw new Error("Unable to load template : template not found.");
        else if(fetch_template_response.status != 200) throw new Error("Unable to load template : template not fetched.");

        // 

        await this.clearImport(template_import);
        this.#setImportId(template_import, import_id);

        // 

        let template_html = await fetch_template_response.text();

        template_import.querySelectorAll(":scope > " + this.ELEMENTS.TEMPLATE_TOKEN).forEach(template_token => {
            template_html = template_html.replace(new RegExp("{{" + this.ELEMENTS.TEMPLATE_TOKEN + ":" + template_token.id + "}}"), template_token.innerHTML);
        });
        template_html = template_html.replace(new RegExp("{{" + this.ELEMENTS.TEMPLATE_TOKEN + ":(.+)}}"), "");

        // 

        template_import.insertAdjacentHTML("beforeend", template_html);

        let template = template_import.querySelector(":scope > template") as HTMLTemplateElement;
        if(!template) throw new Error("Unable to load template : HTMLTemplateElement not found.");
        
        template.remove();

        this.setLinkedImportId(template, import_id);

        const template_tokens = Array.from<HTMLElement>(template_import.querySelectorAll(":scope > " + this.ELEMENTS.TEMPLATE_TOKEN));
        for(let i = 0; i < template_tokens.length; ++i) {
            let template_token = template_tokens[i];
            
            const template_tokens_to_replace = Array.from(template.content.querySelectorAll(`${this.ELEMENTS.TEMPLATE_TOKEN}[id="${template_token.id}"]`));
            for(let j = 0; j < template_tokens_to_replace.length; ++j) {
                await (async () => {
                    let template_token_to_replace = template_tokens_to_replace[j];
    
                    if(!(template_token_to_replace instanceof HTMLElement)) return;
                    if(this.isTemplateImport(template_token_to_replace.parentElement as any)) return;
    
                    await mapChildNodesCopy(template_token, async (childnode) => {
                        if(!(childnode instanceof Node)) return;
    
                        if(childnode instanceof HTMLElement) this.setLinkedImportId(childnode, import_id);
    
                        template_token_to_replace.after(childnode);
                    });

                    template_token_to_replace.remove();
                })();
            }
        }

        // 

        let template_head = template.content.querySelector("template-head");
        if(template_head instanceof HTMLElement) {
            await mapChildNodesCopy(template_head, async (childnode) => {
                if(!(childnode instanceof Node)) return;

                if(childnode instanceof HTMLElement) this.setLinkedImportId(childnode, import_id);

                document.head.appendChild(childnode);

                await renewContainerScripts(childnode);
                await this.loadImports(childnode, depth+1);
            });
        }

        // 

        let template_body = template.content.querySelector("template-body");
        if(template_body instanceof HTMLElement) {
            await mapChildNodesCopy(template_body, async (childnode) => {
                if(!(childnode instanceof Node)) return;

                if(childnode instanceof HTMLElement) this.setLinkedImportId(childnode, import_id);
                
                template_import.after(childnode);
                
                await renewContainerScripts(childnode);
                await this.loadImports(childnode, depth+1);
            });
        }

        // 

        this.dispatchEvent(new CustomEvent("template-import:loaded", { detail: { import: template_import, id: import_id } }));
    }

    //

    async loadImports(container: Node =document, depth: number =0) {
        if(this.isTemplateImport(container)) await this.loadImport(container, depth);
        else {
            const childnodes = Array.from(container.childNodes);
            for(let i = 0; i < childnodes.length; ++i) {
                let childnode = childnodes[i];
                await this.loadImports(childnode, depth);
            }
        }
    }

    //

    async clearImport(template_import: HTMLElement) {
        this.removeAllImportGarbagesById(this.getImportId(template_import));
    }

}

const Templates = new _Templates();

// 

async function mapChildNodesCopy(container: HTMLElement, childnode_mapper: (childnode: Node) => (void | Promise<void>)) {
    const childnodes = Array.from(container.childNodes);
    for(let i = 0; i < childnodes.length; ++i) {
        let childnode_copy = childnodes[i].cloneNode(true);
        await childnode_mapper(childnode_copy);
    }
}

async function renewScriptElement(script_element: HTMLScriptElement) {
    let new_script_element = document.createElement("script");

    const attributes = Array.from(script_element.attributes);
    for(let i = 0; i < attributes.length; ++i) {
        let attribute = attributes[i];
        new_script_element.setAttribute(attribute.name, attribute.value);
    }

    let new_script_content = document.createTextNode(script_element.innerHTML);
    new_script_element.appendChild(new_script_content);

    new_script_element.setAttribute("template-renewed", "");

    script_element.after(new_script_element);
    script_element.remove();
}

async function renewContainerScripts(container: Node) {
    if(container instanceof HTMLScriptElement) await renewScriptElement(container);
    else {
        const childnodes = Array.from(container.childNodes);
        for(let i = 0; i < childnodes.length; ++i) {
            let childnode = childnodes[i];
            await renewContainerScripts(childnode);
        }
    }
}

// function getRandInt(min, max) {
//     return Math.floor(Math.random() * (Math.ceil(max) - Math.floor(min) + 1)) + min;
// }

// 

export default Templates;