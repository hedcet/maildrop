const axios = require("axios");
const bigInteger = require("big-integer");
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
   * @function decryptEmailId
   * @param  {String} email="" required, email id
   * @return {String} like this hello@maildrop.cc
   */
  decryptEmailId(email = "", modifier = "") {
    const alias = email.replace(/@maildrop.cc$/, "");

    return `${bigInteger(
      bigInteger(alias.replace(/^D\-/i, "").toLowerCase(), 36)
        .subtract(modifier || this.modifier)
        .toString()
        .substr(1)
        .split("")
        .reverse()
        .join("")
    ).toString(36)}@maildrop.cc`;
  },

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
    const options = { headers: { "x-api-key": await this.getApiKey() } };

    const { data } = await axios.delete(
      url.resolve(this.apiHost, `${this.apiRelativePath}/${alias}/${id}`),
      options
    );

    return data;
  },

  /**
   * @function encryptEmailId
   * @param  {String} email="" required, email id
   * @return {String} like this D-1mvdio9@maildrop.cc
   */
  encryptEmailId(email = "", modifier = "") {
    const alias = email.replace(/@maildrop.cc$/, "");

    return `D-${bigInteger(
      `1${bigInteger(alias.replace(/[^0-9a-z]/gi, "").toLowerCase(), 36)
        .toString()
        .split("")
        .reverse()
        .join("")}`
    )
      .add(modifier || this.modifier)
      .toString(36)}@maildrop.cc`;
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

    const { data: inbox } = await axios.get(
      url.resolve(this.apiHost, `${this.apiRelativePath}/${alias}`),
      options
    );

    for (const message of inbox.messages) {
      const { data } = await axios.get(
        url.resolve(
          this.apiHost,
          `${this.apiRelativePath}/${alias}/${message.id}`
        ),
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
   * @param {Boolean} force=false optional, for forceful refresh
   * @return {String} api key for x-api-key header
   */
  async getApiKey(force = false) {
    if (force || !this.apiKey || this.apiKeyExpiry < new Date().getTime()) {
      const { data: html } = await axios.get(this.webHost);
      const { data: js } = await axios.get(
        url.resolve(this.webHost, html.match(/([^"]+static\/js\/main[^"]+)/)[1])
      );
      this.apiKey = js.match(/x-api-key":"([^"]+)/)[1];
      this.apiKeyExpiry = new Date().getTime() + 6 * 60 * 60 * 1000; // 6 hour expiration
    }
    return this.apiKey;
  },

  // for de/encrypting
  modifier: "20190422",

  // to get web html & js
  webHost: "https://maildrop.cc",
};
