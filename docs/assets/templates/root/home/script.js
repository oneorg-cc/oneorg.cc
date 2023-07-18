"use strict";
(async () => {
    const open_dashboard_button = document.querySelector("div.button.open-dashboard");
    if (!open_dashboard_button)
        return;
    open_dashboard_button.addEventListener("click", (event) => {
        window.location.pathname = "/login/";
    });
})();
