if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js")
            .then(() => console.log("PWA Ready"))
            .catch(err => console.error("PWA Error", err));
    });
}
