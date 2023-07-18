import ApiUtil from "../api";
const OneOrgApiUtil = new ApiUtil(window.location.hostname == "localhost" ? "https://localhost:1130" : "https://api.oneorg.cc/", (endpoint, options) => {
});
export default class OneOrg {
    static authenticate = {
        withGithub: async (code) => {
            const response = await OneOrgApiUtil.request("POST /authentication/github", { queries: { code: code } });
            console.log(response);
        }
    };
}
