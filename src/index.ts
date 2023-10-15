import apiserver from "./api-server";
import Locale from "./locale";

// 

(async () => {
    await Locale.initialize();

    // 

    apiserver.listen(1024 + 106);
})();