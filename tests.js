const maildrop = require("./main.js");

(async () => {
  const email = "linto@maildrop.cc";
  const modifier = "20190422";

  console.log({ email, modifier });

  // test encrypting
  console.log(
    "==========",
    "encrypting",
    email,
    "to",
    maildrop.encryptEmailId(email, modifier),
    "=========="
  );

  // test decrypting
  console.log(
    "==========",
    "decrypting",
    maildrop.encryptEmailId(email, modifier),
    "to",
    maildrop.decryptEmailId(maildrop.encryptEmailId(email, modifier), modifier),
    "=========="
  );

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
