const TicketModel= require("../models/ticket.model.js")
const logger = require("../utils/logger.js")

class TicketManager {
  async getTicketById(id) {
    try {
      const ticket = await TicketModel.findById(id);
      if (!ticket) {
        logger.warning('ticket not found')
        return null;
      }
      return ticket;
    } catch (error) {
      logger.error('Error geting ticket getTicketById', error)
    }
  }
}

module.exports = TicketManager;
