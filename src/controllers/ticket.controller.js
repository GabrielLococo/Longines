const TicketModel= require("../models/ticket.model.js");

class TicketManager {
  async getTicketById(id) {
    try {
      const ticket = await TicketModel.findById(id);
      if (!ticket) {
        console.log('Ticket not find');
        return null;
      }
      return ticket;
    } catch (error) {
      console.log('Error geting ticket getTicketById', error);
    }
  }
}

module.exports = TicketManager;
