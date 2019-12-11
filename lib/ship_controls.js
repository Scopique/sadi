const buttons = [
  {
    emoji:"⏪",
    run:(user, message)=>{
      //When clicked, we need to take the
      //info of the current embed and move it
      //"back" one item. We build a new embed
      //and return it here for the edit
      let newEmbed = message.embed;
      message.edit({embed:newEmbed})
    }
  },
  {
    emoji:"⏩",
    run:(user, message)=>{
      //When clicked, we need to take the
      //info of the current embed and move it
      //"ahead" one item. We build a new embed
      //and return it here for the edit
      let newEmbed = message.embed;
      message.edit({embed:newEmbed})
    }
  }
]

module.exports = {
  buttons: buttons
}