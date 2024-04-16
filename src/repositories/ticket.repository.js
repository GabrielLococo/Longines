const TicketModel = require("../models/ticket.model.js")

class TicketRepository {
  async getTicketById(id) {
    try {
      const ticket = await TicketModel.findById(id);
      if (!ticket) {
        console.log('Ticket not found');
        return null;
      }
      return ticket;
    } catch (error) {
      console.log('error getting ticket. getTicketById', error);
      throw error;
    }
  }
}
module.exports = TicketRepository;