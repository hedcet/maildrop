// npm install
// npx node@12 ./tests.js
const maildrop = require("./main.js");

(async () => {
  const email = "linto@maildrop.cc";
  console.log({ email, xApiKey: await maildrop.getApiKey() });

  // test fetchMails
  const mails = await maildrop.fetchMails(email);
  console.log(`${mails.length || "zero"} mails`);

  // log mails
  for (const mail of mails)
    console.log(`==========\n${JSON.stringify(mail, null, 2)}\n==========`);

  // test mail delete
  // for (const mail of mails)
  //   console.log(await maildrop.deleteMail(email, mail.id));
})();
