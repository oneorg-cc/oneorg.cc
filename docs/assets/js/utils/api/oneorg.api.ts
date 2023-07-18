import ApiUtil from "../api";

const OneOrgApiUtil = new ApiUtil(window.location.hostname == "localhost" ? "https://localhost:1130" : "https://api.oneorg.cc/", (endpoint, options) => {
    
});

export default class OneOrg {

    static readonly authenticate = {

        withGithub: async (code: string) => {
            const response = await OneOrgApiUtil.request("POST /authentication/github", { queries: { code: code } });

            console.log(response);
        }

    }

}