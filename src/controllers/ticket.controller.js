const TicketModel= require("../models/ticket.model.js");

class TicketManager {
  async getTicketById(id) {
    try {
      const ticket = await TicketModel.findById(id);
      if (!ticket) {
        req.logger.warning('ticket not found')
        return null;
      }
      return ticket;
    } catch (error) {
      req.logger.error('Error geting ticket getTicketById', error)
    }
  }
}

module.exports = TicketManager;
