module.exports = {
    cmd: "ping",
    description: "A simple ping to see if the server responds.",
    args: false,
    usage: "ping",
    execute( message, args, settings) {
        message.channel.send("Pong!");
        console.log(`${message.author.username} just sent a ping command in the ${message.channel.name} channel`);
    },
}