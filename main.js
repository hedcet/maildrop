const axios = require("axios");
const moment = require("moment");
const url = require("url");

module.exports = {
  apiHost: "https://api.maildrop.cc",
  apiKey: "",
  apiKeyExpiry: "1970-01-01",
  async deleteMail(mailBoxId = "", mailId = "") {
    if (!mailBoxId || !mailId) throw new Error("mailBoxId & mailId required");
    const options = { headers: { "x-api-key": await this.getApiKey() } };
    const { data } = await axios.delete(
      url.resolve(this.apiHost, `/v2/mailbox/${mailBoxId}/${mailId}`),
      options
    );
    return data;
  },
  async getApiKey() {
    if (!this.apiKey || moment().isAfter(this.apiKeyExpiry)) {
      const { data: html } = await axios.get(this.webHost);
      const { data: js } = await axios.get(
        url.resolve(this.webHost, html.match(/([^"]+static\/js\/main[^"]+)/)[1])
      );
      this.apiKey = js.match(/x-api-key":"([^"]+)/)[1];
      this.apiKeyExpiry = moment().add(60, "minutes").toDate();
    }
    return this.apiKey;
  },
  async getMails(mailBoxId = "") {
    if (!mailBoxId) throw new Error("mailBoxId required");
    const mails = [];
    const options = { headers: { "x-api-key": await this.getApiKey() } };
    const { data: inbox } = await axios.get(
      url.resolve(this.apiHost, `/v2/mailbox/${mailBoxId}`),
      options
    );
    for (const message of inbox.messages) {
      const { data } = await axios.get(
        url.resolve(this.apiHost, `/v2/mailbox/${mailBoxId}/${message.id}`),
        options
      );
      mails.push(data);
    }
    return { apiKey: this.apiKey, mails, mailBoxId };
  },
  webHost: "https://maildrop.cc",
};
