module.exports = async (state) => {
    console.log("[Client State]", state);
    if (state === "CONFLICT" || state === "DISCONNECTED") client.forceRefocus(); // Force it to keep the current session
};
