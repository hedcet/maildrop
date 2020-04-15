const fetch = require("cross-fetch");
const url = require("url");

module.exports = {
  // api base url & path
  apiHost: "https://api.maildrop.cc",
  apiRelativePath: "/v2/mailbox",

  // api key for 'x-api-key' header
  apiKey: "",

  // api key expiry timestamp
  apiKeyExpiry: 0,

  /**
   * async
   * @function deleteMail
   * @param {String} email="" required, email id
   * @param {String} id="" required, individual email object id
   * @return {Object} like this { deleted: true }
   */
  async deleteMail(email = "", id = "") {
    if (!email || !id) throw new Error("invalid args");

    const alias = email.replace(/@maildrop.cc$/, "");
    const options = {
      headers: { "x-api-key": await this.getApiKey() },
      method: "DELETE",
    };

    return await (
      await fetch(
        url.resolve(this.apiHost, `${this.apiRelativePath}/${alias}/${id}`),
        options
      )
    ).json();
  },

  /**
   * async
   * @function fetchMails
   * @param {String} email="" required, email id
   * @return {Object[]} like this { id, from, to, subject, date, body, html }[]
   */
  async fetchMails(email = "") {
    if (!email) throw new Error("email required");

    const alias = email.replace(/@maildrop.cc$/, "");
    const mails = [];
    const options = { headers: { "x-api-key": await this.getApiKey() } };

    const inbox = await (
      await fetch(
        url.resolve(this.apiHost, `${this.apiRelativePath}/${alias}`),
        options
      )
    ).json();

    for (const message of inbox.messages) {
      const data = await (
        await fetch(
          url.resolve(
            this.apiHost,
            `${this.apiRelativePath}/${alias}/${message.id}`
          ),
          options
        )
      ).json();

      // contains raw body & html
      mails.push(data);
    }

    // { id, from, to, subject, date, body, html }[]
    return mails;
  },

  /**
   * async
   * @function getApiKey
   * @param {Boolean} force=false optional, for forceful refresh
   * @return {String} api key for x-api-key header
   */
  async getApiKey(force = false) {
    if (force || !this.apiKey || this.apiKeyExpiry < new Date().getTime()) {
      const html = await (await fetch(this.webHost)).text();

      const js = await (
        await fetch(
          url.resolve(
            this.webHost,
            html.match(/([^"]+static\/js\/main[^"]+)/)[1]
          )
        )
      ).text();

      this.apiKey = js.match(/x-api-key":"([^"]+)/)[1];
      this.apiKeyExpiry = new Date().getTime() + 6 * 60 * 60 * 1000; // 6 hour expiration
    }

    return this.apiKey;
  },

  // to get web html & js
  webHost: "https://maildrop.cc",
};
