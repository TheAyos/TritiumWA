module.exports = async (Tritium, gChat) => {
  await sleep(5000);
  const chat = await Tritium.getChat(gChat.id);
  const grpMems = chat.groupMetadata.participants.length - 1;
  console.log(Tritium.ccolor("added to fucking group", "red"), chat.name, grpMems);
  console.log(Tritium.minMems);
  if (grpMems < Tritium.minMems) {
    if (chat.id.startsWith(Tritium.config.youb_id.split("@")[0])) console.log("nrmlly would'nt bother !");
    // return;
    console.log(Tritium.ccolor("leaving group", "red"), chat.name, grpMems);
    await Promise.all([
      Tritium.sendText(chat.id, `This group has only ${grpMems} members, minimum is ${Tritium.minMems}.`),
      Tritium.leaveGroup(chat.id),
      Tritium.deleteChat(chat.id),
    ]);
    console.log(Tritium.ccolor("left group YEEES", "red"), chat.name, grpMems);
  } else {
    await Tritium.sendText(
      chat.groupMetadata.id,
      `Wassup pepol 😁, i'm *Tritium Bot*. Use ${Tritium.prefix}help to see the usable commands` +
        `\nThanks for adding me to *${chat.contact.name}*.`,
    );
  }
};

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
