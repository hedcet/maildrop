const axios = require("axios");
const moment = require("moment");
const url = require("url");

module.exports = {
  // api base url & path
  apiHost: "https://api.maildrop.cc",
  apiPath: "/v2/mailbox",

  // api key for 'x-api-key' header
  apiKey: "",

  // api key expiry
  apiKeyExpiry: "1970-01-01",

  /**
   * async
   * @function deleteMail
   * @param {String} email="" required, email id
   * @param {String} id="" required, individual email object id
   * @return {Object} like this { deleted: true }
   */
  async deleteMail(email = "", id = "") {
    if (!email || !id) throw new Error("invalid args");

    const alias = email.replace(/@maildrop.cc/, "");
    const options = { headers: { "x-api-key": await this.getApiKey() } };

    const { data } = await axios.delete(
      url.resolve(this.apiHost, `${this.apiPath}/${alias}/${id}`),
      options
    );

    return data;
  },

  /**
   * async
   * @function fetchMails
   * @param {String} email="" required, email id
   * @return {Object[]} like this { id, from, to, subject, date, body, html }[]
   */
  async fetchMails(email = "") {
    if (!email) throw new Error("email required");

    const alias = email.replace(/@maildrop.cc/, "");
    const mails = [];
    const options = { headers: { "x-api-key": await this.getApiKey() } };

    const { data: inbox } = await axios.get(
      url.resolve(this.apiHost, `${this.apiPath}/${alias}`),
      options
    );

    for (const message of inbox.messages) {
      const { data } = await axios.get(
        url.resolve(this.apiHost, `${this.apiPath}/${alias}/${message.id}`),
        options
      );

      // contains raw body & html
      mails.push(data);
    }

    // { id, from, to, subject, date, body, html }[]
    return mails;
  },

  /**
   * async
   * @function getApiKey
   * @return {String} api key for 'x-api-key' header
   */
  async getApiKey() {
    if (!this.apiKey || moment().isAfter(this.apiKeyExpiry)) {
      const { data: html } = await axios.get(this.webHost);
      const { data: js } = await axios.get(
        url.resolve(this.webHost, html.match(/([^"]+static\/js\/main[^"]+)/)[1])
      );
      this.apiKey = js.match(/x-api-key":"([^"]+)/)[1];
      this.apiKeyExpiry = moment().add(60, "minutes").toDate(); // every 1 hour renew apiKey logic
    }
    return this.apiKey;
  },

  // to get web html & js
  webHost: "https://maildrop.cc",
};
