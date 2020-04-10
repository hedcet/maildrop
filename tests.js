const maildrop = require("./main.js");

(async () => {
  const email = "linto@maildrop.cc";
  console.log("email", email);

  // test encrypting
  console.log(
    "==========",
    "encrypting",
    email,
    "to",
    maildrop.encryptEmailId(email, "20200101"),
    "=========="
  );

  // test decrypting
  console.log(
    "==========",
    "decrypting",
    maildrop.encryptEmailId(email, "20200101"),
    "to",
    maildrop.decryptEmailId(
      maildrop.encryptEmailId(email, "20200101"),
      "20200101"
    ),
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
