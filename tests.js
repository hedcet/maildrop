const maildrop = require("./main.js");

(async () => {
  const mails = await maildrop.getMails("linto@maildrop.cc");
  console.log(`${mails.length || "zero"} mails`);
  for (const mail of mails)
    console.log(`==========\n${JSON.stringify(mail, null, 2)}\n==========`);
  // for (const mail of mails)
  //   console.log(await maildrop.deleteMail("linto", mail.id));
})();
