import Templates from "./templates.js";
// (window as any).Templates = Templates;
document.addEventListener("DOMContentLoaded", async () => {
    const main_template_import = document.body.querySelector(":scope > template-import#main");
    if (!main_template_import)
        return;
    // 
    const view_template_import = main_template_import.querySelector("template-import#view");
    if (!view_template_import)
        return;
    view_template_import.setAttribute("src", "/assets/templates/root" + window.location.pathname);
    // 
    Templates.loadImport(main_template_import);
});
